// Tema tercihi: "sistem" (cihazın ayarı), "acik" ya da "koyu".
// Seçim bu cihazın tarayıcısında (localStorage) saklanır; sunucuya gitmez.
//
// Aynı mantığın bir kopyası, sayfa ilk boyanmadan önce çalışan kısa betikte
// (TEMA_BASLANGIC_BETIGI) bulunur; böylece koyu temada beyaz bir ekran yanıp sönmez.

export type TemaSecimi = "sistem" | "acik" | "koyu";

export const TEMA_ANAHTARI = "dilekto-tema";
export const TEMA_SIRASI: TemaSecimi[] = ["sistem", "acik", "koyu"];

export const TEMA_ADLARI: Record<TemaSecimi, string> = {
  sistem: "Cihaz ayarı",
  acik: "Açık",
  koyu: "Koyu",
};

export function gecerliSecim(deger: string | null | undefined): TemaSecimi {
  return deger === "acik" || deger === "koyu" ? deger : "sistem";
}

/** Seçime ve cihazın koyu mod ayarına göre gerçekte hangi temanın uygulanacağı */
export function etkinTema(secim: TemaSecimi, cihazKoyu: boolean): "light" | "dark" {
  if (secim === "koyu") return "dark";
  if (secim === "acik") return "light";
  return cihazKoyu ? "dark" : "light";
}

/**
 * <head> içinde, sayfa boyanmadan önce çalışır. Hata verirse (ör. çerez/depolama
 * kapalıysa) sessizce açık tema kalır.
 */
export const TEMA_BASLANGIC_BETIGI = `(function(){try{var s=null;try{s=localStorage.getItem('${TEMA_ANAHTARI}')}catch(e){}var d=s==='koyu'||(s!=='acik'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.style.colorScheme=d?'dark':'light'}catch(e){}})();`;
