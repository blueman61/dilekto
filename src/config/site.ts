// Sitenin genel ayarları. Gizli bilgi içermez; gizli anahtarlar yalnızca
// ortam değişkenlerinde (Vercel > Settings > Environment Variables) durur.

export const site = {
  ad: "Dilekto",
  slogan: "Dilekçenizi kendiniz, kolayca hazırlayın",
  eposta: "info@fandora.com.tr",

  // Yasal sayfalarda görünecek satıcı bilgileri. Gerçek ödemeye geçmeden
  // önce doldurulmalıdır (bkz. docs/KURULUM.md).
  satici: {
    unvan: "[Şirket unvanı]",
    adres: "[Açık adres]",
    vergiDairesi: "[Vergi dairesi]",
    vergiNo: "[Vergi numarası]",
    telefon: "[Telefon]",
  },

  // Belgelerin saklanma süreleri
  dilekceSaklamaGun: 30,
  faturaSaklamaSaat: 24,
} as const;

/** Sitenin tam adresi. Alan adı bağlanınca SITE_ADRESI ayarlanır. */
export function siteAdresi(): string {
  const acik = process.env.SITE_ADRESI;
  if (acik) return acik.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Site arama motorlarına açık mı? Deneme döneminde kapalıdır.
 * Açmak için Vercel'de SITE_ARAMA_MOTORLARINA_ACIK=evet yapılır.
 */
export function aramaMotorlarinaAcik(): boolean {
  return process.env.SITE_ARAMA_MOTORLARINA_ACIK === "evet";
}

/** TL tutarını "149 TL" biçiminde yazar. */
export function tlYaz(tutar: number): string {
  return `${tutar.toLocaleString("tr-TR")} TL`;
}
