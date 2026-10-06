// Senaryo testleri için ortak yardımcılar.
import { hakemHeyeti as tur } from "@/lib/dilekce-turleri/hakem-heyeti";
import type { Cevaplar, Kisisel, TaslakCiktisi } from "@/lib/dilekce-turleri/tipler";

/** Testlerde "şimdi": Türkiye saatiyle 6 Ekim 2026 15:00 */
export const BUGUN = new Date("2026-10-06T12:00:00Z");

/** bugünden `gun` gün önceki tarih (ISO, UTC aritmetiği) */
export function gunOnce(gun: number, bugun = "2026-10-06"): string {
  const [y, m, g] = bugun.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, g - gun)).toISOString().slice(0, 10);
}

export const KONULAR = ["ayipli_mal", "kargo_hasar", "ayipli_hizmet", "teslimat", "cayma", "diger"] as const;
export type Konu = (typeof KONULAR)[number];

/** Seçilen alış şeklinde sunulan konular (mağazada teslimat ve cayma yoktur) */
export function sunulanKonular(alis: "internet" | "magaza"): Konu[] {
  const soru = tur.testSorulari({ alisSekli: alis }).find((s) => s.id === "konu");
  return soru?.tip === "secim" ? (soru.secenekler.map((x) => x.deger) as Konu[]) : [];
}

export function testCevabi(ek: Partial<Record<string, string>> = {}): Cevaplar {
  return {
    amac: "kisisel",
    karsiTaraf: "firma",
    alisSekli: "internet",
    konu: "ayipli_mal",
    tutar: "5000",
    tarih: gunOnce(40),
    ...ek,
  } as Cevaplar;
}

export function hikayeSecenekleri(test: Cevaplar, soruId: string): string[] {
  const soru = tur.hikayeSorulari(test).find((s) => s.id === soruId);
  return soru && (soru.tip === "secim" || soru.tip === "coklu") ? soru.secenekler.map((x) => x.deger) : [];
}

export function hikayeCevabi(test: Cevaplar, ek: Partial<Record<string, string | string[]>> = {}): Cevaplar {
  return {
    urun: "Samsung Galaxy A55 cep telefonu",
    satici: "ABC Elektronik Ticaret A.Ş.",
    saticiAdres: "Merkez Mah. Örnek Cad. No: 3 Kadıköy / İstanbul",
    olay: "Telefonu aldıktan üç hafta sonra ekranı kendiliğinden kapanmaya başladı. Servise verdim, ücretsiz onarımı reddettiler.",
    bildirim: "evet",
    talep: hikayeSecenekleri(test, "talep")[0],
    belgeler: ["fatura", "servis"],
    ...ek,
  } as Cevaplar;
}

export const KISISEL_TAM: Kisisel = {
  adSoyad: "ayşe yılmaz",
  tcKimlik: "10000000146",
  adres: "Caferağa Mah. Örnek Sok. No: 1 Kadıköy / İstanbul",
  telefon: "0555 123 45 67",
  il: "İstanbul",
  ilce: "Kadıköy",
};

export const IYI_CIKTI: TaslakCiktisi = {
  konuOzeti: "Ayıplı cep telefonunun bedelinin iadesi talebi",
  olaylar: [
    "Karşı taraftan cep telefonu satın aldım.",
    "Telefonun ekranı kısa sürede kendiliğinden kapanmaya başladı.",
    "Durumu karşı tarafa bildirdim; talebim karşılanmadı.",
  ],
  talepMetni:
    "Yukarıda açıkladığım nedenlerle, ödediğim bedelin iadesine karar verilmesini saygılarımla arz ve talep ederim.",
  ekMevzuat: [],
};

export { tur };
