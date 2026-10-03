// Yüklenen faturadan ürün, satıcı, tarih ve tutarı okur.
//
// Gizlilik: Dosya hiçbir yerde saklanmaz; yalnızca bu istek süresince
// bellekte tutulur, yapay zekâya okutulur ve istek bitince silinir.
// Alıcının (kullanıcının) adı, kimlik numarası ve adresi okunmaz.

import { z } from "zod";
import { DilektoHatasi } from "@/lib/hatalar";
import { saglayiciSec, type Ek } from "./saglayicilar";

export const IZINLI_BELGE_TURLERI = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];
/** base64 hâlinde en fazla ~4 MB (Vercel istek sınırının altında kalır) */
export const EN_BUYUK_BELGE_BASE64 = 4_000_000;

export const FaturaSemasi = z.object({
  faturaMi: z.boolean(),
  urun: z.string(),
  satici: z.string(),
  saticiAdres: z.string(),
  tarih: z.string(),
  tutar: z.number(),
});

export type FaturaBilgisi = {
  urun: string;
  satici: string;
  saticiAdres: string;
  /** YYYY-AA-GG ya da boş */
  tarih: string;
  /** TL; okunamadıysa 0 */
  tutar: number;
};

const SISTEM = `Sen bir fatura okuma aracısın. Sana bir fatura, fiş, sipariş özeti ya da benzeri bir alışveriş belgesinin görüntüsü verilecek.
Yalnızca şu bilgileri çıkar:
- faturaMi: Belge gerçekten bir fatura, fiş, sipariş özeti veya satış belgesi mi?
- urun: Satın alınan ürünün ya da hizmetin adı (marka ve model dahil, kısa). Birden fazla kalem varsa en pahalı olanı yaz.
- satici: Satıcı firmanın unvanı (faturayı düzenleyen). Varsa internet sitesini parantez içinde ekle.
- saticiAdres: Satıcı firmanın adresi.
- tarih: Fatura ya da satış tarihi, YYYY-AA-GG biçiminde.
- tutar: Ödenen toplam tutar (KDV dahil), yalnızca sayı, TL. Ondalık ayırıcı olarak nokta kullan.
Okuyamadığın ya da belgede olmayan bir bilgi için boş metin (sayı için 0) yaz; asla tahmin etme.
ALICININ (müşterinin) adını, kimlik numarasını, adresini, telefonunu veya e-postasını HİÇBİR alana yazma.`;

function temizle(metin: string, enUzun: number): string {
  return metin.replace(/\s+/g, " ").trim().slice(0, enUzun);
}

export async function faturaOku(ek: Ek): Promise<FaturaBilgisi> {
  if (!IZINLI_BELGE_TURLERI.includes(ek.tur)) {
    throw new DilektoHatasi("BELGE-OKUNAMADI", `Desteklenmeyen dosya türü: ${ek.tur}`);
  }
  const ham = await saglayiciSec().uret({
    sistem: SISTEM,
    mesaj: "Ekteki belgedeki bilgileri çıkar.",
    sema: FaturaSemasi,
    ekler: [ek],
    ornekYanit: () => ({
      faturaMi: true,
      urun: "Örnek ürün",
      satici: "Örnek Satıcı A.Ş.",
      saticiAdres: "",
      tarih: "",
      tutar: 0,
    }),
  });

  const sonuc = FaturaSemasi.safeParse(ham);
  if (!sonuc.success || !sonuc.data.faturaMi) {
    throw new DilektoHatasi("BELGE-OKUNAMADI", "Belge bir fatura olarak okunamadı.");
  }
  const f = sonuc.data;
  const tarih = /^\d{4}-\d{2}-\d{2}$/.test(f.tarih) && !isNaN(Date.parse(f.tarih)) ? f.tarih : "";
  const tutar = Number.isFinite(f.tutar) && f.tutar > 0 && f.tutar < 100_000_000 ? Math.round(f.tutar * 100) / 100 : 0;
  const bilgi = {
    urun: temizle(f.urun, 150),
    satici: temizle(f.satici, 150),
    saticiAdres: temizle(f.saticiAdres, 250),
    tarih,
    tutar,
  };
  if (!bilgi.urun && !bilgi.satici && !tarih && !tutar) {
    throw new DilektoHatasi("BELGE-OKUNAMADI", "Belgeden hiçbir bilgi okunamadı.");
  }
  return bilgi;
}
