// Sitenin bilinen hata türleri. Kullanıcıya kısa bir hata kodu gösterilir;
// böylece bir sorun olduğunda nedeni tahmin etmek gerekmez.

export type HataKodu =
  | "YZ-AYAR" // yapay zekâ anahtarı girilmemiş
  | "YZ-ANAHTAR" // yapay zekâ anahtarı geçersiz
  | "YZ-MODEL" // model adı bulunamadı
  | "YZ-KOTA" // ücretsiz kullanım sınırı doldu / çok fazla istek
  | "YZ-RED" // yapay zekâ isteği reddetti
  | "YZ-DENETIM" // çıktı kurallarımıza uymadı
  | "YZ-BAGLANTI" // yapay zekâ servisine ulaşılamadı
  | "YZ-BOLGE" // yapay zekâ, sitenin çalıştığı bölgede kullanılamıyor
  | "BELGE-OKUNAMADI" // yüklenen belge okunamadı
  | "VT-AYAR" // Supabase ayarları girilmemiş
  | "VT-ANAHTAR" // Supabase anahtarı yanlış (ör. secret yerine publishable)
  | "VT-TABLO" // tablo oluşturulmamış
  | "VT-BAGLANTI" // Supabase'e ulaşılamadı (adres yanlış olabilir)
  | "VT-HATA" // diğer veritabanı hataları
  | "GENEL"; // beklenmeyen hata

export class DilektoHatasi extends Error {
  constructor(
    public kod: HataKodu,
    mesaj: string,
    public detay?: unknown,
  ) {
    super(mesaj);
    this.name = "DilektoHatasi";
  }
}

const GECICI: HataKodu[] = ["YZ-KOTA", "YZ-BAGLANTI", "YZ-DENETIM", "VT-BAGLANTI"];

/** Ziyaretçiye gösterilecek sade mesaj */
export function kullaniciMesaji(kod: HataKodu): string {
  if (kod === "YZ-KOTA") return "Şu an çok yoğunuz. Lütfen birkaç dakika sonra tekrar deneyin.";
  if (kod === "BELGE-OKUNAMADI")
    return "Belgeniz okunamadı. Daha net bir fotoğraf yükleyebilir ya da bilgileri kendiniz yazabilirsiniz.";
  if (GECICI.includes(kod)) return "Dilekçeniz şu an hazırlanamadı. Lütfen birkaç dakika sonra tekrar deneyin.";
  return "Sitede geçici bir ayar sorunu var. Lütfen daha sonra tekrar deneyin.";
}

/** Hatayı bilinen bir türe çevirir ve sunucu kayıtlarına ayrıntısıyla yazar. */
export function hatayiIsle(e: unknown, yer: string): { kod: HataKodu; mesaj: string } {
  const kod: HataKodu = e instanceof DilektoHatasi ? e.kod : "GENEL";
  console.error(`[${yer}] ${kod}:`, e instanceof Error ? e.message : e, e instanceof DilektoHatasi ? e.detay ?? "" : e);
  return { kod, mesaj: kullaniciMesaji(kod) };
}
