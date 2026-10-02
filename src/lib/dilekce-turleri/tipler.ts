// Bir dilekçe türünün (ör. Tüketici Hakem Heyeti, trafik cezası itirazı)
// tanımı. Yeni bir tür eklemek için bu arayüzü uygulayan bir klasör açıp
// src/lib/dilekce-turleri/index.ts içindeki listeye eklemek yeterlidir.

export type Secenek = { deger: string; etiket: string; aciklama?: string };

type SoruTemel = {
  id: string;
  soru: string;
  aciklama?: string;
  zorunlu?: boolean;
};

export type Soru =
  | (SoruTemel & { tip: "secim"; secenekler: Secenek[] })
  | (SoruTemel & { tip: "coklu"; secenekler: Secenek[] })
  | (SoruTemel & { tip: "metin"; ornek?: string; enKisa?: number; enUzun: number })
  | (SoruTemel & { tip: "uzunMetin"; ornek?: string; enKisa?: number; enUzun: number })
  | (SoruTemel & { tip: "tarih" })
  | (SoruTemel & { tip: "tutar"; enFazla?: number });

export type Cevaplar = Record<string, string | string[]>;

export type UygunlukDurumu = "uygun" | "uyarili" | "uygun-degil";
export type UygunlukSonucu = {
  durum: UygunlukDurumu;
  baslik: string;
  aciklamalar: string[];
};

/** Yapay zekânın her dilekçe türü için döndürdüğü yapı */
export type TaslakCiktisi = {
  /** Tek satırlık konu, ör. "Ayıplı cep telefonunun bedelinin iadesi talebi" */
  konuOzeti: string;
  /** Olayların sırayla anlatıldığı paragraflar */
  olaylar: string[];
  /** "Sonuç ve istem" paragrafı */
  talepMetni: string;
  /** İzin verilen listeden seçilen ek mevzuat kayıtları */
  ekMevzuat: string[];
};

export type KisiselAlan = {
  id: string;
  etiket: string;
  tip: "metin" | "tc" | "telefon" | "eposta" | "il" | "uzunMetin";
  zorunlu: boolean;
  ornek?: string;
};

export type Kisisel = Record<string, string>;

export type BelgeMaddesi = {
  ad: string;
  ipucu?: string;
  /** Kullanıcı bu belgenin elinde olduğunu söyledi mi */
  elinde: boolean;
  /** Mutlaka eklenmeli mi, yoksa "bulabilirseniz" mi */
  zorunlu: boolean;
};

export type BasvuruAdimlari = {
  baslik: string;
  adimlar: string[];
  notlar: string[];
};

export type DilekceTuru = {
  /** Adreste görünen kısa ad, ör. "hakem-heyeti" */
  id: string;
  ad: string;
  kisaAd: string;
  aciklama: string;
  fiyat: number;

  /** Ücretsiz "Başvurabilir miyim?" testi */
  testBasligi: string;
  testSorulari: (cevaplar: Cevaplar) => Soru[];
  uygunluk: (test: Cevaplar, bugun?: Date) => UygunlukSonucu;

  /** Olayı anlatma soruları (test cevaplarına göre değişebilir) */
  hikayeSorulari: (test: Cevaplar) => Soru[];

  /** Yapay zekâ ayarları */
  yapayZeka: {
    sistemTalimati: string;
    kullaniciMesaji: (test: Cevaplar, hikaye: Cevaplar) => string;
    zorunluMevzuat: (test: Cevaplar, hikaye: Cevaplar) => string[];
    secilebilirMevzuat: (test: Cevaplar, hikaye: Cevaplar) => string[];
  };

  /** Ödeme sonrası, yalnızca kullanıcının cihazında doldurulan alanlar */
  kisiselAlanlar: KisiselAlan[];

  belgeListesi: (test: Cevaplar, hikaye: Cevaplar) => BelgeMaddesi[];
  basvuruAdimlari: BasvuruAdimlari;

  /** Dilekçenin düz metnini oluşturur (PDF ve Word bu metinden üretilir) */
  metinOlustur: (girdi: {
    test: Cevaplar;
    hikaye: Cevaplar;
    cikti: TaslakCiktisi;
    kisisel: Kisisel;
    tarih: Date;
  }) => string;
};
