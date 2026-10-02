// Ücretsiz önizleme için dilekçe taslağı oluşturur.

import { taslakUret, YapayZekaHatasi } from "@/lib/ai";
import { depo } from "@/lib/depo";
import { turGetir } from "@/lib/dilekce-turleri";
import { cevaplariDogrula } from "@/lib/dilekce-turleri/ortak";
import type { Cevaplar } from "@/lib/dilekce-turleri/tipler";

export const maxDuration = 60;

function hata(mesaj: string, durum: number) {
  return Response.json({ hata: mesaj }, { status: durum });
}

export async function POST(istek: Request) {
  let govde: { tur?: string; test?: unknown; hikaye?: unknown };
  try {
    govde = await istek.json();
  } catch {
    return hata("Geçersiz istek.", 400);
  }

  const tur = turGetir(String(govde.tur ?? ""));
  if (!tur) return hata("Bilinmeyen dilekçe türü.", 400);

  let test, hikaye;
  try {
    const hamTest = (govde.test ?? {}) as Record<string, unknown>;
    test = cevaplariDogrula(tur.testSorulari(hamTest as Cevaplar), hamTest);
    hikaye = cevaplariDogrula(tur.hikayeSorulari(test), govde.hikaye);
  } catch (e) {
    return hata((e as Error).message, 400);
  }

  if (tur.uygunluk(test).durum === "uygun-degil") {
    return hata("Verdiğiniz cevaplara göre bu başvuru uygun görünmüyor.", 400);
  }

  const d = depo();
  const sinir = Number(process.env.GUNLUK_TASLAK_SINIRI || 100);
  if ((await d.bugunOlusturulan()) >= sinir) {
    return hata("Bugün çok yoğunuz. Lütfen yarın tekrar deneyin.", 429);
  }

  try {
    const { cikti, saglayici } = await taslakUret(tur, test, hikaye);
    const kayit = await d.olustur({ tur: tur.id, test, hikaye, cikti, saglayici, fiyat: tur.fiyat });
    return Response.json({ id: kayit.id });
  } catch (e) {
    console.error("Taslak oluşturulamadı:", e);
    const mesaj =
      e instanceof YapayZekaHatasi
        ? "Dilekçeniz şu an hazırlanamadı. Lütfen birkaç dakika sonra tekrar deneyin."
        : "Beklenmeyen bir sorun oldu. Lütfen tekrar deneyin.";
    return hata(mesaj, 503);
  }
}
