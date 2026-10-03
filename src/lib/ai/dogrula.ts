// Yapay zekâ çıktısının denetimi. Kurala uymayan metin kullanıcıya
// gösterilmez; yapay zekâdan bir kez daha yazması istenir.

import { z } from "zod";
import { yasakliBul } from "@/lib/yasakli-ifadeler";
import type { TaslakCiktisi } from "@/lib/dilekce-turleri/tipler";

export const TaslakSemasi = z.object({
  konuOzeti: z.string(),
  olaylar: z.array(z.string()),
  talepMetni: z.string(),
  ekMevzuat: z.array(z.string()),
});

// Metinde kanun / madde numarası geçmesini yakalar:
// "6502 sayılı", "madde 11", "11. madde", "m. 11", "md. 11", "11 inci maddesi"
const MADDE_DESENLERI: RegExp[] = [
  /\d+\s*sayılı/iu,
  /\b(madde|maddesi|maddesinin|md\.?|m\.)\s*\d+/iu,
  /\d+\s*['’]?\s*(\.|inci|ıncı|üncü|uncu|nci|ncı|ncü|ncu)\s*madde/iu,
  /\bfıkra/iu,
];

export type DenetimSonucu =
  | { tamam: true; cikti: TaslakCiktisi }
  | { tamam: false; sorunlar: string[] };

export function ciktiyiDenetle(ham: unknown, secilebilir: string[]): DenetimSonucu {
  const ayrisma = TaslakSemasi.safeParse(ham);
  if (!ayrisma.success) {
    return { tamam: false, sorunlar: ["Çıktı istenen JSON yapısında değil."] };
  }
  const c = ayrisma.data;
  const sorunlar: string[] = [];

  const konuOzeti = c.konuOzeti.trim();
  const talepMetni = c.talepMetni.trim();
  const olaylar = c.olaylar.map((p) => p.trim().replace(/^\d{1,2}[.)]\s+/, "")).filter(Boolean);

  if (konuOzeti.length < 5 || konuOzeti.length > 200) sorunlar.push("konuOzeti 5-200 karakter olmalı.");
  if (olaylar.length < 1 || olaylar.length > 8) sorunlar.push("olaylar 1-8 paragraf olmalı.");
  if (olaylar.some((p) => p.length > 1500)) sorunlar.push("Paragraflar en fazla 1500 karakter olmalı.");
  if (talepMetni.length < 20 || talepMetni.length > 1500) sorunlar.push("talepMetni 20-1500 karakter olmalı.");

  const tumMetin = [konuOzeti, ...olaylar, talepMetni].join("\n");
  const yasakli = yasakliBul(tumMetin);
  if (yasakli.length) sorunlar.push(`Yasaklı ifade kullanıldı: ${yasakli.join(", ")}.`);
  if (MADDE_DESENLERI.some((d) => d.test(tumMetin))) {
    sorunlar.push("Metinde kanun/madde/fıkra numarası geçiyor; hiçbir atıf numarası yazılmamalı.");
  }

  const izinli = new Set(secilebilir);
  const ekMevzuat = [...new Set(c.ekMevzuat)].filter((id) => izinli.has(id));

  if (sorunlar.length) return { tamam: false, sorunlar };
  return { tamam: true, cikti: { konuOzeti, olaylar, talepMetni, ekMevzuat } };
}
