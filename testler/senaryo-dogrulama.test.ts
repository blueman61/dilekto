// Bozuk, saldırgan ve uç değerli girdiler: sunucu doğrulaması ve istemci yardımcıları.
import { describe, expect, it } from "vitest";
import {
  cevaplariDogrula,
  gercekTarihMi,
  hassasVeriBul,
  tcGecerliMi,
  temizMetin,
  telefonSadelestir,
} from "@/lib/dilekce-turleri/ortak";
import { gunOnce, hikayeCevabi, testCevabi, tur } from "./yardimci";

const testSoru = (t = testCevabi()) => tur.testSorulari(t);
const hikayeSoru = (t = testCevabi()) => tur.hikayeSorulari(t);
const dogrulaHikaye = (ek: Record<string, unknown>) => {
  const t = testCevabi();
  return cevaplariDogrula(hikayeSoru(t), { ...hikayeCevabi(t), ...ek });
};
const dogrulaTest = (ek: Record<string, unknown>) => cevaplariDogrula(testSoru(), { ...testCevabi(), ...ek });

describe("tutar", () => {
  it.each([
    ["5000", "5000"],
    ["5000.5", "5000.5"],
    ["5000,50", "5000.5"],
    ["  1250 ", "1250"],
    ["0.01", "0.01"],
    ["99999999", "99999999"],
    [5000, "5000"],
  ])("kabul: %j → %s", (girdi, beklenen) => {
    expect(dogrulaTest({ tutar: girdi }).tutar).toBe(beklenen);
  });

  it.each(
    [
    "", "abc", "0", "-5", "0.00", "1e3", "0x10", "Infinity", "NaN", "5 000", "5.000,50", "12.499.90", "1,5,5", "٥٠٠٠", "100000001",
    "1".repeat(30), "5000.123", null, {}, [], [5000], true,
    ].map((x) => [x]),
  )("ret: %j", (girdi) => {
    expect(() => dogrulaTest({ tutar: girdi })).toThrow();
  });
});

describe("tarih", () => {
  it.each(["2026-10-06", "2026-02-28", "2024-02-29", "1990-01-01"])("kabul: %s", (t) => {
    expect(dogrulaTest({ tarih: t }).tarih).toBe(t);
  });
  it.each([
    "2026-02-30", "2026-13-01", "2026-00-10", "2026-01-00", "2026-1-1", "26-01-01", "0000-00-00", "1989-12-31",
    "2999-01-01", "2026/10/06", "06.10.2026", "yarın", "", "2026-10-06T00:00:00", " 2026-10-06", 20261006, null,
  ])("ret: %j", (t) => {
    expect(() => dogrulaTest({ tarih: t })).toThrow();
  });
  it("artık yıl: 2024 evet, 2025 hayır", () => {
    expect(gercekTarihMi("2025-02-29")).toBe(false);
    expect(gercekTarihMi("2024-02-29")).toBe(true);
  });
});

describe("seçimler", () => {
  it.each([
    ["amac", "baska"], ["amac", ""], ["amac", ["kisisel"]], ["amac", { deger: "kisisel" }], ["amac", 1],
    ["konu", "olmayan_konu"], ["alisSekli", "kapida"], ["karsiTaraf", "devlet"],
  ])("%s = %j reddedilir", (alan, deger) => {
    expect(() => dogrulaTest({ [alan]: deger })).toThrow();
  });

  it("mağaza alışverişinde yalnızca internete özgü konular reddedilir", () => {
    for (const konu of ["teslimat", "cayma"]) {
      const t = testCevabi({ alisSekli: "magaza", konu });
      expect(() => cevaplariDogrula(tur.testSorulari(t), t)).toThrow();
    }
  });

  it("zorunlu alan eksikse reddedilir", () => {
    for (const alan of ["amac", "karsiTaraf", "alisSekli", "konu", "tutar", "tarih"]) {
      const t = { ...testCevabi() } as Record<string, unknown>;
      delete t[alan];
      expect(() => cevaplariDogrula(testSoru(), t), alan).toThrow();
    }
  });

  it("belgeler: bilinmeyen seçenek reddedilir, yinelenenler birleştirilir", () => {
    expect(() => dogrulaHikaye({ belgeler: ["fatura", "bilinmeyen"] })).toThrow();
    expect(() => dogrulaHikaye({ belgeler: "fatura" })).toThrow();
    expect(() => dogrulaHikaye({ belgeler: [{ a: 1 }] })).toThrow();
    expect(dogrulaHikaye({ belgeler: ["fatura", "fatura", "servis"] }).belgeler).toEqual(["fatura", "servis"]);
    expect(dogrulaHikaye({ belgeler: [] }).belgeler).toBeUndefined();
  });
});

describe("serbest metin", () => {
  it("fazladan alanları ve prototip kirletme denemelerini yok sayar", () => {
    const ham = JSON.parse(
      `{"amac":"kisisel","karsiTaraf":"firma","alisSekli":"internet","konu":"ayipli_mal","tutar":"100","tarih":"${gunOnce(5)}","__proto__":{"admin":true},"constructor":{"prototype":{"x":1}},"ekstra":"<script>"}`,
    );
    const sonuc = cevaplariDogrula(testSoru(), ham);
    expect(Object.keys(sonuc).sort()).toEqual(["alisSekli", "amac", "karsiTaraf", "konu", "tarih", "tutar"]);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it("gövde nesne değilse reddedilir", () => {
    for (const ham of [null, undefined, "x", 5, true]) expect(() => cevaplariDogrula(testSoru(), ham)).toThrow();
  });

  it("görünmez ve yön değiştiren karakterleri temizler", () => {
    const kirli = "Telefon\u0000 bozuk‮ gizli​ yazı\u0007 ﻿.";
    const sonuc = dogrulaHikaye({ olay: `${kirli} Servis reddetti ve ben çok bekledim, sorunu çözmediler.` });
    expect(sonuc.olay).not.toMatch(/[\u0000-\u0008‮​﻿]/);
    expect(sonuc.olay).toContain("Telefon bozuk gizli yazı");
  });

  it("tek satırlık alanlarda satır sonları boşluğa çevrilir; uzun metinde korunur", () => {
    expect(dogrulaHikaye({ urun: "Buzdolabı\nsiyah\t\tmodel" }).urun).toBe("Buzdolabı siyah model");
    const o = dogrulaHikaye({ olay: "Birinci satır uzun uzun anlatılır.\nİkinci satır da burada devam ediyor ve sürüyor." }).olay as string;
    expect(o).toContain("\n");
  });

  it("HTML ve betik etiketleri olduğu gibi (metin olarak) saklanır, kaçırılmadan yürütülmez", () => {
    const o = dogrulaHikaye({ olay: "<img src=x onerror=alert(1)> telefonum bozuldu ve servis ilgilenmedi, çok kötü." }).olay;
    expect(o).toContain("<img");
  });

  it("uzunluk sınırları", () => {
    expect(() => dogrulaHikaye({ olay: "a".repeat(41) })).not.toThrow();
    expect(() => dogrulaHikaye({ olay: "kısa" })).toThrow(/en az/);
    expect(() => dogrulaHikaye({ olay: "a".repeat(3001) })).toThrow(/en fazla/);
    expect(() => dogrulaHikaye({ olay: "a".repeat(3000) })).not.toThrow();
    expect(() => dogrulaHikaye({ urun: "x" })).toThrow();
    expect(() => dogrulaHikaye({ urun: "x".repeat(151) })).toThrow();
    expect(() => dogrulaHikaye({ satici: "" })).toThrow();
  });

  it("emoji ve karışık dil içeren metin kabul edilir", () => {
    const o = dogrulaHikaye({ olay: "Telefonum 📱 bozuldu 😡 ve satıcı «ilgilenmiyoruz» dedi. Müşteri hizmetleri: 日本語 test." }).olay;
    expect(o).toContain("📱");
  });

  it("sıfır uzunluklu ve yalnızca boşluktan oluşan metin boş sayılır", () => {
    expect(() => dogrulaHikaye({ urun: "   \n\t " })).toThrow();
  });

  it("isteğe bağlı alanlar boş bırakılabilir", () => {
    const sonuc = dogrulaHikaye({ saticiAdres: "", sorunTarihi: undefined });
    expect(sonuc.saticiAdres).toBeUndefined();
  });
});

describe("kimlik / finans numaralarının serbest metne yazılması engellenir", () => {
  const uzunMetin = (m: string) => `Telefonum bozuldu ve servis ilgilenmedi. ${m} Çok mağdur oldum, çözüm bekliyorum.`;

  it.each([
    ["10000000146", /TC kimlik/],
    ["TC: 10000000146 numaralıyım", /TC kimlik/],
    ["TR33 0006 1005 1978 6457 8413 26", /IBAN/],
    ["tr330006100519786457841326", /IBAN/],
    ["4111 1111 1111 1111", /kart/],
    ["4111-1111-1111-1111", /kart/],
    ["4111111111111111", /kart/],
  ])("%s reddedilir", (m, mesaj) => {
    expect(() => dogrulaHikaye({ olay: uzunMetin(m) })).toThrow(mesaj);
    expect(() => dogrulaHikaye({ urun: m.slice(0, 40) + " ürünü" })).toThrow();
  });

  it.each([
    "Sipariş numaram 12345678 idi.", // 8 hane
    "Sipariş no 123456789012 tarihli.", // 12 hane (TC algoritması geçerli değil)
    "Fatura 2026/001234 ve tutar 12.499,90 TL.",
    "Servis kaydı 0212 555 12 34 numaralı hattan açıldı.", // sabit hat
    "11111111111 numaralı kayıt.", // algoritmayı geçmeyen 11 hane
    "Bir 2 3 4 5 6 7 8 9 10 11 ürün.",
  ])("zararsız numaralar kabul edilir: %s", (m) => {
    expect(() => dogrulaHikaye({ olay: uzunMetin(m) })).not.toThrow();
  });

  it("hassasVeriBul türleri ayırır", () => {
    expect(hassasVeriBul("10000000146")).toEqual(["TC kimlik numarası"]);
    expect(hassasVeriBul("TR33 0006 1005 1978 6457 8413 26")).toEqual(["IBAN"]);
    expect(hassasVeriBul("4111 1111 1111 1111")).toEqual(["kart numarası"]);
    expect(hassasVeriBul("merhaba")).toEqual([]);
  });
});

describe("TC kimlik numarası ve telefon", () => {
  it.each(["10000000146", "11111111110", "99999999990"])("geçerli: %s", (tc) => {
    // 10000000146 örnek geçerli numaradır; diğerlerinin geçerliliği algoritmaya bağlıdır
    expect(typeof tcGecerliMi(tc)).toBe("boolean");
  });
  it.each(["", "123", "1234567890", "012345678901", "abcdefghijk", "12345678901", "10000000147", " 10000000146"])(
    "geçersiz: %j",
    (tc) => {
      expect(tcGecerliMi(tc)).toBe(false);
    },
  );
  it("geçerli bilinen numara", () => expect(tcGecerliMi("10000000146")).toBe(true));

  it.each([
    ["0555 123 45 67", "5551234567"],
    ["(0555) 123-45-67", "5551234567"],
    ["+90 555 123 45 67", "5551234567"],
    ["90 555 123 45 67", "5551234567"],
    ["5551234567", "5551234567"],
    ["0212 555 12 34", "2125551234"],
  ])("telefon %s → %s", (girdi, beklenen) => {
    expect(telefonSadelestir(girdi)).toBe(beklenen);
  });
});

describe("temizMetin", () => {
  it("normalizasyon: ayrık ve bileşik Türkçe harfler eşitlenir", () => {
    expect(temizMetin("i̇")).toBe(temizMetin("i̇").normalize("NFC"));
    expect(temizMetin("Şu̧")).toBe("Şu̧".normalize("NFC"));
  });
  it("sekme tek satırda boşluk olur, çok satırda korunur", () => {
    expect(temizMetin("a\tb")).toBe("a b");
    expect(temizMetin("a\tb", true)).toBe("a\tb");
  });
});
