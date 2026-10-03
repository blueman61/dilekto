// Gemini'nin olası hata yanıtlarına karşı yeniden deneme mantığını sınar.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const cagrilar: string[] = [];
let yanitlar: Array<(model: string) => unknown> = [];

vi.mock("@google/genai", async (gercek) => {
  const asil = await gercek<typeof import("@google/genai")>();
  class GoogleGenAI {
    models = {
      generateContent: async ({ model }: { model: string }) => {
        cagrilar.push(model);
        const sonraki = yanitlar.shift();
        if (!sonraki) throw new Error("beklenmeyen çağrı");
        return sonraki(model);
      },
    };
  }
  return { ...asil, GoogleGenAI };
});

const { ApiError } = await import("@google/genai");
const { saglayiciSec } = await import("@/lib/ai/saglayicilar");

const hata = (status: number, message: string) => () => {
  throw new ApiError({ status, message });
};
const basari = () => ({ text: '{"a":"tamam"}' });
const istek = { sistem: "s", mesaj: "m", sema: z.object({ a: z.string() }), ornekYanit: () => ({}) };

beforeEach(() => {
  cagrilar.length = 0;
  process.env.YAPAY_ZEKA = "gemini";
  process.env.GEMINI_API_KEY = "deneme";
  delete process.env.GEMINI_MODEL;
});

describe("Gemini yeniden deneme", () => {
  it("yoğunlukta (503) aynı modeli bir kez daha, sonra sıradaki modeli dener", async () => {
    yanitlar = [hata(503, "The model is overloaded"), hata(503, "The model is overloaded"), basari];
    await expect(saglayiciSec().uret(istek)).resolves.toEqual({ a: "tamam" });
    expect(cagrilar).toEqual(["gemini-flash-latest", "gemini-flash-latest", "gemini-3.8-flash"]);
  }, 15000);

  it("şema reddedilirse (400) şemasız dener", async () => {
    yanitlar = [hata(400, "Invalid JSON payload"), basari];
    await expect(saglayiciSec().uret(istek)).resolves.toEqual({ a: "tamam" });
  });

  it("bölge engelini YZ-BOLGE olarak bildirir", async () => {
    yanitlar = [hata(400, "User location is not supported for the API use.")];
    await expect(saglayiciSec().uret(istek)).rejects.toMatchObject({ kod: "YZ-BOLGE" });
  });

  it("tüm modellerde kota dolduysa YZ-KOTA verir", async () => {
    yanitlar = [1, 2, 3, 4].map(() => hata(429, "Resource has been exhausted"));
    await expect(saglayiciSec().uret(istek)).rejects.toMatchObject({ kod: "YZ-KOTA" });
  });

  it("hiçbiri yanıt vermezse YZ-BAGLANTI ile her denemenin ayrıntısını verir", async () => {
    yanitlar = Array.from({ length: 8 }, () => hata(500, "Internal error"));
    const h = await saglayiciSec().uret(istek).catch((e) => e);
    expect(h.kod).toBe("YZ-BAGLANTI");
    expect(h.detay.length).toBeGreaterThan(1);
  }, 30000);
});
