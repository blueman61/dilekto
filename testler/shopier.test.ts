// Shopier ödeme bağlantısı: imza, dönüş doğrulaması ve dönüş adresinin davranışı.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ILLER, ilPostaKodu, PLAKA_SIRASI, telefonSadelestir } from "@/lib/dilekce-turleri/ortak";
import {
  alicisizFormAlanlari,
  donusImzasiGecerliMi,
  SHOPIER_ALICI_ALANLARI,
  type ShopierDonusu,
} from "@/lib/odeme/shopier";

const AYAR = { anahtar: "api-kullanici", sifre: "gizli-sifre", siteNo: "1" };

describe("Shopier imzası", () => {
  it("istek imzası Shopier yöntemiyle birebir aynı (Python ile bağımsız hesaplandı)", () => {
    const alanlar = alicisizFormAlanlari({ siparisNo: "abc-siparis", tutar: 149, urunAdi: "Dilekçe" }, AYAR, 123456);
    expect(alanlar.total_order_value).toBe("149.00");
    expect(alanlar.currency).toBe("0");
    expect(alanlar.product_type).toBe("1");
    expect(alanlar.signature).toBe("IoEOFr2ZK/OaKbqiBkZt5jqHRWcsv1n3IDceFecFm+0=");
  });

  it("alıcının kişisel bilgileri sunucunun hazırladığı alanlarda yer almaz", () => {
    const alanlar = alicisizFormAlanlari({ siparisNo: "x", tutar: 149, urunAdi: "Dilekçe" }, AYAR, 111111);
    for (const ad of SHOPIER_ALICI_ALANLARI) expect(alanlar).not.toHaveProperty(ad);
  });

  const donus = (degisiklik: Partial<ShopierDonusu> = {}): ShopierDonusu => ({
    durum: "success",
    siparisNo: "abc-siparis",
    odemeNo: "987",
    taksit: "0",
    rastgele: "654321",
    imza: "EywDQodE1Yl9n6cRNf4Ek6gllsAdvUjFn6M0qgxw2QU=",
    ...degisiklik,
  });

  it("geçerli dönüş imzasını kabul eder", () => {
    expect(donusImzasiGecerliMi(donus(), AYAR.sifre)).toBe(true);
  });

  it.each([
    ["başka sipariş numarası", { siparisNo: "baska-siparis" }],
    ["başka rastgele sayı", { rastgele: "111111" }],
    ["bozuk imza", { imza: "AAAA" }],
    ["boş imza", { imza: "" }],
  ])("sahte dönüşü reddeder: %s", (_, degisiklik) => {
    expect(donusImzasiGecerliMi(donus(degisiklik), AYAR.sifre)).toBe(false);
  });
});

describe("ödeme formu yardımcıları", () => {
  it("telefonu Shopier biçimine çevirir", () => {
    expect(telefonSadelestir("0 (555) 123 45 67")).toBe("5551234567");
    expect(telefonSadelestir("+90 555 123 45 67")).toBe("5551234567");
    expect(telefonSadelestir("5551234567")).toBe("5551234567");
  });
  it("plaka sırası tüm illeri içerir ve posta kodunu doğru üretir", () => {
    expect([...PLAKA_SIRASI].sort()).toEqual([...ILLER].sort());
    expect(ilPostaKodu("İstanbul")).toBe("34000");
    expect(ilPostaKodu("Adana")).toBe("01000");
    expect(ilPostaKodu("Düzce")).toBe("81000");
  });
});

describe("Shopier dönüş adresi", () => {
  const eskiOrtam = { ...process.env };
  beforeEach(() => {
    process.env.ODEME_MODU = "shopier";
    process.env.SHOPIER_API_KEY = AYAR.anahtar;
    process.env.SHOPIER_API_SECRET = AYAR.sifre;
    delete process.env.SUPABASE_URL;
    delete (globalThis as { __dilektoDepo?: unknown }).__dilektoDepo;
  });
  afterEach(() => {
    process.env = { ...eskiOrtam };
    delete (globalThis as { __dilektoDepo?: unknown }).__dilektoDepo;
  });

  async function hazirla() {
    const { depo } = await import("@/lib/depo");
    const { createHmac } = await import("node:crypto");
    const kayit = await depo().olustur({
      tur: "hakem-heyeti",
      test: {},
      hikaye: {},
      cikti: { konuOzeti: "x", olaylar: ["x"], talepMetni: "x", ekMevzuat: [] },
      saglayici: "test",
      fiyat: 149,
    });
    const imza = createHmac("sha256", AYAR.sifre).update(`555555${kayit.id}`).digest("base64");
    const gonder = async (alanlar: Record<string, string>) => {
      const { POST } = await import("@/app/api/odeme/shopier/route");
      return POST(
        new Request("https://dilekto.com/api/odeme/shopier", {
          method: "POST",
          body: new URLSearchParams({
            platform_order_id: kayit.id,
            payment_id: "SHP-1",
            installment: "0",
            random_nr: "555555",
            signature: imza,
            status: "success",
            ...alanlar,
          }),
        }),
      );
    };
    return { depo: depo(), kayit, gonder };
  }

  it("başarılı ödemede dilekçeyi açar ve dilekçe sayfasına yönlendirir", async () => {
    const { depo, kayit, gonder } = await hazirla();
    const yanit = await gonder({});
    expect(yanit.status).toBe(303);
    expect(yanit.headers.get("location")).toBe(`https://dilekto.com/dilekce/${kayit.id}`);
    const sonra = await depo.getir(kayit.id);
    expect(sonra?.durum).toBe("odendi");
    expect(sonra?.odeme).toMatchObject({ saglayici: "shopier", referans: "SHP-1" });
  });

  it("başarısız ödemede dilekçeyi açmaz", async () => {
    const { depo, kayit, gonder } = await hazirla();
    const yanit = await gonder({ status: "failed" });
    expect(yanit.headers.get("location")).toBe(`https://dilekto.com/odeme/${kayit.id}?durum=basarisiz`);
    expect((await depo.getir(kayit.id))?.durum).toBe("onizleme");
  });

  it("imzası tutmayan isteği reddeder", async () => {
    const { depo, kayit, gonder } = await hazirla();
    const yanit = await gonder({ signature: "sahte" });
    expect(yanit.status).toBe(400);
    expect((await depo.getir(kayit.id))?.durum).toBe("onizleme");
  });

  it("deneme modunda Shopier dönüşünü kabul etmez", async () => {
    const { gonder } = await hazirla();
    process.env.ODEME_MODU = "deneme";
    expect((await gonder({})).status).toBe(404);
  });
});
