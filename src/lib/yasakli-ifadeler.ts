// YASAKLI İFADELER
//
// Dilekto bir "kendi dilekçeni kendin hazırla" aracıdır. Aşağıdaki ifadeler
// sitenin hiçbir yerinde ve yapay zekânın yazdığı hiçbir metinde geçemez.
//
// - Sitenin kaynak metinleri her derlemede taranır (scripts/yasakli-kontrol.mts);
//   bir ifade bulunursa site yayına çıkmaz.
// - Yapay zekânın yazdığı metinler kullanıcıya gösterilmeden önce taranır.
//
// İstisna: "garanti belgesi" ve "garanti süresi" ürün terimleri olarak
// kullanılabilir (ör. "garanti belgesinin fotokopisi").

export type YasakliKural = { ad: string; desen: RegExp };

export const YASAKLI_KURALLAR: YasakliKural[] = [
  { ad: "avukat", desen: /avukat/u },
  { ad: "hukuki danışmanlık", desen: /huku(k|ki|kî)\s*danışman/u },
  { ad: "hukuk bürosu", desen: /hukuk\s*büro/u },
  {
    ad: "garanti (yalnızca 'garanti belgesi' ve 'garanti süresi' serbest)",
    desen: /garanti(?!\s+(belge|süre))/u,
  },
  { ad: "kesin kazanırsınız", desen: /kesin(likle)?\s+kazan/u },
  { ad: "kazanırsınız", desen: /kazanırsınız|kazanacaksınız|kazanmanız\s+kesin/u },
];

/** Yapay zekâya verilecek, okunur biçimdeki liste */
export const YASAKLI_IFADELER_METIN = [
  "avukat (ve türevleri)",
  "hukuki danışmanlık",
  "hukuk bürosu",
  "garanti (yalnızca 'garanti belgesi' ve 'garanti süresi' terimleri serbest)",
  "kesin kazanırsınız / kazanırsınız / kazanacaksınız",
];

export function kucukHarf(metin: string): string {
  return metin.toLocaleLowerCase("tr-TR");
}

/** Metinde geçen yasaklı ifadelerin adlarını döndürür (boşsa temiz). */
export function yasakliBul(metin: string): string[] {
  const kucuk = kucukHarf(metin);
  return YASAKLI_KURALLAR.filter((k) => k.desen.test(kucuk)).map((k) => k.ad);
}
