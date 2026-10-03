// Shopier ödeme bağlantısı.
//
// Akış:
//  1. Ödeme sayfasında kullanıcı onay kutularını işaretler ve fatura bilgilerini
//     (ad, e-posta, telefon, adres) yazar.
//  2. Sunucu yalnızca sipariş numarası, tutar ve imzayı hazırlar (alicisizFormAlanlari).
//     Alıcının bilgileri sunucumuza HİÇ gelmez: tarayıcı bu alanları forma ekleyip
//     doğrudan Shopier'in ödeme sayfasına gönderir.
//  3. Ödeme bitince Shopier, kullanıcının tarayıcısı üzerinden /api/odeme/shopier
//     adresine imzalı bir sonuç gönderir; imza doğrulanırsa dilekçe açılır.
//
// İmza yöntemi, Shopier'in resmî WooCommerce modülüyle ve açık kaynak
// SDK'larla aynıdır:
//   istek imzası = base64(HMAC-SHA256(API şifresi, random_nr + sipariş no + tutar + para birimi))
//   dönüş imzası = base64(HMAC-SHA256(API şifresi, random_nr + sipariş no))
//
// DİKKAT: Shopier'in dönüş imzası ödeme durumunu ("success") kapsamaz. Bu yüzden
// her ödeme Shopier'in ödeme numarasıyla kaydedilir ve durum sayfasındaki
// "Son ödemeler" listesi Shopier panelindeki siparişlerle karşılaştırılabilir.

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { ayar } from "@/lib/ayar";
import { DilektoHatasi } from "@/lib/hatalar";

export const SHOPIER_ODEME_ADRESI = "https://www.shopier.com/ShowProduct/api_pay4.php";

/** Alıcının tarayıcıda dolduracağı, sunucuya gönderilmeyen Shopier alanları */
export const SHOPIER_ALICI_ALANLARI = [
  "buyer_name",
  "buyer_surname",
  "buyer_email",
  "buyer_phone",
  "billing_address",
  "billing_city",
  "billing_postcode",
  "shipping_address",
  "shipping_city",
  "shipping_postcode",
] as const;

type ShopierAyarlari = { anahtar: string; sifre: string; siteNo: string };

export function shopierAyarlari(): ShopierAyarlari {
  const anahtar = ayar("SHOPIER_API_KEY");
  const sifre = ayar("SHOPIER_API_SECRET");
  if (!anahtar || !sifre) {
    throw new DilektoHatasi("ODEME-AYAR", "SHOPIER_API_KEY ve SHOPIER_API_SECRET ayarlanmamış.");
  }
  return { anahtar, sifre, siteNo: ayar("SHOPIER_SITE_NO") || "1" };
}

function imzala(sifre: string, veri: string): string {
  return createHmac("sha256", sifre).update(veri, "utf8").digest("base64");
}

/** "149" → "149.00" (imza için tutarın biçimi birebir aynı olmalı) */
export function shopierTutari(tutar: number): string {
  return tutar.toFixed(2);
}

/**
 * Shopier'e gönderilecek formun alıcı bilgisi DIŞINDAKİ alanları.
 * Alıcı alanları tarayıcıda eklenir (bkz. SHOPIER_ALICI_ALANLARI).
 */
export function alicisizFormAlanlari(
  girdi: { siparisNo: string; tutar: number; urunAdi: string },
  ayarlar: ShopierAyarlari = shopierAyarlari(),
  rastgele: number = randomInt(100_000, 1_000_000),
): Record<string, string> {
  const tutar = shopierTutari(girdi.tutar);
  const paraBirimi = "0"; // 0 = TL
  const urunAdi = girdi.urunAdi.replace(/["';]/g, "");
  const urunBilgisi = [
    {
      name: urunAdi,
      product_id: girdi.siparisNo,
      product_type: 1, // 1 = indirilebilir / sanal ürün
      quantity: 1,
      price: girdi.tutar,
      subtotal_price: girdi.tutar,
      total_price: girdi.tutar,
      subtotal_tax: 0,
      total_tax: 0,
    },
  ];
  const genelBilgi = {
    discount_total: "0.00",
    discount_tax: "0.00",
    shipping_total: "0.00",
    shipping_tax: "0.00",
    cart_tax: "0.00",
    total: tutar,
    total_tax: "0.00",
    order_key: girdi.siparisNo,
  };

  return {
    API_key: ayarlar.anahtar,
    website_index: ayarlar.siteNo,
    use_adress: "0",
    platform_order_id: girdi.siparisNo,
    product_info: JSON.stringify(urunBilgisi),
    general_info: JSON.stringify(genelBilgi),
    product_name: `${urunAdi};`,
    product_type: "1",
    buyer_account_age: "0",
    buyer_id_nr: girdi.siparisNo,
    billing_country: "Türkiye",
    shipping_country: "Türkiye",
    total_order_value: tutar,
    currency: paraBirimi,
    platform: "0",
    is_in_frame: "0",
    current_language: "0", // 0 = Türkçe
    modul_version: "2.0.0",
    random_nr: String(rastgele),
    signature: imzala(ayarlar.sifre, `${rastgele}${girdi.siparisNo}${tutar}${paraBirimi}`),
  };
}

export type ShopierDonusu = {
  durum: string;
  siparisNo: string;
  odemeNo: string;
  taksit: string;
  rastgele: string;
  imza: string;
};

export function donusuOku(form: FormData): ShopierDonusu {
  const al = (k: string) => String(form.get(k) ?? "").trim();
  return {
    durum: al("status"),
    siparisNo: al("platform_order_id"),
    odemeNo: al("payment_id"),
    taksit: al("installment"),
    rastgele: al("random_nr"),
    imza: al("signature"),
  };
}

/** Shopier'in gönderdiği dönüş imzasını doğrular (zamanlama saldırısına dayanıklı). */
export function donusImzasiGecerliMi(d: ShopierDonusu, sifre: string = shopierAyarlari().sifre): boolean {
  if (!d.siparisNo || !d.rastgele || !d.imza) return false;
  const beklenen = Buffer.from(imzala(sifre, `${d.rastgele}${d.siparisNo}`), "base64");
  const gelen = Buffer.from(d.imza, "base64");
  return beklenen.length === gelen.length && timingSafeEqual(beklenen, gelen);
}
