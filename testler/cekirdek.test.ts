import { describe, expect, it } from "vitest";
import { ciktiyiDenetle } from "@/lib/ai/dogrula";
import { bicimle } from "@/lib/belge/bicim";
import { hakemHeyeti as tur } from "@/lib/dilekce-turleri/hakem-heyeti";
import { cevaplariDogrula, tcGecerliMi } from "@/lib/dilekce-turleri/ortak";
import { HAKEM_HEYETI_SINIRI, MEVZUAT, hukukiNedenlerYaz } from "@/lib/mevzuat";
import { yasakliBul } from "@/lib/yasakli-ifadeler";

const BUGUN = new Date("2026-10-02T12:00:00");

const testCevaplari = {
  amac: "kisisel",
  karsiTaraf: "firma",
  alisSekli: "internet",
  konu: "ayipli_mal",
  tutar: "12499",
  tarih: "2026-08-15",
};

const hikaye = {
  urun: "Samsung Galaxy A55 cep telefonu",
  satici: "ABC Elektronik A.Ş.",
  olay: "Telefonun ekranı üç hafta sonra kendiliğinden kapanmaya başladı. Servise gönderdim, ücretsiz onarımı reddettiler.",
  bildirim: "evet",
  talep: "iade",
  belgeler: ["fatura", "servis"],
};

const iyiCikti = {
  konuOzeti: "Ayıplı cep telefonunun bedelinin iadesi talebi",
  olaylar: ["15.08.2026 tarihinde telefonu satın aldım.", "Ekran kendiliğinden kapanmaya başladı."],
  talepMetni:
    "Yukarıda açıkladığım nedenlerle, 12.499 TL bedelin iadesine karar verilmesini saygılarımla arz ve talep ederim.",
  ekMevzuat: ["6502-m10"],
};

describe("yasaklı ifadeler", () => {
  it("yasaklı ifadeleri yakalar", () => {
    expect(yasakliBul("Avukatınıza danışın")).not.toEqual([]);
    expect(yasakliBul("Hukuki danışmanlık hizmeti")).not.toEqual([]);
    expect(yasakliBul("Sonuç garantili")).not.toEqual([]);
    expect(yasakliBul("Ürün garanti kapsamında")).not.toEqual([]);
    expect(yasakliBul("Kesin kazanırsınız")).not.toEqual([]);
  });
  it("garanti belgesi ve garanti süresine izin verir", () => {
    expect(yasakliBul("Garanti belgesinin fotokopisi")).toEqual([]);
    expect(yasakliBul("Ürün garanti süresi içinde bozuldu")).toEqual([]);
    expect(yasakliBul("Hukuki nedenler")).toEqual([]);
  });
});

describe("yapay zekâ çıktı denetimi", () => {
  const secilebilir = tur.yapayZeka.secilebilirMevzuat(testCevaplari, hikaye);

  it("kurala uygun çıktıyı kabul eder", () => {
    const d = ciktiyiDenetle(iyiCikti, secilebilir);
    expect(d.tamam).toBe(true);
  });

  it.each([
    "6502 sayılı Kanun uyarınca",
    "Kanunun 11. maddesi gereğince",
    "madde 11 uyarınca",
    "m. 11 gereği",
    "11 inci madde",
    "ilgili fıkra uyarınca",
  ])("madde numarası içeren metni reddeder: %s", (ifade) => {
    const d = ciktiyiDenetle({ ...iyiCikti, olaylar: [`Telefon bozuldu, ${ifade} iade istedim.`] }, secilebilir);
    expect(d.tamam).toBe(false);
  });

  it("yasaklı ifade içeren metni reddeder", () => {
    const d = ciktiyiDenetle({ ...iyiCikti, talepMetni: "Avukatım aracılığıyla bedelin iadesini talep ederim." }, secilebilir);
    expect(d.tamam).toBe(false);
  });

  it("paragraf numarasını siler ama tarihe dokunmaz", () => {
    const d = ciktiyiDenetle({ ...iyiCikti, olaylar: ["1. İlk paragraf.", "15.08.2026 tarihinde aldım."] }, secilebilir);
    expect(d.tamam && d.cikti.olaylar).toEqual(["İlk paragraf.", "15.08.2026 tarihinde aldım."]);
  });

  it("listede olmayan mevzuatı ayıklar", () => {
    const d = ciktiyiDenetle({ ...iyiCikti, ekMevzuat: ["6502-m10", "6502-m999", "6502-m48-4"] }, secilebilir);
    expect(d.tamam && d.cikti.ekMevzuat).toEqual(["6502-m10"]);
  });
});

describe("uygunluk testi", () => {
  it("uygun durumu tanır", () => {
    expect(tur.uygunluk(testCevaplari, BUGUN).durum).toBe("uygun");
  });
  it("ticari alışverişi reddeder", () => {
    expect(tur.uygunluk({ ...testCevaplari, amac: "ticari" }, BUGUN).durum).toBe("uygun-degil");
  });
  it("bireyden alımı reddeder", () => {
    expect(tur.uygunluk({ ...testCevaplari, karsiTaraf: "birey" }, BUGUN).durum).toBe("uygun-degil");
  });
  it("parasal sınırı uygular", () => {
    const sinir = String(HAKEM_HEYETI_SINIRI.tutar);
    const altinda = String(HAKEM_HEYETI_SINIRI.tutar - 1);
    expect(tur.uygunluk({ ...testCevaplari, tutar: sinir }, BUGUN).durum).toBe("uygun-degil");
    expect(tur.uygunluk({ ...testCevaplari, tutar: altinda }, BUGUN).durum).toBe("uygun");
  });
  it("2 yıldan eski alımda uyarır", () => {
    expect(tur.uygunluk({ ...testCevaplari, tarih: "2024-01-01" }, BUGUN).durum).toBe("uyarili");
  });
  it("mağaza alışverişinde cayma seçeneği sunmaz", () => {
    const sorular = tur.testSorulari({ alisSekli: "magaza" });
    expect(() => cevaplariDogrula(sorular, { ...testCevaplari, alisSekli: "magaza", konu: "cayma" })).toThrow();
  });
});

describe("mevzuat listesi", () => {
  it("türlerin kullandığı tüm kayıtlar listede var", () => {
    for (const konu of ["ayipli_mal", "kargo_hasar", "ayipli_hizmet", "teslimat", "cayma", "diger"]) {
      const t = { ...testCevaplari, konu };
      for (const id of [...tur.yapayZeka.zorunluMevzuat(t, hikaye), ...tur.yapayZeka.secilebilirMevzuat(t, hikaye)]) {
        expect(MEVZUAT[id], id).toBeDefined();
      }
    }
  });
  it("atıfları sıralı yazar", () => {
    expect(hukukiNedenlerYaz(["6502-m68", "6502-m8", "6502-m11"])).toBe(
      "6502 sayılı Tüketicinin Korunması Hakkında Kanun m. 8, m. 11, m. 68",
    );
  });
});

describe("TC kimlik numarası", () => {
  it("geçerli ve geçersiz numaraları ayırır", () => {
    expect(tcGecerliMi("10000000146")).toBe(true);
    expect(tcGecerliMi("12345678901")).toBe(false);
    expect(tcGecerliMi("0123")).toBe(false);
  });
});

describe("dilekçe metni", () => {
  const metin = tur.metinOlustur({
    test: testCevaplari,
    hikaye,
    cikti: iyiCikti,
    kisisel: { adSoyad: "Ayşe Yılmaz", il: "İstanbul", ilce: "Kadıköy" },
    tarih: BUGUN,
  });

  it("makam, atıflar ve eksik bilgiler doğru yazılır", () => {
    expect(metin.split("\n")[0]).toBe("İSTANBUL / KADIKÖY TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA");
    expect(metin).toContain("HUKUKİ NEDENLER: 6502 sayılı Tüketicinin Korunması Hakkında Kanun m. 8, m. 10, m. 11, m. 68");
    expect(metin).toContain("[TC kimlik numaranız]");
    expect(metin).toContain("UYUŞMAZLIK DEĞERİ: 12.499 TL");
    expect(metin).toContain("EKLER:\n1- Fatura veya satış fişi");
    expect(yasakliBul(metin)).toEqual([]);
  });

  it("PDF/Word biçimlendirmesi: makam ortalı, imza bloğu sağda, ekler solda", () => {
    const satirlar = bicimle(metin);
    expect(satirlar[0].hizalama).toBe("orta");
    const tarihIndex = satirlar.findIndex((s) => s.parcalar[0]?.metin.startsWith("Tarih:"));
    const ekIndex = satirlar.findIndex((s) => s.parcalar[0]?.metin === "EKLER:");
    expect(tarihIndex).toBeGreaterThan(0);
    for (let i = tarihIndex; i < ekIndex; i++) expect(satirlar[i].hizalama).toBe("sag");
    for (let i = ekIndex; i < satirlar.length; i++) expect(satirlar[i].hizalama).toBe("sol");
    const konu = satirlar.find((s) => s.parcalar[0]?.metin === "KONU:");
    expect(konu?.parcalar[0].kalin).toBe(true);
    expect(konu?.parcalar[1].kalin).toBe(false);
  });
});
