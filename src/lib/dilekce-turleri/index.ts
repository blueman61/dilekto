// Sitedeki tüm dilekçe türleri. Yeni bir tür eklemek için:
//   1. src/lib/dilekce-turleri/<yeni-tur>/index.ts dosyasında DilekceTuru tanımlayın
//      (sorular, uygunluk testi, yapay zekâ talimatı, izinli mevzuat, metin şablonu).
//   2. Gerekirse src/lib/mevzuat.ts listesine doğrulanmış maddeleri ekleyin.
//   3. Aşağıdaki listeye ekleyin. Site, adresleri ve sayfaları kendisi oluşturur.

import { hakemHeyeti } from "./hakem-heyeti";
import type { DilekceTuru } from "./tipler";

export const DILEKCE_TURLERI: DilekceTuru[] = [hakemHeyeti];

export function turGetir(id: string): DilekceTuru | undefined {
  return DILEKCE_TURLERI.find((t) => t.id === id);
}
