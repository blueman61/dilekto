// Dilekçe metni: her konu, talep, belge ve kişisel bilgi kombinasyonunda biçim ve kural denetimi.
import { describe, expect, it } from "vitest";
import { bicimle } from "@/lib/belge/bicim";
import { zorunluEksikler } from "@/lib/dilekce-turleri/hakem-heyeti/kurallar";
import { eDevletAciklamasi } from "@/lib/dilekce-turleri/hakem-heyeti/basvuru";
import { adSoyadBicimi, ILLER, tekSatir } from "@/lib/dilekce-turleri/ortak";
import { yasakliBul } from "@/lib/yasakli-ifadeler";
import {
  BUGUN,
  hikayeCevabi,
  hikayeSecenekleri,
  IYI_CIKTI,
  KISISEL_TAM,
  KONULAR,
  sunulanKonular,
  testCevabi,
  tur,
} from "./yardimci";

const SIRA = [
  "BAŞVURU SAHİBİ (TÜKETİCİ)",
  "KARŞI TARAF",
  "UYUŞMAZLIK KONUSU",
  "SATIN ALMA TARİHİ:",
  "UYUŞMAZLIK DEĞERİ:",
  "KONU:",
  "AÇIKLAMALAR:",
  "HUKUKİ NEDENLER:",
  "DELİLLER:",
  "SONUÇ VE İSTEM:",
  "Tarih:",
  "İmza",
  "EKLER:",
];

function uret(test = testCevabi(), hikaye = hikayeCevabi(test), kisisel = KISISEL_TAM, cikti = IYI_CIKTI) {
  return tur.metinOlustur({ test, hikaye, cikti, kisisel, tarih: BUGUN });
}

describe("dilekçe metni: her konu x talep x alış şekli", () => {
  let adet = 0;
  for (const alis of ["internet", "magaza"] as const) {
    for (const konu of sunulanKonular(alis)) {
      const test = testCevabi({ alisSekli: alis, konu });
      for (const talep of hikayeSecenekleri(test, "talep")) {
        it(`${alis}/${konu}/${talep}`, () => {
          const hikaye = hikayeCevabi(test, { talep });
          const metin = uret(test, hikaye);
          adet++;

          // 1) bölümler doğru sırada
          let son = -1;
          for (const bolum of SIRA) {
            const i = metin.indexOf(bolum, son + 1);
            expect(i, `"${bolum}" bölümü sırada bulunamadı`).toBeGreaterThan(son);
            son = i;
          }
          // 2) bozuk değer sızmamış
          expect(metin).not.toMatch(/undefined|null|NaN|\[object/);
          // 3) yasaklı ifade yok, makam adı ilk satırda
          expect(yasakliBul(metin)).toEqual([]);
          expect(metin.split("\n")[0]).toBe("İSTANBUL / KADIKÖY TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA");
          // 4) hizmet / mal ayrımı
          if (konu === "ayipli_hizmet") {
            expect(metin).toContain("KARŞI TARAF (HİZMET SAĞLAYICI)");
            expect(metin).toContain("UYUŞMAZLIK KONUSU HİZMET:");
          } else {
            expect(metin).toContain("KARŞI TARAF (SATICI)");
            expect(metin).toContain("UYUŞMAZLIK KONUSU MAL:");
          }
          // 5) hukuki nedenlerde bu konuya ait zorunlu maddeler var
          const hukuki = metin.split("\n").find((s) => s.startsWith("HUKUKİ NEDENLER:"))!;
          expect(hukuki).toContain("6502 sayılı Tüketicinin Korunması Hakkında Kanun m.");
          expect(hukuki).toContain("m. 68");
          // 6) kendi kurallarından geçmeli: eksik madde yok
          const kontrol = tur.metniDenetle(metin);
          expect(kontrol.filter((m) => m.durum === "eksik").map((m) => `${m.id}: ${m.ayrinti}`)).toEqual([]);
          expect(zorunluEksikler(kontrol)).toEqual([]);
        });
      }
    }
  }
  it("yeterince çok kombinasyon", () => expect(adet).toBeGreaterThan(30));
});

describe("dilekçe metni: kişisel bilgi eksikleri", () => {
  const eksikVeKontrol = (kisisel: Record<string, string>) => {
    const metin = uret(testCevabi(), hikayeCevabi(testCevabi()), kisisel);
    const kontrol = tur.metniDenetle(metin);
    return { metin, kontrol, eksik: kontrol.filter((m) => m.durum === "eksik").map((m) => m.id) };
  };

  it("hiç bilgi yoksa zorunlu bilgiler eksik görünür ve köşeli parantezle işaretlenir", () => {
    const { metin, eksik } = eksikVeKontrol({});
    for (const yer of ["[İL / İLÇE]", "[Adınız Soyadınız]", "[TC kimlik numaranız]", "[Adresiniz]", "[Telefonunuz]"]) {
      expect(metin).toContain(yer);
    }
    expect(eksik).toEqual(expect.arrayContaining(["adSoyad", "tc", "adres", "imza", "bosYerler"]));
  });

  it.each([
    ["adSoyad", "adSoyad"],
    ["tcKimlik", "tc"],
    ["adres", "adres"],
  ])("tek başına %s eksikse yalnızca ilgili madde eksik olur", (alan, madde) => {
    const kisisel: Record<string, string> = { ...KISISEL_TAM };
    delete kisisel[alan];
    const { eksik } = eksikVeKontrol(kisisel);
    expect(eksik).toContain(madde);
    expect(eksik).toContain("bosYerler");
  });

  it("telefon eksikse uyarı olur, eksik sayılmaz (yönetmelikte 'varsa')", () => {
    const kisisel: Record<string, string> = { ...KISISEL_TAM };
    delete kisisel.telefon;
    const { kontrol } = eksikVeKontrol(kisisel);
    expect(kontrol.find((m) => m.id === "iletisim")?.durum).toBe("uyari");
  });

  it("geçersiz TC kimlik numarası uyarı verir", () => {
    const { kontrol } = eksikVeKontrol({ ...KISISEL_TAM, tcKimlik: "12345678901" });
    expect(kontrol.find((m) => m.id === "tc")?.durum).toBe("uyari");
  });

  it("il yazılmışsa ilçe olmadan da makam adı doğru", () => {
    const { metin, kontrol } = eksikVeKontrol({ ...KISISEL_TAM, ilce: "" });
    expect(metin.split("\n")[0]).toBe("İSTANBUL TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA");
    expect(kontrol.find((m) => m.id === "makam")?.durum).toBe("tamam");
  });

  it("il yoksa makam adı uyarı verir", () => {
    const { kontrol } = eksikVeKontrol({ ...KISISEL_TAM, il: "", ilce: "" });
    expect(kontrol.find((m) => m.id === "makam")?.durum).toBe("uyari");
  });

  it("E-posta yalnızca yazıldıysa eklenir", () => {
    expect(uret()).not.toContain("E-posta:");
    expect(uret(testCevabi(), hikayeCevabi(testCevabi()), { ...KISISEL_TAM, eposta: "ayse@example.com" })).toContain(
      "E-posta: ayse@example.com",
    );
  });
});

describe("dilekçe metni: Türkçe harfler ve ad soyad biçimi", () => {
  it.each([
    ["ayşe yılmaz", "Ayşe YILMAZ"],
    ["AYŞE YILMAZ", "Ayşe YILMAZ"],
    ["  ayşe   nur  yılmaz ", "Ayşe Nur YILMAZ"],
    ["İbrahim ışık", "İbrahim IŞIK"],
    ["ıspanak iğdir", "Ispanak İĞDİR"],
    ["şükrü öztürk", "Şükrü ÖZTÜRK"],
    ["Mehmet", "Mehmet"],
    ["mehmet", "Mehmet"],
    ["", ""],
  ])("%j → %j", (girdi, beklenen) => {
    expect(adSoyadBicimi(girdi)).toBe(beklenen);
  });

  it("tüm illerin makam adı Türkçe büyük harfle yazılır", () => {
    for (const il of ILLER) {
      const ilk = uret(testCevabi(), hikayeCevabi(testCevabi()), { ...KISISEL_TAM, il, ilce: "" }).split("\n")[0];
      expect(ilk).toBe(`${il.toLocaleUpperCase("tr-TR")} TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA`);
      expect(ilk).not.toMatch(/[a-zçğıöşü]/); // hiç küçük harf kalmamalı
    }
    expect(uret(testCevabi(), hikayeCevabi(testCevabi()), { ...KISISEL_TAM, il: "Iğdır", ilce: "" }).split("\n")[0]).toMatch(
      /^IĞDIR /,
    );
    expect(uret(testCevabi(), hikayeCevabi(testCevabi()), { ...KISISEL_TAM, il: "İzmir", ilce: "" }).split("\n")[0]).toMatch(
      /^İZMİR /,
    );
  });

  it("dilekçe tarihi Türkiye saatine göre yazılır (gece yarısından sonra bir sonraki gün)", () => {
    const gece = tur.metinOlustur({
      test: testCevabi(),
      hikaye: hikayeCevabi(testCevabi()),
      cikti: IYI_CIKTI,
      kisisel: KISISEL_TAM,
      tarih: new Date("2026-10-06T21:30:00Z"),
    });
    expect(gece).toContain("Tarih: 07.10.2026");
  });

  it("imza bloğu: Tarih, İmza, Ad SOYAD sırasıyla", () => {
    const satirlar = uret().split("\n");
    const i = satirlar.findIndex((s) => s.startsWith("Tarih:"));
    expect(satirlar.slice(i, i + 3)).toEqual(["Tarih: 06.10.2026", "İmza", "Ayşe YILMAZ"]);
  });
});

describe("dilekçe metni: satır sonu ve uzun/özel içerik", () => {
  it("kişisel alanlardaki satır sonları şablonu bozmaz", () => {
    const metin = uret(testCevabi(), hikayeCevabi(testCevabi()), {
      ...KISISEL_TAM,
      adres: "Caferağa Mah.\nSONUÇ VE İSTEM: sahte\n\nKadıköy",
      adSoyad: "Ayşe\nYılmaz",
    });
    expect(metin.match(/^SONUÇ VE İSTEM:/gm)).toHaveLength(1);
    expect(metin).toContain("Adres: Caferağa Mah. SONUÇ VE İSTEM: sahte Kadıköy");
    expect(metin).toContain("Adı Soyadı: Ayşe YILMAZ");
  });

  it("yapay zekâ paragrafındaki satır sonları tek paragraf olarak kalır", () => {
    const cikti = { ...IYI_CIKTI, olaylar: ["Birinci satır\nikinci satır", "Tek"] };
    const metin = uret(testCevabi(), hikayeCevabi(testCevabi()), KISISEL_TAM, cikti);
    expect(metin).toContain("1. Birinci satır ikinci satır");
  });

  it("1 ile 8 arası paragraf numaralanır", () => {
    for (let n = 1; n <= 8; n++) {
      const cikti = { ...IYI_CIKTI, olaylar: Array.from({ length: n }, (_, i) => `Paragraf ${i + 1}.`) };
      const metin = uret(testCevabi(), hikayeCevabi(testCevabi()), KISISEL_TAM, cikti);
      for (let i = 1; i <= n; i++) expect(metin).toContain(`${i}. Paragraf ${i}.`);
      expect(metin).not.toContain(`${n + 1}. Paragraf`);
    }
  });

  it("belge seçilmediyse EKLER altında doldurulacak yer kalır ve denetim bunu gösterir", () => {
    const test = testCevabi();
    const metin = uret(test, hikayeCevabi(test, { belgeler: [] }));
    expect(metin).toContain("1- [Eklediğiniz belgeleri yazın]");
    expect(tur.metniDenetle(metin).find((m) => m.id === "bosYerler")?.durum).toBe("eksik");
  });

  it("tüm belgeler seçilince ekler numaralı sıralanır, 'Bu dilekçe' eklenmez", () => {
    const test = testCevabi();
    const hepsi = hikayeSecenekleri(test, "belgeler");
    const metin = uret(test, hikayeCevabi(test, { belgeler: hepsi }));
    const ek = metin.split("EKLER:\n")[1].split("\n");
    expect(ek).toHaveLength(hepsi.length);
    ek.forEach((s, i) => expect(s).toMatch(new RegExp(`^${i + 1}- \\S`)));
    expect(metin).not.toContain("Bu dilekçe (PDF");
  });
});

describe("biçimleme (PDF ve Word için)", () => {
  it("tüm konularda imza bloğu sağda, ekler solda, başlıklar kalın", () => {
    for (const konu of KONULAR) {
      const test = testCevabi({ konu, alisSekli: "internet" });
      const satirlar = bicimle(uret(test));
      expect(satirlar[0].hizalama).toBe("orta");
      expect(satirlar[0].parcalar[0].kalin).toBe(true);
      const tarih = satirlar.findIndex((s) => s.parcalar[0]?.metin.startsWith("Tarih:"));
      const ek = satirlar.findIndex((s) => s.parcalar[0]?.metin === "EKLER:");
      for (let i = tarih; i < ek; i++) expect(satirlar[i].hizalama).toBe("sag");
      for (let i = ek; i < satirlar.length; i++) expect(satirlar[i].hizalama).toBe("sol");
      expect(satirlar[ek].parcalar[0].kalin).toBe(true);
      const aciklama = satirlar.find((s) => s.parcalar[0]?.metin === "AÇIKLAMALAR:");
      expect(aciklama?.baslik).toBe(true);
    }
  });

  it("kullanıcı EKLER başlığını silerse imza bloğu sona kadar sağda kalır, hata vermez", () => {
    const metin = uret().split("EKLER:")[0];
    const satirlar = bicimle(metin);
    expect(satirlar[satirlar.length - 1].hizalama).toBe("sag");
  });

  it("kullanıcı Tarih satırını silerse hiçbir satır sağa yaslanmaz", () => {
    const metin = uret().replace(/^Tarih:.*$/m, "");
    expect(bicimle(metin).some((s) => s.hizalama === "sag")).toBe(false);
  });

  it("boş metin hata vermez", () => {
    expect(bicimle("")).toHaveLength(1);
    expect(tur.metniDenetle("").some((m) => m.durum === "eksik")).toBe(true);
  });
});

describe("kural denetimi: kullanıcı metni düzenleyince", () => {
  const temel = uret();
  const maddeDurumu = (metin: string, id: string) => tur.metniDenetle(metin).find((m) => m.id === id)?.durum;

  it("temel metin eksiksiz", () => {
    expect(tur.metniDenetle(temel).filter((m) => m.durum !== "tamam" && m.zorunlu)).toEqual([]);
  });

  it("imza satırı silinirse eksik", () => {
    expect(maddeDurumu(temel.replace(/^İmza$/m, ""), "imza")).toBe("eksik");
  });
  it("imza altındaki ad farklıysa uyarı", () => {
    expect(maddeDurumu(temel.replace(/^Ayşe YILMAZ$/m, "Mehmet DEMİR"), "imza")).toBe("uyari");
  });
  it("tarih bozulursa eksik", () => {
    expect(maddeDurumu(temel.replace(/^Tarih:.*$/m, "Tarih: yarın"), "tarih")).toBe("eksik");
    expect(maddeDurumu(temel.replace(/^Tarih:.*$/m, "Tarih: 31.02.2026"), "tarih")).toBe("eksik");
    expect(maddeDurumu(temel.replace(/^Tarih:.*$/m, "Tarih: 06/10/2026"), "tarih")).toBe("tamam");
  });
  it("konu silinirse eksik", () => {
    expect(maddeDurumu(temel.replace(/^KONU:.*$/m, "KONU:"), "konu")).toBe("eksik");
  });
  it("açıklamalar silinirse eksik", () => {
    expect(maddeDurumu(temel.replace(/^\d+\. .*$/gm, ""), "aciklama")).toBe("eksik");
  });
  it("uyuşmazlık değerinden TL silinirse eksik", () => {
    expect(maddeDurumu(temel.replace("5.000 TL", "5000"), "deger")).toBe("eksik");
  });
  it("makam başlığı bozulursa eksik", () => {
    expect(maddeDurumu(temel.replace(/^.*BAŞKANLIĞINA$/m, "Sayın ilgili"), "makam")).toBe("eksik");
  });
  it("çok uzun metin uzunluk uyarısı verir", () => {
    const uzun = temel + "\n" + "Bu satır çok uzun bir açıklama satırıdır ve tekrar eder. ".repeat(300);
    expect(maddeDurumu(uzun, "uzunluk")).toBe("uyari");
    expect(maddeDurumu(temel, "uzunluk")).toBe("tamam");
  });
  it("büyük/küçük harf ve fazla boşluğa dayanıklı", () => {
    expect(maddeDurumu(temel.replace("T.C. Kimlik No:", "  t.c. kimlik no :"), "tc")).not.toBe(undefined);
  });
});

describe("e-Devlet açıklama metni", () => {
  it("yalnızca AÇIKLAMALAR ve SONUÇ VE İSTEM bölümlerini alır", () => {
    const metin = eDevletAciklamasi(uret());
    expect(metin).toContain("1. Karşı taraftan cep telefonu satın aldım.");
    expect(metin).toContain("SONUÇ VE İSTEM:");
    expect(metin).not.toContain("BAŞVURU SAHİBİ");
    expect(metin).not.toContain("T.C. Kimlik");
    expect(metin).not.toContain("Tarih:");
    expect(metin).not.toContain("EKLER");
    expect(metin).not.toContain("HUKUKİ NEDENLER");
  });
  it("boş metinde boş döner", () => {
    expect(eDevletAciklamasi("")).toBe("");
  });
});

describe("tekSatir", () => {
  it("satır sonu, sekme ve çoklu boşluğu tek boşluğa indirir", () => {
    expect(tekSatir("a\n\n b\t\tc  d")).toBe("a b c d");
    expect(tekSatir(undefined)).toBe("");
  });
});
