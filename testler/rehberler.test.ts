import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REHBERLER } from "@/content/rehberler";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";
import { MEVZUAT } from "@/lib/mevzuat";
import { yasakliBul } from "@/lib/yasakli-ifadeler";

describe("rehber sayfaları", () => {
  const sabitSayfalar = readdirSync("src/app", { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("["))
    .map((d) => d.name);

  it("adresler benzersiz ve sabit sayfalarla çakışmıyor", () => {
    const sluglar = REHBERLER.map((r) => r.slug);
    expect(new Set(sluglar).size).toBe(sluglar.length);
    for (const s of sluglar) {
      expect(sabitSayfalar).not.toContain(s);
      expect(s).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it.each(REHBERLER.map((r) => [r.slug, r]))("%s: atıflar, bağlantılar ve uzunluklar geçerli", (_, r) => {
    for (const id of [...r.haklar.map((h) => h.mevzuat), ...r.ornek.mevzuat]) expect(MEVZUAT[id], id).toBeDefined();
    for (const s of r.ilgili) expect(REHBERLER.some((x) => x.slug === s), s).toBe(true);
    expect(r.baslik.length).toBeLessThanOrEqual(70);
    expect(r.aciklama.length).toBeLessThanOrEqual(160);
    // Testi önceden dolduran konu, gerçekten seçilebilir olmalı
    const konular = hakemHeyeti.testSorulari({ alisSekli: r.alisSekli ?? "magaza" }).find((s) => s.id === "konu");
    expect(konular?.tip === "secim" && konular.secenekler.some((x) => x.deger === r.konu)).toBe(true);
    expect(yasakliBul(JSON.stringify(r))).toEqual([]);
  });
});
