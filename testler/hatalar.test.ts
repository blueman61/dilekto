import { afterEach, describe, expect, it } from "vitest";
import { jsonAyikla } from "@/lib/ai/saglayicilar";
import { faturaOku } from "@/lib/ai/fatura";
import { ayar } from "@/lib/ayar";
import { vtHatasi } from "@/lib/depo";
import { DilektoHatasi, hatayiIsle } from "@/lib/hatalar";

const eskiOrtam = { ...process.env };
afterEach(() => {
  process.env = { ...eskiOrtam };
});

describe("ayarlar", () => {
  it("yapıştırırken karışan boşluk, satır sonu ve tırnağı temizler", () => {
    process.env.DENEME_AYARI = '  "gemini"\n';
    expect(ayar("DENEME_AYARI")).toBe("gemini");
    process.env.DENEME_AYARI = "   ";
    expect(ayar("DENEME_AYARI")).toBeUndefined();
  });
});

describe("Supabase hata ayrımı", () => {
  it.each([
    [{ message: 'new row violates row-level security policy for table "dilekceler"', code: "42501" }, "VT-ANAHTAR"],
    [{ message: "Invalid API key" }, "VT-ANAHTAR"],
    [{ message: "Could not find the table 'public.dilekceler' in the schema cache", code: "PGRST205" }, "VT-TABLO"],
    [{ message: "TypeError: fetch failed" }, "VT-BAGLANTI"],
    [{ message: "başka bir şey" }, "VT-HATA"],
  ])("%o → %s", (hata, kod) => {
    expect(vtHatasi(hata, "test").kod).toBe(kod);
  });
});

describe("hata mesajları", () => {
  it("bilinmeyen hatayı GENEL koduna çevirir", () => {
    expect(hatayiIsle(new Error("x"), "test").kod).toBe("GENEL");
  });
  it("kotayı kullanıcıya yoğunluk olarak anlatır", () => {
    expect(hatayiIsle(new DilektoHatasi("YZ-KOTA", "x"), "test").mesaj).toMatch(/yoğun/);
  });
});

describe("yapay zekâ yanıtı ayrıştırma", () => {
  it("kod bloğu içindeki JSON'u okur", () => {
    expect(jsonAyikla('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
  });
  it("bozuk yanıtı YZ-DENETIM olarak işaretler", () => {
    expect(() => jsonAyikla("merhaba")).toThrow(DilektoHatasi);
  });
});

describe("fatura okuma", () => {
  it("desteklenmeyen dosya türünü reddeder", async () => {
    await expect(faturaOku({ tur: "text/plain", veri: "AAAA" })).rejects.toMatchObject({ kod: "BELGE-OKUNAMADI" });
  });
  it("örnek sağlayıcıyla bilgileri döndürür", async () => {
    process.env.YAPAY_ZEKA = "ornek";
    const bilgi = await faturaOku({ tur: "image/jpeg", veri: "AAAA" });
    expect(bilgi.satici).toBe("Örnek Satıcı A.Ş.");
    expect(bilgi.tarih).toBe("");
  });
});
