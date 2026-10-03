// Ödeme altyapısı. Hangi sağlayıcının kullanılacağı Vercel'deki ODEME_MODU
// ayarıyla seçilir:
//   - "deneme"  (varsayılan): ödeme ekranı çalışır, hiçbir karttan para çekilmez
//   - "shopier": gerçek ödeme; SHOPIER_API_KEY ve SHOPIER_API_SECRET gerekir
//
// Yeni bir sağlayıcı (ör. iyzico) eklemek için bu klasöre bir dosya ekleyip
// aşağıdaki listeye eklemek ve geri dönüş adresi için bir API ucu yazmak yeterlidir
// (bkz. docs/ODEME.md).

import { ayar } from "@/lib/ayar";
import type { DilekceKaydi } from "@/lib/depo";
import { alicisizFormAlanlari, SHOPIER_ALICI_ALANLARI, SHOPIER_ODEME_ADRESI, shopierAyarlari } from "./shopier";

/** Tarayıcının ödeme sağlayıcısına göndereceği form */
export type OdemeFormu = {
  adres: string;
  alanlar: Record<string, string>;
  /** Tarayıcıda alıcının doldurduğu bilgilerle eklenecek alan adları */
  aliciAlanlari: readonly string[];
};

export type OdemeSaglayicisi = {
  ad: string;
  /** Gerçek para çekilir mi */
  gercek: boolean;
  /** Ödeme formunu hazırlar (deneme modunda yoktur) */
  formHazirla?: (kayit: DilekceKaydi, urunAdi: string) => OdemeFormu;
  /** Ayarlar eksikse hata fırlatır */
  ayarlariDenetle?: () => void;
};

const deneme: OdemeSaglayicisi = { ad: "deneme", gercek: false };

const shopier: OdemeSaglayicisi = {
  ad: "shopier",
  gercek: true,
  ayarlariDenetle: () => void shopierAyarlari(),
  formHazirla: (kayit, urunAdi) => ({
    adres: SHOPIER_ODEME_ADRESI,
    alanlar: alicisizFormAlanlari({ siparisNo: kayit.id, tutar: kayit.fiyat, urunAdi }),
    aliciAlanlari: SHOPIER_ALICI_ALANLARI,
  }),
};

const SAGLAYICILAR: Record<string, OdemeSaglayicisi> = { deneme, shopier };

export function odemeModu(): string {
  return (ayar("ODEME_MODU") || "deneme").toLowerCase();
}

export function odemeSaglayicisi(): OdemeSaglayicisi {
  const s = SAGLAYICILAR[odemeModu()];
  if (!s) throw new Error(`Tanımsız ödeme modu: ${odemeModu()}`);
  return s;
}

export function denemeModundaMi(): boolean {
  return !odemeSaglayicisi().gercek;
}
