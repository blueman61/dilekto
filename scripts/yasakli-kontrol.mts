// Sitenin kaynak metinlerinde yasaklı ifade arar.
// Bulursa hata verir ve derleme (dolayısıyla yayın) durur.
// Çalıştırma: npm run kontrol

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { yasakliBul } from "../src/lib/yasakli-ifadeler.ts";

const KOK = join(import.meta.dirname, "..");
const TARANACAK = ["src", "public"];
const UZANTILAR = [".ts", ".tsx", ".md", ".json", ".txt", ".html"];
// Kuralların kendisini tanımlayan dosya taranmaz.
const HARIC = ["src/lib/yasakli-ifadeler.ts"];

function dosyalar(klasor: string): string[] {
  const sonuc: string[] = [];
  for (const ad of readdirSync(klasor)) {
    const yol = join(klasor, ad);
    if (statSync(yol).isDirectory()) sonuc.push(...dosyalar(yol));
    else if (UZANTILAR.some((u) => ad.endsWith(u))) sonuc.push(yol);
  }
  return sonuc;
}

let hata = 0;
for (const k of TARANACAK) {
  for (const yol of dosyalar(join(KOK, k))) {
    const goreli = relative(KOK, yol);
    if (HARIC.includes(goreli)) continue;
    readFileSync(yol, "utf8")
      .split("\n")
      .forEach((satir, i) => {
        const bulunan = yasakliBul(satir);
        if (bulunan.length) {
          hata++;
          console.error(`${goreli}:${i + 1}  →  ${bulunan.join(", ")}\n    ${satir.trim()}`);
        }
      });
  }
}

if (hata) {
  console.error(`\nYasaklı ifade kontrolü BAŞARISIZ: ${hata} satır düzeltilmeli.`);
  process.exit(1);
}
console.log("Yasaklı ifade kontrolü: temiz.");
