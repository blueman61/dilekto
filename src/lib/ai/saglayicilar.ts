// Yapay zekâ sağlayıcıları. Hangisinin kullanılacağı Vercel'deki
// YAPAY_ZEKA ayarıyla seçilir: "gemini" (varsayılan), "claude" veya "ornek".
// Anahtarlar yalnızca ortam değişkenlerinden okunur.
//
// Her hata, kullanıcıya gösterilebilecek bir hata koduna çevrilir
// (bkz. src/lib/hatalar.ts).

import { ayar } from "@/lib/ayar";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { DilektoHatasi } from "@/lib/hatalar";

/** Yapay zekâya gönderilecek dosya (ör. fatura fotoğrafı) */
export type Ek = { tur: string; veri: string /* base64 */ };

export type YapayZekaIstegi = {
  sistem: string;
  mesaj: string;
  sema: z.ZodType;
  ekler?: Ek[];
  /** "ornek" sağlayıcısında yapay zekâ yerine kullanılacak yanıt */
  ornekYanit: () => unknown;
};

export type YapayZekaSaglayicisi = {
  ad: () => string;
  /** Ham JSON nesnesi döndürür; denetim çağıran tarafta yapılır. */
  uret: (istek: YapayZekaIstegi) => Promise<unknown>;
};

/** Gemini için sadeleştirilmiş JSON şeması */
function jsonSemasi(sema: z.ZodType): Record<string, unknown> {
  const temizle = (d: unknown): unknown => {
    if (Array.isArray(d)) return d.map(temizle);
    if (d && typeof d === "object") {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(d)) {
        if (k === "$schema" || k === "additionalProperties") continue;
        o[k] = temizle(v);
      }
      return o;
    }
    return d;
  };
  return temizle(z.toJSONSchema(sema)) as Record<string, unknown>;
}

/** Yanıttaki JSON'u ayıklar (```json ... ``` kalıbı dahil) */
export function jsonAyikla(metin: string | undefined): unknown {
  if (!metin) throw new DilektoHatasi("YZ-DENETIM", "Yapay zekâ boş yanıt döndürdü.");
  const temiz = metin.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(temiz);
  } catch {
    throw new DilektoHatasi("YZ-DENETIM", "Yapay zekâ yanıtı JSON değil.", temiz.slice(0, 300));
  }
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

// Model adları zamanla değişebildiği ve ücretsiz katmanda her modelin kendi
// kullanım sınırı olduğu için modeller sırayla denenir; çalışan model
// hatırlanır. GEMINI_MODEL ayarlanırsa önce o denenir.
const GEMINI_MODELLERI = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
let calisanGeminiModeli: string | null = null;

/** Vercel en fazla 60 sn bekler; denemeler bu süreyi aşmasın */
const GEMINI_ZAMAN_SINIRI_MS = 40_000;
const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

type GeminiSonucu =
  | { tur: "model-yok" }
  | { tur: "sema-sorunu"; ayrinti: string }
  | { tur: "gecici"; kod: "YZ-KOTA" | "YZ-BAGLANTI"; ayrinti: string }
  | { tur: "kalici"; hata: DilektoHatasi };

/** Gemini hatasını sınıflandırır: başka modelle/tekrar denenebilir mi? */
export function geminiHatasiniSinifla(e: unknown): GeminiSonucu {
  if (e instanceof DilektoHatasi) return { tur: "kalici", hata: e };
  if (e instanceof ApiError) {
    const m = e.message ?? "";
    const ayrinti = `HTTP ${e.status}: ${m.slice(0, 300)}`;
    if (e.status === 404) return { tur: "model-yok" };
    if (e.status === 401 || e.status === 403 || /api[ _-]?key/i.test(m))
      return { tur: "kalici", hata: new DilektoHatasi("YZ-ANAHTAR", "Gemini anahtarı geçersiz.", ayrinti) };
    if (/location is not supported|not available in your (country|region)|unsupported.*(region|location)/i.test(m))
      return {
        tur: "kalici",
        hata: new DilektoHatasi("YZ-BOLGE", "Gemini, sitenin çalıştığı bölgeden kullanılamıyor.", ayrinti),
      };
    if (e.status === 429) return { tur: "gecici", kod: "YZ-KOTA", ayrinti };
    if (e.status === 400) return { tur: "sema-sorunu", ayrinti };
    return { tur: "gecici", kod: "YZ-BAGLANTI", ayrinti };
  }
  return { tur: "gecici", kod: "YZ-BAGLANTI", ayrinti: e instanceof Error ? e.message : String(e) };
}

function gemini(): YapayZekaSaglayicisi {
  const apiKey = ayar("GEMINI_API_KEY");
  if (!apiKey) throw new DilektoHatasi("YZ-AYAR", "GEMINI_API_KEY ayarlanmamış.");
  const ai = new GoogleGenAI({ apiKey });
  const adaylar = [...new Set([ayar("GEMINI_MODEL"), ...GEMINI_MODELLERI].filter(Boolean) as string[])];

  async function cagir(model: string, istek: YapayZekaIstegi, semaIle: boolean) {
    const contents = istek.ekler?.length
      ? [
          {
            role: "user",
            parts: [
              ...istek.ekler.map((e) => ({ inlineData: { mimeType: e.tur, data: e.veri } })),
              { text: istek.mesaj },
            ],
          },
        ]
      : istek.mesaj;
    const yanit = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: istek.sistem,
        responseMimeType: "application/json",
        ...(semaIle ? { responseJsonSchema: jsonSemasi(istek.sema) } : {}),
        temperature: 0.4,
      },
    });
    return jsonAyikla(yanit.text);
  }

  return {
    ad: () => `gemini:${calisanGeminiModeli ?? adaylar[0]}`,
    async uret(istek) {
      const baslangic = Date.now();
      const sira = calisanGeminiModeli
        ? [calisanGeminiModeli, ...adaylar.filter((m) => m !== calisanGeminiModeli)]
        : adaylar;
      const denemeler: string[] = [];
      let sonGeciciKod: "YZ-KOTA" | "YZ-BAGLANTI" | null = null;

      for (const model of sira) {
        let semaIle = true;
        let geciciTekrar = 0;
        // Aynı model: şema sorununda şemasız, geçici sorunda bir kez daha dene
        while (Date.now() - baslangic < GEMINI_ZAMAN_SINIRI_MS) {
          try {
            const sonuc = await cagir(model, istek, semaIle);
            calisanGeminiModeli = model;
            return sonuc;
          } catch (e) {
            const s = geminiHatasiniSinifla(e);
            if (s.tur === "kalici") throw s.hata;
            if (s.tur === "model-yok") {
              denemeler.push(`${model}: bulunamadı`);
              break;
            }
            if (s.tur === "sema-sorunu") {
              denemeler.push(`${model}${semaIle ? "" : " (şemasız)"}: ${s.ayrinti}`);
              if (semaIle) {
                semaIle = false;
                continue;
              }
              sonGeciciKod = "YZ-BAGLANTI";
              break;
            }
            denemeler.push(`${model}: ${s.ayrinti}`);
            sonGeciciKod = s.kod;
            // Kota dolduysa aynı modeli tekrar denemenin anlamı yok
            if (s.kod === "YZ-KOTA" || geciciTekrar >= 1) break;
            geciciTekrar++;
            await bekle(1500);
          }
        }
      }
      console.error("Gemini denemeleri başarısız:", denemeler);
      if (!sonGeciciKod) {
        throw new DilektoHatasi("YZ-MODEL", `Denenen Gemini modellerinin hiçbiri bulunamadı: ${sira.join(", ")}`);
      }
      throw new DilektoHatasi(
        sonGeciciKod,
        sonGeciciKod === "YZ-KOTA" ? "Gemini kullanım sınırı doldu." : "Gemini yanıt veremedi.",
        denemeler,
      );
    },
  };
}

// ---------------------------------------------------------------------------
// Claude
// ---------------------------------------------------------------------------

function claude(): YapayZekaSaglayicisi {
  const apiKey = ayar("ANTHROPIC_API_KEY");
  if (!apiKey) throw new DilektoHatasi("YZ-AYAR", "ANTHROPIC_API_KEY ayarlanmamış.");
  const model = ayar("CLAUDE_MODEL") || "claude-sonnet-5-5";
  const client = new Anthropic({ apiKey });
  return {
    ad: () => `claude:${model}`,
    async uret(istek) {
      const ekler: Anthropic.Beta.BetaContentBlockParam[] = (istek.ekler ?? []).map((e) =>
        e.tur === "application/pdf"
          ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: e.veri } }
          : {
              type: "image",
              source: {
                type: "base64",
                media_type: e.tur as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: e.veri,
              },
            },
      );
      try {
        const yanit = await client.beta.messages.parse({
          model,
          max_tokens: 16000,
          system: istek.sistem,
          messages: [{ role: "user", content: [...ekler, { type: "text", text: istek.mesaj }] }],
          output_config: { effort: "medium", format: betaZodOutputFormat(istek.sema) },
          // Güvenlik filtresi isteği reddederse Anthropic aynı isteği uygun
          // bir modelle otomatik olarak yeniden dener.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        if (yanit.stop_reason === "refusal") throw new DilektoHatasi("YZ-RED", "Claude isteği reddetti.");
        if (!yanit.parsed_output) throw new DilektoHatasi("YZ-DENETIM", "Claude geçerli JSON döndürmedi.");
        return yanit.parsed_output;
      } catch (e) {
        if (e instanceof DilektoHatasi) throw e;
        if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError)
          throw new DilektoHatasi("YZ-ANAHTAR", "Claude anahtarı geçersiz.", e.message);
        if (e instanceof Anthropic.NotFoundError) throw new DilektoHatasi("YZ-MODEL", `Claude modeli bulunamadı: ${model}`, e.message);
        if (e instanceof Anthropic.RateLimitError) throw new DilektoHatasi("YZ-KOTA", "Claude kullanım sınırı doldu.", e.message);
        if (e instanceof Anthropic.APIError) throw new DilektoHatasi("YZ-BAGLANTI", `Claude hata verdi (${e.status}).`, e.message);
        throw new DilektoHatasi("YZ-BAGLANTI", "Claude'a ulaşılamadı.", e instanceof Error ? e.message : e);
      }
    },
  };
}

// ---------------------------------------------------------------------------

/** Yapay zekâ kullanmadan örnek yanıt döndürür (yerel geliştirme için). */
function ornek(): YapayZekaSaglayicisi {
  return { ad: () => "ornek", uret: async (istek) => istek.ornekYanit() };
}

export function saglayiciSec(): YapayZekaSaglayicisi {
  const secim = (ayar("YAPAY_ZEKA") || "gemini").toLowerCase();
  if (secim === "claude") return claude();
  if (secim === "ornek") return ornek();
  return gemini();
}
