import type { Cevaplar, DilekceTuru, TaslakCiktisi } from "@/lib/dilekce-turleri/tipler";
import { ciktiyiDenetle } from "./dogrula";
import { saglayiciSec, YapayZekaHatasi } from "./saglayicilar";

const DENEME_SAYISI = 2;

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
    const ham = await saglayici.uret({ sistem: tur.yapayZeka.sistemTalimati, mesaj });
    const denetim = ciktiyiDenetle(ham, secilebilir);
    if (denetim.tamam) return { cikti: denetim.cikti, saglayici: saglayici.ad };
    sonSorunlar = denetim.sorunlar;
    mesaj += `\n\nÖnceki yanıtın şu kurallara uymadı, lütfen düzelterek baştan yaz:\n- ${denetim.sorunlar.join("\n- ")}`;
  }
  throw new YapayZekaHatasi(`Yapay zekâ çıktısı denetimden geçmedi: ${sonSorunlar.join(" ")}`);
}

export { YapayZekaHatasi };
