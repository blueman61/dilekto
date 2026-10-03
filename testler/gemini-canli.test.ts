// Gerçek Gemini sunucusuna istek atar; yalnızca GEMINI_CANLI_TEST=1 iken çalışır.
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { saglayiciSec } from "@/lib/ai/saglayicilar";
import { DilektoHatasi } from "@/lib/hatalar";

describe.runIf(process.env.GEMINI_CANLI_TEST === "1")("Gemini (canlı)", () => {
  it("geçersiz anahtarı YZ-ANAHTAR olarak sınıflandırır", async () => {
    process.env.YAPAY_ZEKA = "gemini";
    const s = saglayiciSec();
    const hata = await s
      .uret({ sistem: "test", mesaj: "test", sema: z.object({ a: z.string() }), ornekYanit: () => ({}) })
      .catch((e) => e);
    expect(hata).toBeInstanceOf(DilektoHatasi);
    console.log((hata as DilektoHatasi).kod, (hata as DilektoHatasi).message, (hata as DilektoHatasi).detay);
    expect((hata as DilektoHatasi).kod).toBe("YZ-ANAHTAR");
  }, 30000);
});
