// API uçlarının senaryo testleri: taslak, ödeme (deneme + Shopier), temizlik, fatura.
// Yapay zekâ sağlayıcısı taklit edilir; depo bellek içi çalışır.
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DilektoHatasi } from "@/lib/hatalar";
import { gunOnce, hikayeCevabi, KONULAR, sunulanKonular, testCevabi } from "./yardimci";

type Uretici = (istek: { ornekYanit: () => unknown; mesaj: string }) => unknown | Promise<unknown>;
let uretici: Uretici = (i) => i.ornekYanit();
const gelenMesajlar: string[] = [];

vi.mock("@/lib/ai/saglayicilar", () => ({
  saglayiciSec: () => ({
    ad: () => "taklit",
    uret: async (istek: { ornekYanit: () => unknown; mesaj: string }) => {
      gelenMesajlar.push(istek.mesaj);
      return uretici(istek);
    },
  }),
}));

const { POST: taslak } = await import("@/app/api/taslak/route");
const { POST: baslat } = await import("@/app/api/odeme/baslat/route");
const { POST: deneme } = await import("@/app/api/odeme/deneme/route");
const { POST: shopierDonus } = await import("@/app/api/odeme/shopier/route");
const { POST: fatura } = await import("@/app/api/fatura/route");
const { GET: temizlik } = await import("@/app/api/temizlik/route");
const { depo } = await import("@/lib/depo");

const ORTAM = { ...process.env };
const YENI = () => delete (globalThis as { __dilektoDepo?: unknown }).__dilektoDepo;

beforeEach(() => {
  process.env = { ...ORTAM };
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  process.env.ODEME_MODU = "deneme";
  process.env.GUNLUK_TASLAK_SINIRI = "1000";
  uretici = (i) => i.ornekYanit();
  gelenMesajlar.length = 0;
  YENI();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...ORTAM };
  YENI();
  vi.restoreAllMocks();
});

const json = (govde: unknown, url = "https://dilekto.com/api/x") =>
  new Request(url, { method: "POST", body: JSON.stringify(govde), headers: { "content-type": "application/json" } });
const ham = (metin: string) => new Request("https://dilekto.com/api/x", { method: "POST", body: metin });

function govde(testEk: Record<string, string> = {}, hikayeEk: Record<string, string | string[]> = {}) {
  const test = testCevabi(testEk);
  return { tur: "hakem-heyeti", test, hikaye: hikayeCevabi(test, hikayeEk) };
}

describe("POST /api/taslak", () => {
  it("geçerli istekte kayıt oluşturur ve yalnızca kimlik döndürür", async () => {
    const y = await taslak(json(govde()));
    expect(y.status).toBe(200);
    const { id, ...digeri } = await y.json();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(digeri).toEqual({});
    const k = await depo().getir(id);
    expect(k?.durum).toBe("onizleme");
    expect(k?.fiyat).toBe(149);
    expect(k?.saglayici).toBe("taklit");
  });

  it.each([
    ["geçersiz JSON", () => ham("{bozuk")],
    ["boş gövde", () => ham("")],
    ["bilinmeyen tür", () => json({ ...govde(), tur: "yok" })],
    ["tür yok", () => json({ test: {}, hikaye: {} })],
  ])("%s → 400", async (_, yap) => {
    const y = await taslak(yap());
    expect(y.status).toBe(400);
    expect((await y.json()).hata).toBeTruthy();
  });

  it("uygunsuz başvuruyu (gelecek tarih, tutar sınırı) reddeder ve yapay zekâyı çağırmaz", async () => {
    expect((await taslak(json(govde({ tarih: "2099-01-01" })))).status).toBe(400);
    expect((await taslak(json(govde({ tutar: "99999999" })))).status).toBe(400);
    expect(gelenMesajlar).toHaveLength(0);
  });

  it("çok eski tarih engel değil, uyarıdır: taslak üretilir", async () => {
    expect((await taslak(json(govde({ tarih: gunOnce(3000) })))).status).toBe(200);
  });

  it("uygunsuz başvuruyu (ticari amaç) reddeder", async () => {
    const y = await taslak(json(govde({ amac: "ticari" })));
    expect(y.status).toBe(400);
    expect(gelenMesajlar).toHaveLength(0);
  });

  it("tüm konu × alış şekli kombinasyonlarında kayıt oluşur", async () => {
    let say = 0;
    for (const alis of ["internet", "magaza"] as const) {
      for (const konu of sunulanKonular(alis)) {
        const y = await taslak(json(govde({ alisSekli: alis, konu })));
        expect(y.status, `${alis}/${konu}`).toBe(200);
        say++;
      }
    }
    expect(say).toBeGreaterThanOrEqual(KONULAR.length);
    expect((await depo().istatistik(1)).olusturulan).toBe(say);
  });

  it("hassas veri içeren olay anlatımını reddeder (TC, IBAN) ve yapay zekâya göndermez", async () => {
    for (const olay of [
      "Kimlik numaram 10000000146 olan ben, telefonu aldım ve bozuldu.",
      "Parayı TR330006100519786457841326 hesabına iade etsinler.",
    ]) {
      const y = await taslak(json(govde({}, { olay })));
      expect(y.status).toBe(400);
    }
    expect(gelenMesajlar).toHaveLength(0);
  });

  it("alan tipi bozuk istekleri reddeder (dizi tutar, nesne tarih)", async () => {
    const g = govde();
    expect((await taslak(json({ ...g, test: { ...g.test, tutar: [5000] } }))).status).toBe(400);
    expect((await taslak(json({ ...g, test: { ...g.test, tarih: { a: 1 } } }))).status).toBe(400);
    expect((await taslak(json({ ...g, hikaye: null }))).status).toBe(400);
  });

  it("günlük sınır dolunca 429 verir", async () => {
    process.env.GUNLUK_TASLAK_SINIRI = "2";
    expect((await taslak(json(govde()))).status).toBe(200);
    expect((await taslak(json(govde()))).status).toBe(200);
    const y = await taslak(json(govde()));
    expect(y.status).toBe(429);
  });

  it("paralel isteklerde her biri ayrı kayıt alır", async () => {
    const yanitlar = await Promise.all(Array.from({ length: 12 }, () => taslak(json(govde()))));
    const idler = new Set<string>();
    for (const y of yanitlar) {
      expect(y.status).toBe(200);
      idler.add((await y.json()).id);
    }
    expect(idler.size).toBe(12);
  });

  it("yapay zekâ hatası: sağlayıcı hata kodu 503 ile döner, ham hata sızmaz", async () => {
    uretici = () => {
      throw new DilektoHatasi("YZ-KOTA", "kota doldu", { gizli: "ayrıntı" });
    };
    const y = await taslak(json(govde()));
    expect(y.status).toBe(503);
    const s = await y.json();
    expect(s.kod).toBe("YZ-KOTA");
    expect(JSON.stringify(s)).not.toContain("gizli");
    expect(s.hata).toMatch(/yoğun/);
  });

  it("beklenmeyen hata GENEL koduyla döner", async () => {
    uretici = () => {
      throw new Error("patladı");
    };
    const y = await taslak(json(govde()));
    expect(y.status).toBe(503);
    expect((await y.json()).kod).toBe("GENEL");
  });

  it("yapay zekâ yasaklı ifade/uydurma madde üretirse iki denemeden sonra YZ-DENETIM", async () => {
    uretici = () => ({
      konuOzeti: "Konu",
      olaylar: ["Avukatım bu konuda kesin kazanırsınız dedi."],
      talepMetni: "Talep 6502 sayılı Kanun m. 999.",
      ekMevzuat: [],
    });
    const y = await taslak(json(govde()));
    expect(y.status).toBe(503);
    expect((await y.json()).kod).toBe("YZ-DENETIM");
    expect(gelenMesajlar).toHaveLength(2);
    // Kayıt oluşmamalı
    expect((await depo().istatistik(1)).olusturulan).toBe(0);
  });

  it("bozuk çıktı bir kez düzelirse kabul edilir", async () => {
    let n = 0;
    uretici = (i) => {
      n++;
      if (n === 1) return { yanlis: true };
      return i.ornekYanit();
    };
    const y = await taslak(json(govde()));
    expect(y.status).toBe(200);
    expect(n).toBe(2);
  });

  it("veritabanı ayarı yoksa üretimde VT-AYAR döner", async () => {
    process.env = { ...process.env, NODE_ENV: "production" } as NodeJS.ProcessEnv;
    delete process.env.TEST_DEPO_BELLEK;
    const y = await taslak(json(govde()));
    expect(y.status).toBe(503);
    expect((await y.json()).kod).toBe("VT-AYAR");
  });

  describe("robot koruması", () => {
    beforeEach(() => {
      process.env.TURNSTILE_SECRET_KEY = "gizli";
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site";
    });
    it("jeton yoksa 403", async () => {
      expect((await taslak(json(govde()))).status).toBe(403);
    });
    it("Cloudflare reddederse 403, kabul ederse 200", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock.mockResolvedValueOnce(Response.json({ success: false, "error-codes": ["invalid-input-response"] }));
      expect((await taslak(json({ ...govde(), robotJetonu: "kotu" }))).status).toBe(403);
      fetchMock.mockResolvedValueOnce(Response.json({ success: true }));
      expect((await taslak(json({ ...govde(), robotJetonu: "iyi" }))).status).toBe(200);
    });
    it("Cloudflare'e ulaşılamazsa gerçek kullanıcı engellenmez", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("ağ yok"));
      expect((await taslak(json({ ...govde(), robotJetonu: "x" }))).status).toBe(200);
    });
  });
});

async function kayitOlustur() {
  const y = await taslak(json(govde()));
  return (await y.json()).id as string;
}

describe("deneme ödemesi", () => {
  it("onay yoksa 400, onayla ödenmiş sayar", async () => {
    const id = await kayitOlustur();
    expect((await deneme(json({ id }))).status).toBe(400);
    expect((await deneme(json({ id, onay: "evet" }))).status).toBe(400);
    expect((await depo().getir(id))?.durum).toBe("onizleme");
    const y = await deneme(json({ id, onay: true }));
    expect(y.status).toBe(200);
    expect((await y.json()).yonlendirme).toBe(`/dilekce/${id}`);
    const k = await depo().getir(id);
    expect(k?.durum).toBe("odendi");
    expect(k?.odeme?.saglayici).toBe("deneme");
  });

  it("bilinmeyen/bozuk kimlik → 404; kimliksiz → 404", async () => {
    expect((await deneme(json({ id: crypto.randomUUID(), onay: true }))).status).toBe(404);
    expect((await deneme(json({ id: "../../x", onay: true }))).status).toBe(404);
    expect((await deneme(json({ onay: true }))).status).toBe(404);
    expect((await deneme(ham("bozuk"))).status).toBe(400);
  });

  it("iki kez ödeme: ilk referans korunur", async () => {
    const id = await kayitOlustur();
    await deneme(json({ id, onay: true }));
    const ilk = (await depo().getir(id))?.odeme;
    await deneme(json({ id, onay: true }));
    expect((await depo().getir(id))?.odeme).toEqual(ilk);
  });

  it("paralel çift tıklama sorun çıkarmaz", async () => {
    const id = await kayitOlustur();
    const ys = await Promise.all([deneme(json({ id, onay: true })), deneme(json({ id, onay: true }))]);
    expect(ys.map((y) => y.status)).toEqual([200, 200]);
    expect((await depo().getir(id))?.durum).toBe("odendi");
  });

  it("Shopier modunda deneme ödemesi kapalıdır (403)", async () => {
    const id = await kayitOlustur();
    process.env.ODEME_MODU = "shopier";
    expect((await deneme(json({ id, onay: true }))).status).toBe(403);
    expect((await depo().getir(id))?.durum).toBe("onizleme");
  });

  it("süresi dolmuş kayıt bulunamaz", async () => {
    const id = await kayitOlustur();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 31 * 86_400_000);
    try {
      expect((await deneme(json({ id, onay: true }))).status).toBe(404);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("POST /api/odeme/baslat", () => {
  it("deneme modunda gerçek ödeme başlatılamaz", async () => {
    const id = await kayitOlustur();
    const y = await baslat(json({ id, onay: true }));
    expect(y.status).toBe(400);
  });

  it("onay yoksa 400", async () => {
    expect((await baslat(json({ id: "x" }))).status).toBe(400);
  });

  describe("shopier modu", () => {
    beforeEach(() => {
      process.env.ODEME_MODU = "shopier";
      process.env.SHOPIER_API_KEY = "api";
      process.env.SHOPIER_API_SECRET = "gizli-sifre";
    });
    it("imzalı form döner; alıcı bilgileri ve gizli şifre içermez", async () => {
      const id = await kayitOlustur();
      const y = await baslat(json({ id, onay: true }));
      expect(y.status).toBe(200);
      const { form } = await y.json();
      expect(form.adres).toMatch(/^https:\/\/www\.shopier\.com\//);
      expect(form.alanlar.platform_order_id).toBe(id);
      expect(form.alanlar.total_order_value).toBe("149.00");
      expect(form.alanlar.signature).toBeTruthy();
      expect(JSON.stringify(form)).not.toContain("gizli-sifre");
      for (const a of form.aliciAlanlari) expect(form.alanlar).not.toHaveProperty(a);
    });
    it("bilinmeyen kayıt → 404", async () => {
      expect((await baslat(json({ id: crypto.randomUUID(), onay: true }))).status).toBe(404);
    });
    it("zaten ödenmişse dilekçeye yönlendirir", async () => {
      const id = await kayitOlustur();
      await depo().odemeIsle(id, { saglayici: "shopier", referans: "1", tarih: new Date().toISOString() });
      const y = await baslat(json({ id, onay: true }));
      expect((await y.json()).yonlendirme).toBe(`/dilekce/${id}`);
    });
    it("anahtarlar eksikse ODEME-AYAR ve genel mesaj", async () => {
      const id = await kayitOlustur();
      delete process.env.SHOPIER_API_KEY;
      const y = await baslat(json({ id, onay: true }));
      expect(y.status).toBe(503);
      expect((await y.json()).kod).toBe("ODEME-AYAR");
    });
  });

  it("tanımsız ödeme modunda 503 verir", async () => {
    process.env.ODEME_MODU = "yok";
    const y = await baslat(json({ id: "x", onay: true }));
    expect(y.status).toBe(503);
  });
});

describe("Shopier dönüşü", () => {
  const SIFRE = "gizli-sifre";
  beforeEach(() => {
    process.env.ODEME_MODU = "shopier";
    process.env.SHOPIER_API_KEY = "api";
    process.env.SHOPIER_API_SECRET = SIFRE;
  });
  const gonder = (id: string, ek: Record<string, string> = {}, sifre = SIFRE) =>
    shopierDonus(
      new Request("https://dilekto.com/api/odeme/shopier", {
        method: "POST",
        body: new URLSearchParams({
          platform_order_id: id,
          payment_id: "SHP-9",
          installment: "0",
          random_nr: "424242",
          signature: createHmac("sha256", sifre).update(`424242${id}`).digest("base64"),
          status: "success",
          ...ek,
        }),
      }),
    );

  it("geçerli dönüş ödemeyi işler", async () => {
    const id = await kayitOlustur();
    const y = await gonder(id);
    expect(y.status).toBe(303);
    expect(y.headers.get("location")).toBe(`https://dilekto.com/dilekce/${id}`);
    expect((await depo().getir(id))?.odeme?.referans).toBe("SHP-9");
  });
  it("sahte imza → 400, kayıt ödenmez", async () => {
    const id = await kayitOlustur();
    expect((await gonder(id, {}, "baska-sifre")).status).toBe(400);
    expect((await depo().getir(id))?.durum).toBe("onizleme");
  });
  it("başarısız ödeme → ödeme sayfasına, ödenmez", async () => {
    const id = await kayitOlustur();
    const y = await gonder(id, { status: "fail" });
    expect(y.headers.get("location")).toBe(`https://dilekto.com/odeme/${id}?durum=basarisiz`);
    expect((await depo().getir(id))?.durum).toBe("onizleme");
  });
  it("kayıt yoksa iletişim sayfasına yönlendirir", async () => {
    const y = await gonder(crypto.randomUUID());
    expect(y.headers.get("location")).toBe("https://dilekto.com/iletisim?odeme=sorun");
  });
  it("aynı dönüş iki kez gelirse ilk referans korunur", async () => {
    const id = await kayitOlustur();
    await gonder(id);
    await gonder(id, { payment_id: "SHP-10" });
    expect((await depo().getir(id))?.odeme?.referans).toBe("SHP-9");
  });
  it("form olmayan istek → 400; deneme modunda uç kapalı → 404", async () => {
    const y = await shopierDonus(new Request("https://dilekto.com/api/odeme/shopier", { method: "POST", body: "x" }));
    expect(y.status).toBe(400);
    process.env.ODEME_MODU = "deneme";
    expect((await gonder("x")).status).toBe(404);
  });
  it("eksik alanlar → 400", async () => {
    const y = await shopierDonus(
      new Request("https://dilekto.com/api/odeme/shopier", { method: "POST", body: new URLSearchParams({ status: "success" }) }),
    );
    expect(y.status).toBe(400);
  });
});

describe("GET /api/temizlik", () => {
  const iste = (yetki?: string) =>
    temizlik(new Request("https://dilekto.com/api/temizlik", { headers: yetki ? { authorization: yetki } : {} }));

  it("anahtarsız ya da yanlış anahtarla 401", async () => {
    process.env.CRON_SECRET = "sir";
    expect((await iste()).status).toBe(401);
    expect((await iste("Bearer yanlis")).status).toBe(401);
  });
  it("CRON_SECRET tanımsızsa herkes için 401 (boş anahtar kabul edilmez)", async () => {
    delete process.env.CRON_SECRET;
    expect((await iste("Bearer ")).status).toBe(401);
    expect((await iste("Bearer undefined")).status).toBe(401);
  });
  it("yalnızca süresi dolanları siler", async () => {
    process.env.CRON_SECRET = "sir";
    const eski = await kayitOlustur();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 31 * 86_400_000);
    const yeni = await kayitOlustur();
    const y = await iste("Bearer sir");
    expect(await y.json()).toEqual({ silinen: 1 });
    expect(await depo().getir(eski)).toBeNull();
    expect(await depo().getir(yeni)).not.toBeNull();
    vi.useRealTimers();
  });
});

describe("POST /api/fatura", () => {
  const dosya = (tur: string, veri: string) => json({ dosya: { tur, veri } });

  it("geçersiz tür, boş veri, bozuk base64, gövde yok → 400", async () => {
    expect((await fatura(dosya("text/html", "AAAA"))).status).toBe(400);
    expect((await fatura(dosya("image/png", ""))).status).toBe(400);
    expect((await fatura(dosya("image/png", "<script>"))).status).toBe(400);
    expect((await fatura(ham("bozuk"))).status).toBe(400);
    expect((await fatura(json({}))).status).toBe(400);
  });
  it("çok büyük dosya → 413", async () => {
    expect((await fatura(dosya("image/png", "A".repeat(4_000_001)))).status).toBe(413);
  });
  it("okunamayan belge 422, yapay zekâ hatası 503", async () => {
    uretici = () => ({ faturaMi: false, urun: "", satici: "", saticiAdres: "", tarih: "", tutar: 0 });
    expect((await fatura(dosya("image/png", "AAAA"))).status).toBe(422);
    uretici = () => {
      throw new DilektoHatasi("YZ-BAGLANTI", "yok");
    };
    expect((await fatura(dosya("application/pdf", "AAAA"))).status).toBe(503);
  });
  it("okunan fatura bilgisi döner ve kimlik alanı içermez", async () => {
    uretici = () => ({
      faturaMi: true,
      urun: "Telefon",
      satici: "ABC A.Ş.",
      saticiAdres: "Kadıköy / İstanbul",
      tarih: gunOnce(10),
      tutar: 4999.9,
    });
    const y = await fatura(dosya("image/jpeg", "AAAA"));
    expect(y.status).toBe(200);
    const { bilgi } = await y.json();
    expect(bilgi.urun).toBe("Telefon");
    expect(bilgi.tutar).toBe(4999.9);
    expect(Object.keys(bilgi).sort()).toEqual(["saticiAdres", "satici", "tarih", "tutar", "urun"].sort());
  });
});
