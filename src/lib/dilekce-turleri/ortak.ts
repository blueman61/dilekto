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

export function bugunYaz(tarih: Date): string {
  return tarih.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

export function gunFarki(isoTarih: string, bugun: Date): number {
  const t = new Date(`${isoTarih}T00:00:00`);
  const b = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  return Math.round((b.getTime() - t.getTime()) / 86_400_000);
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
        const m = d.trim();
        if (s.enKisa && m.length < s.enKisa)
          throw new Error(`"${s.soru}" için en az ${s.enKisa} karakter yazın.`);
        if (m.length > s.enUzun)
          throw new Error(`"${s.soru}" en fazla ${s.enUzun} karakter olabilir.`);
        temiz[s.id] = m;
        break;
      }
      case "tarih":
        if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d)))
          throw new Error(`"${s.soru}" için geçerli bir tarih seçin.`);
        temiz[s.id] = d;
        break;
      case "tutar": {
        const sayi = Number(String(d).replace(",", "."));
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
