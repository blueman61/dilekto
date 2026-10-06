// Dilekçe türlerinin ortak kullandığı yardımcılar.

import type { Cevaplar, Soru } from "./tipler";

export const ILLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara",
  "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman",
  "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne",
  "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun",
  "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
  "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
  "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya",
  "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun",
  "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

/** Plaka sırasına göre iller (posta kodunun ilk iki hanesi plaka koduyla aynıdır) */
export const PLAKA_SIRASI = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum",
  "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin",
  "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
  "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak",
  "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan",
  "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce",
];

/** Posta kodu bilinmiyorsa il merkezinin genel posta kodu (ör. İstanbul → 34000) */
export function ilPostaKodu(il: string): string {
  const sira = PLAKA_SIRASI.indexOf(il);
  return sira >= 0 ? `${String(sira + 1).padStart(2, "0")}000` : "00000";
}

/** "0 (555) 123 45 67" / "+90 555..." → "5551234567" */
export function telefonSadelestir(telefon: string): string {
  return telefon.replace(/\D/g, "").replace(/^90(?=5\d{9}$)/, "").replace(/^0(?=\d{10}$)/, "");
}

export function buyukHarf(metin: string): string {
  return metin.toLocaleUpperCase("tr-TR");
}

/** "2026-03-15" → "15.03.2026" */
export function tarihYaz(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

const TR_SAAT_DILIMI = "Europe/Istanbul";

/** Türkiye'de bugünün tarihi, "2026-10-06" biçiminde (sunucu UTC'de olsa da doğru gün) */
export function istanbulTarihi(an: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TR_SAAT_DILIMI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(an);
}

/** Dilekçedeki tarih: "06.10.2026" (Türkiye saatine göre) */
export function bugunYaz(tarih: Date): string {
  return tarihYaz(istanbulTarihi(tarih));
}

/**
 * "Ayşe nur yılmaz" → "Ayşe Nur YILMAZ": adların ilk harfi büyük, soyad tamamen
 * büyük harf (dilekçe imza düzeni). Tek sözcük yazıldıysa olduğu gibi büyük/küçük düzeltilir.
 */
export function adSoyadBicimi(girdi: string): string {
  const parcalar = girdi.trim().split(/\s+/u).filter(Boolean);
  if (parcalar.length === 0) return "";
  const baslik = (k: string) =>
    k.charAt(0).toLocaleUpperCase("tr-TR") + k.slice(1).toLocaleLowerCase("tr-TR");
  if (parcalar.length === 1) return baslik(parcalar[0]);
  const soyad = parcalar[parcalar.length - 1].toLocaleUpperCase("tr-TR");
  return [...parcalar.slice(0, -1).map(baslik), soyad].join(" ");
}

/** 12499.9 → "12.499,90 TL" */
export function tutarYaz(tutar: string | number): string {
  const sayi = typeof tutar === "number" ? tutar : Number(tutar);
  if (!Number.isFinite(sayi)) return String(tutar);
  return `${sayi.toLocaleString("tr-TR", {
    minimumFractionDigits: Number.isInteger(sayi) ? 0 : 2,
    maximumFractionDigits: 2,
  })} TL`;
}

/** İki tarih arasındaki gün sayısı (bugün Türkiye saatine göre; saat dilimi ve yaz saati etkilemez) */
export function gunFarki(isoTarih: string, bugun: Date): number {
  const [y1, m1, d1] = isoTarih.split("-").map(Number);
  const [y2, m2, d2] = istanbulTarihi(bugun).split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export function tek(c: Cevaplar, id: string): string {
  const d = c[id];
  return typeof d === "string" ? d : "";
}

export function coklu(c: Cevaplar, id: string): string[] {
  const d = c[id];
  return Array.isArray(d) ? d : [];
}

export function secenekEtiketi(sorular: Soru[], id: string, deger: string): string {
  const soru = sorular.find((s) => s.id === id);
  if (soru && (soru.tip === "secim" || soru.tip === "coklu")) {
    return soru.secenekler.find((s) => s.deger === deger)?.etiket ?? deger;
  }
  return deger;
}

/** "2026-02-30" gibi var olmayan günleri ve makul olmayan yılları (1990 öncesi, bugünden 1 yıl sonrası) reddeder */
export function gercekTarihMi(iso: string): boolean {
  const [y, m, g] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, g));
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== g) return false;
  return y >= 1990 && y <= new Date().getUTCFullYear() + 1;
}

/** Görünmez kontrol karakterlerini ve yön değiştiren (bidi) işaretlerini temizler; satır sonlarını korur. */
export function temizMetin(girdi: string, satirSonuKalsin = false): string {
  const kontrol = satirSonuKalsin ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return girdi
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(kontrol, satirSonuKalsin ? "" : " ")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Metni tek satıra indirir (şablona yerleştirilecek değerler için): satır sonları ve art arda boşluklar tek boşluk olur. */
export function tekSatir(girdi: string | undefined): string {
  return (girdi ?? "").replace(/\s+/gu, " ").trim();
}

function lunMu(numara: string): boolean {
  let toplam = 0;
  let cift = false;
  for (let i = numara.length - 1; i >= 0; i--) {
    let n = Number(numara[i]);
    if (cift) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    toplam += n;
    cift = !cift;
  }
  return toplam % 10 === 0;
}

/**
 * Serbest metinde yazılmaması gereken kimlik/finans numaralarını bulur:
 * geçerli T.C. kimlik numarası, IBAN ve kredi kartı numarası. Bunlar yapay zekâ
 * servisine gönderilmemeli; kimlik bilgileri dilekçeye tarayıcıda eklenir.
 */
export function hassasVeriBul(metin: string): ("TC kimlik numarası" | "IBAN" | "kart numarası")[] {
  const bulunan = new Set<"TC kimlik numarası" | "IBAN" | "kart numarası">();
  for (const m of metin.matchAll(/(?<!\d)[1-9]\d{10}(?!\d)/g)) if (tcGecerliMi(m[0])) bulunan.add("TC kimlik numarası");
  if (/\bTR\s?\d{2}(?:\s?\d{4}){5}\s?\d{2}\b/i.test(metin)) bulunan.add("IBAN");
  for (const m of metin.matchAll(/(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g)) {
    const sade = m[0].replace(/[ -]/g, "");
    if (sade.length >= 13 && sade.length <= 19 && lunMu(sade)) bulunan.add("kart numarası");
  }
  return [...bulunan];
}

/**
 * Cevapları soru tanımlarına göre denetler ve yalnızca tanımlı alanları
 * içeren temiz bir kopya döndürür. Hata varsa ilk hatayı fırlatır.
 */
export function cevaplariDogrula(sorular: Soru[], ham: unknown): Cevaplar {
  if (!ham || typeof ham !== "object") throw new Error("Cevaplar eksik.");
  const girdi = ham as Record<string, unknown>;
  const temiz: Cevaplar = {};

  for (const s of sorular) {
    const d = girdi[s.id];
    const bos = d === undefined || d === null || d === "" || (Array.isArray(d) && d.length === 0);
    if (bos) {
      if (s.zorunlu) throw new Error(`"${s.soru}" sorusu boş bırakılamaz.`);
      continue;
    }
    switch (s.tip) {
      case "secim":
        if (typeof d !== "string" || !s.secenekler.some((x) => x.deger === d))
          throw new Error(`"${s.soru}" için geçersiz seçim.`);
        temiz[s.id] = d;
        break;
      case "coklu":
        if (!Array.isArray(d) || !d.every((x) => s.secenekler.some((y) => y.deger === x)))
          throw new Error(`"${s.soru}" için geçersiz seçim.`);
        temiz[s.id] = [...new Set(d as string[])];
        break;
      case "metin":
      case "uzunMetin": {
        if (typeof d !== "string") throw new Error(`"${s.soru}" metin olmalı.`);
        const m = temizMetin(d, s.tip === "uzunMetin");
        if (s.enKisa && m.length < s.enKisa)
          throw new Error(`"${s.soru}" için en az ${s.enKisa} karakter yazın.`);
        if (m.length > s.enUzun)
          throw new Error(`"${s.soru}" en fazla ${s.enUzun} karakter olabilir.`);
        const hassas = hassasVeriBul(m);
        if (hassas.length)
          throw new Error(
            `"${s.soru}" alanında ${hassas.join(", ")} yazmayın. Kimlik bilgileriniz dilekçeye sonradan, yalnızca cihazınızda eklenir.`,
          );
        temiz[s.id] = s.tip === "metin" ? tekSatir(m) : m;
        break;
      }
      case "tarih":
        if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d) || !gercekTarihMi(d))
          throw new Error(`"${s.soru}" için geçerli bir tarih seçin.`);
        temiz[s.id] = d;
        break;
      case "tutar": {
        if (typeof d !== "string" && typeof d !== "number") throw new Error(`"${s.soru}" için geçerli bir tutar yazın.`);
        const ham = String(d).trim().replace(",", ".");
        const sayi = /^\d{1,10}(\.\d{1,2})?$/.test(ham) ? Number(ham) : NaN;
        if (!Number.isFinite(sayi) || sayi <= 0 || (s.enFazla && sayi > s.enFazla))
          throw new Error(`"${s.soru}" için geçerli bir tutar yazın.`);
        temiz[s.id] = String(Math.round(sayi * 100) / 100);
        break;
      }
    }
  }
  return temiz;
}

/** T.C. kimlik numarası algoritma kontrolü (yazım hatasını yakalamak için) */
export function tcGecerliMi(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const r = tc.split("").map(Number);
  const tekler = r[0] + r[2] + r[4] + r[6] + r[8];
  const ciftler = r[1] + r[3] + r[5] + r[7];
  const on = (((tekler * 7 - ciftler) % 10) + 10) % 10;
  const onbir = r.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return on === r[9] && onbir === r[10];
}
