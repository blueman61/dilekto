// Yapay zekâ sağlayıcıları. Hangisinin kullanılacağı Vercel'deki
// YAPAY_ZEKA ayarıyla seçilir: "gemini" (varsayılan), "claude" veya "ornek".
// Anahtarlar yalnızca ortam değişkenlerinden okunur.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { GoogleGenAI } from "@google/genai";
import { TaslakSemasi, taslakJsonSemasi } from "./dogrula";

export type YapayZekaIstegi = { sistem: string; mesaj: string };

export type YapayZekaSaglayicisi = {
  ad: string;
  /** Ham JSON nesnesi döndürür; denetim çağıran tarafta yapılır. */
  uret: (istek: YapayZekaIstegi) => Promise<unknown>;
};

export class YapayZekaHatasi extends Error {}

function gemini(): YapayZekaSaglayicisi {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new YapayZekaHatasi("GEMINI_API_KEY ayarlanmamış.");
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const ai = new GoogleGenAI({ apiKey });
  return {
    ad: `gemini:${model}`,
    async uret({ sistem, mesaj }) {
      const yanit = await ai.models.generateContent({
        model,
        contents: mesaj,
        config: {
          systemInstruction: sistem,
          responseMimeType: "application/json",
          responseJsonSchema: taslakJsonSemasi(),
          temperature: 0.4,
        },
      });
      const metin = yanit.text;
      if (!metin) throw new YapayZekaHatasi("Gemini boş yanıt döndürdü.");
      return JSON.parse(metin);
    },
  };
}

function claude(): YapayZekaSaglayicisi {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new YapayZekaHatasi("ANTHROPIC_API_KEY ayarlanmamış.");
  const model = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
  const client = new Anthropic({ apiKey });
  return {
    ad: `claude:${model}`,
    async uret({ sistem, mesaj }) {
      const yanit = await client.beta.messages.parse({
        model,
        max_tokens: 16000,
        system: sistem,
        messages: [{ role: "user", content: mesaj }],
        output_config: { effort: "medium", format: betaZodOutputFormat(TaslakSemasi) },
        // Güvenlik filtresi isteği reddederse Anthropic aynı isteği uygun
        // bir modelle otomatik olarak yeniden dener.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      if (yanit.stop_reason === "refusal") throw new YapayZekaHatasi("Claude isteği reddetti.");
      if (!yanit.parsed_output) throw new YapayZekaHatasi("Claude geçerli JSON döndürmedi.");
      return yanit.parsed_output;
    },
  };
}

/**
 * Yapay zekâ kullanmadan, yalnızca kullanıcının cevaplarından örnek metin
 * üretir. Yerel geliştirme ve anahtarsız deneme içindir.
 */
function ornek(): YapayZekaSaglayicisi {
  return {
    ad: "ornek",
    async uret({ mesaj }) {
      const json = mesaj.slice(mesaj.indexOf("{"), mesaj.indexOf("\n}\n") + 2);
      const v = JSON.parse(json) as Record<string, string>;
      return {
        konuOzeti: `${v.urunVeyaHizmet} ile ilgili uyuşmazlık hakkında başvuru`,
        olaylar: [
          `${v.satinAlmaTarihi} tarihinde karşı taraf ${v.satici} üzerinden ${v.urunVeyaHizmet} satın aldım ve ${v.odenenTutar} ödedim.`,
          v.tuketicininAnlatimi,
          v.saticiyaBildirildiMi.startsWith("Evet")
            ? "Durumu karşı tarafa bildirdim; ancak sorunum bugüne kadar çözülmedi."
            : "Sorunun çözülmesi için hakem heyetinize başvurmak zorunda kaldım.",
        ],
        talepMetni: `Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri ${v.odenenTutar} olan başvurumun kabulü ile talebim doğrultusunda (${v.talep.toLocaleLowerCase("tr-TR")}) karar verilmesini saygılarımla arz ve talep ederim.`,
        ekMevzuat: [],
      };
    },
  };
}

export function saglayiciSec(): YapayZekaSaglayicisi {
  const secim = (process.env.YAPAY_ZEKA || "gemini").toLowerCase();
  if (secim === "claude") return claude();
  if (secim === "ornek") return ornek();
  return gemini();
}
