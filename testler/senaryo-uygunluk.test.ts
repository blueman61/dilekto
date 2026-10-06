// "Hakem heyetine başvurabilir miyim?" testinin tüm kombinasyonları.
// Beklenen sonuç, test dışında bağımsız olarak yeniden yazılmış kurallarla hesaplanır.
import { describe, expect, it } from "vitest";
import { cevaplariDogrula } from "@/lib/dilekce-turleri/ortak";
import { HAKEM_HEYETI_SINIRI } from "@/lib/mevzuat";
import { BUGUN, gunOnce, sunulanKonular, testCevabi, tur, type Konu } from "./yardimci";

const SINIR = HAKEM_HEYETI_SINIRI.tutar;
const TUTARLAR = ["1", "5000", String(SINIR - 1), String(SINIR), "250000"];
const GUNLER = [-1, 0, 13, 14, 15, 29, 30, 31, 729, 730, 731, 1000];

function beklenen(a: { amac: string; taraf: string; konu: Konu; tutar: string; gun: number }) {
  if (a.amac === "ticari" || a.taraf === "birey" || Number(a.tutar) >= SINIR || a.gun < 0) return "uygun-degil";
  const malHizmet = ["ayipli_mal", "kargo_hasar", "ayipli_hizmet"].includes(a.konu);
  if (malHizmet && a.gun > 730) return "uyarili";
  if (a.konu === "cayma" && a.gun > 14) return "uyarili";
  if (a.konu === "teslimat" && a.gun < 30) return "uyarili";
  return "uygun";
}

describe("uygunluk testi: tüm kombinasyonlar", () => {
  let sayac = 0;
  for (const amac of ["kisisel", "ticari"]) {
    for (const taraf of ["firma", "birey"]) {
      for (const alis of ["internet", "magaza"] as const) {
        for (const konu of sunulanKonular(alis)) {
          it(`${amac}/${taraf}/${alis}/${konu}: tutar ve tarih sınırları`, () => {
            for (const tutar of TUTARLAR) {
              for (const gun of GUNLER) {
                const test = testCevabi({ amac, karsiTaraf: taraf, alisSekli: alis, konu, tutar, tarih: gunOnce(gun) });
                // Cevaplar geçerli sayılmalı (sunucu doğrulaması)
                expect(() => cevaplariDogrula(tur.testSorulari(test), test)).not.toThrow();
                const sonuc = tur.uygunluk(test, BUGUN);
                expect(sonuc.durum, `${tutar} TL, ${gun} gün`).toBe(beklenen({ amac, taraf, konu, tutar, gun }));
                expect(sonuc.baslik).toBeTruthy();
                expect(sonuc.aciklamalar.length).toBeGreaterThan(0);
                sayac++;
              }
            }
          });
        }
      }
    }
  }

  it("yeterince çok kombinasyon denendi", () => {
    expect(sayac).toBeGreaterThan(1000);
  });
});

describe("uygunluk testi: nedenlerin metni", () => {
  it("her ret nedeni ayrı bir açıklama olarak listelenir", () => {
    const test = testCevabi({ amac: "ticari", karsiTaraf: "birey", tutar: String(SINIR), tarih: gunOnce(-3) });
    const s = tur.uygunluk(test, BUGUN);
    expect(s.durum).toBe("uygun-degil");
    expect(s.aciklamalar).toHaveLength(4);
    expect(s.aciklamalar.join(" ")).toMatch(/kişisel kullanım/);
    expect(s.aciklamalar.join(" ")).toMatch(/meslek edinmemiş/);
    expect(s.aciklamalar.join(" ")).toMatch(/186\.000 TL/);
    expect(s.aciklamalar.join(" ")).toMatch(/bugünden sonra/);
  });

  it("sınırın altında olunca tutar metni sınırı gösterir", () => {
    const s = tur.uygunluk(testCevabi(), BUGUN);
    expect(s.durum).toBe("uygun");
    expect(s.aciklamalar[0]).toContain("186.000 TL");
  });
});

describe("uygunluk testi: saat dilimi (sunucu UTC'de çalışır, kullanıcı Türkiye'de)", () => {
  // 6 Ekim 21:30 UTC = 7 Ekim 00:30 Türkiye saati
  const GECE = new Date("2026-10-06T21:30:00Z");

  it("Türkiye'de gece yarısından sonra 'bugün' yeni güne sayılır", () => {
    const bugunTr = testCevabi({ tarih: "2026-10-07" });
    expect(tur.uygunluk(bugunTr, GECE).durum).toBe("uygun");
  });

  it("yarının tarihi gece yarısından sonra bile gelecek sayılır", () => {
    const yarin = testCevabi({ tarih: "2026-10-08" });
    expect(tur.uygunluk(yarin, GECE).durum).toBe("uygun-degil");
  });

  it("gece 23:59'da bugün hâlâ bir önceki gündür", () => {
    const ONCE = new Date("2026-10-06T20:59:00Z"); // TR 23:59, 6 Ekim
    expect(tur.uygunluk(testCevabi({ tarih: "2026-10-06" }), ONCE).durum).toBe("uygun");
    expect(tur.uygunluk(testCevabi({ tarih: "2026-10-07" }), ONCE).durum).toBe("uygun-degil");
  });

  it("ayrıca yıl sonu ve artık yıl geçişlerinde gün hesabı doğru", () => {
    const yilBasi = new Date("2027-01-01T09:00:00Z");
    expect(tur.uygunluk(testCevabi({ tarih: "2024-12-31", konu: "ayipli_mal" }), yilBasi).durum).toBe("uyarili"); // 732 gün
    expect(tur.uygunluk(testCevabi({ tarih: "2025-01-02", konu: "ayipli_mal" }), yilBasi).durum).toBe("uygun"); // 729 gün
    const artik = new Date("2028-03-01T09:00:00Z");
    expect(tur.uygunluk(testCevabi({ tarih: "2028-02-29", konu: "cayma" }), artik).durum).toBe("uygun"); // 1 gün
  });
});
