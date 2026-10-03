import type { Cevaplar, DilekceTuru, TaslakCiktisi } from "@/lib/dilekce-turleri/tipler";
import { tarihYaz, tek, tutarYaz } from "@/lib/dilekce-turleri/ortak";
import { DilektoHatasi } from "@/lib/hatalar";
import { ciktiyiDenetle, TaslakSemasi } from "./dogrula";
import { saglayiciSec } from "./saglayicilar";

const DENEME_SAYISI = 2;

/** Yapay zekâ olmadan, yalnızca kullanıcının cevaplarından örnek taslak */
function ornekTaslak(test: Cevaplar, hikaye: Cevaplar): TaslakCiktisi {
  const urun = tek(hikaye, "urun");
  const tutar = tutarYaz(tek(test, "tutar"));
  return {
    konuOzeti: `${urun} ile ilgili uyuşmazlık hakkında başvuru`,
    olaylar: [
      `${tarihYaz(tek(test, "tarih"))} tarihinde karşı taraf ${tek(hikaye, "satici")} üzerinden ${urun} satın aldım ve ${tutar} ödedim.`,
      tek(hikaye, "olay"),
      tek(hikaye, "bildirim") === "evet"
        ? "Durumu karşı tarafa bildirdim; ancak sorunum bugüne kadar çözülmedi."
        : "Sorunun çözülmesi için hakem heyetinize başvurmak zorunda kaldım.",
    ],
    talepMetni: `Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri ${tutar} olan başvurumun kabulü ile talebim doğrultusunda karar verilmesini saygılarımla arz ve talep ederim.`,
    ekMevzuat: [],
  };
}

/**
 * Dilekçenin yapay zekâ ile yazılan bölümlerini üretir. Çıktı denetimden
 * geçmezse sorunlar belirtilerek bir kez daha denenir.
 */
export async function taslakUret(
  tur: DilekceTuru,
  test: Cevaplar,
  hikaye: Cevaplar,
): Promise<{ cikti: TaslakCiktisi; saglayici: string }> {
  const saglayici = saglayiciSec();
  const secilebilir = tur.yapayZeka.secilebilirMevzuat(test, hikaye);
  let mesaj = tur.yapayZeka.kullaniciMesaji(test, hikaye);
  let sonSorunlar: string[] = [];

  for (let i = 0; i < DENEME_SAYISI; i++) {
    let ham: unknown;
    try {
      ham = await saglayici.uret({
        sistem: tur.yapayZeka.sistemTalimati,
        mesaj,
        sema: TaslakSemasi,
        ornekYanit: () => ornekTaslak(test, hikaye),
      });
    } catch (e) {
      // Bozuk JSON gibi geçici sorunlarda bir kez daha dene
      if (e instanceof DilektoHatasi && e.kod === "YZ-DENETIM" && i < DENEME_SAYISI - 1) {
        sonSorunlar = [e.message];
        continue;
      }
      throw e;
    }
    const denetim = ciktiyiDenetle(ham, secilebilir);
    if (denetim.tamam) return { cikti: denetim.cikti, saglayici: saglayici.ad() };
    sonSorunlar = denetim.sorunlar;
    mesaj += `\n\nÖnceki yanıtın şu kurallara uymadı, lütfen düzelterek baştan yaz:\n- ${denetim.sorunlar.join("\n- ")}`;
  }
  throw new DilektoHatasi("YZ-DENETIM", "Yapay zekâ çıktısı denetimden geçmedi.", sonSorunlar);
}
