// Ücretsiz önizleme için dilekçe taslağı oluşturur.

import { ayar } from "@/lib/ayar";
import { taslakUret } from "@/lib/ai";
import { depo } from "@/lib/depo";
import { turGetir } from "@/lib/dilekce-turleri";
import { cevaplariDogrula } from "@/lib/dilekce-turleri/ortak";
import type { Cevaplar } from "@/lib/dilekce-turleri/tipler";
import { hatayiIsle } from "@/lib/hatalar";
import { robotDegilMi } from "@/lib/robot";

export const maxDuration = 60;

function hata(mesaj: string, durum: number, kod?: string) {
  return Response.json({ hata: mesaj, kod }, { status: durum });
}

export async function POST(istek: Request) {
  let govde: { tur?: string; test?: unknown; hikaye?: unknown; robotJetonu?: string };
  try {
    govde = await istek.json();
  } catch {
    return hata("Geçersiz istek.", 400);
  }

  const tur = turGetir(String(govde.tur ?? ""));
  if (!tur) return hata("Bilinmeyen dilekçe türü.", 400);

  if (!(await robotDegilMi(govde.robotJetonu, istek))) {
    return hata("Güvenlik doğrulaması tamamlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.", 403);
  }

  let test: Cevaplar, hikaye: Cevaplar;
  try {
    const hamTest = (govde.test ?? {}) as Cevaplar;
    test = cevaplariDogrula(tur.testSorulari(hamTest), hamTest);
    hikaye = cevaplariDogrula(tur.hikayeSorulari(test), govde.hikaye);
  } catch (e) {
    return hata((e as Error).message, 400);
  }

  if (tur.uygunluk(test).durum === "uygun-degil") {
    return hata("Verdiğiniz cevaplara göre bu başvuru uygun görünmüyor.", 400);
  }

  try {
    const d = depo();
    const sinir = Number(ayar("GUNLUK_TASLAK_SINIRI") || 100);
    if ((await d.bugunOlusturulan()) >= sinir) {
      return hata("Bugün çok yoğunuz. Lütfen yarın tekrar deneyin.", 429);
    }
    const { cikti, saglayici } = await taslakUret(tur, test, hikaye);
    const kayit = await d.olustur({ tur: tur.id, test, hikaye, cikti, saglayici, fiyat: tur.fiyat });
    return Response.json({ id: kayit.id });
  } catch (e) {
    const { kod, mesaj } = hatayiIsle(e, "taslak");
    return hata(mesaj, 503, kod);
  }
}
