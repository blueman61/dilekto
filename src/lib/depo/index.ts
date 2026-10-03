// Dilekçe kayıtlarının saklandığı yer.
// - Supabase ayarları varsa Supabase kullanılır (canlı site).
// - Yoksa ve site yerelde çalışıyorsa, kayıtlar bellekte tutulur (geliştirme).
//
// Kişisel bilgiler (ad, TC, adres, telefon) ASLA burada saklanmaz; onlar
// yalnızca kullanıcının tarayıcısında dilekçeye eklenir.

import { ayar } from "@/lib/ayar";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { site } from "@/config/site";
import { DilektoHatasi } from "@/lib/hatalar";
import type { Cevaplar, TaslakCiktisi } from "@/lib/dilekce-turleri/tipler";

export type DilekceKaydi = {
  id: string;
  tur: string;
  durum: "onizleme" | "odendi";
  test: Cevaplar;
  hikaye: Cevaplar;
  cikti: TaslakCiktisi;
  saglayici: string;
  fiyat: number;
  odeme: { saglayici: string; referans: string; tarih: string } | null;
  olusturma: string;
  silinecek: string;
};

export type YeniKayit = Pick<DilekceKaydi, "tur" | "test" | "hikaye" | "cikti" | "saglayici" | "fiyat">;

export interface Depo {
  olustur(k: YeniKayit): Promise<DilekceKaydi>;
  getir(id: string): Promise<DilekceKaydi | null>;
  odemeIsle(id: string, odeme: NonNullable<DilekceKaydi["odeme"]>): Promise<void>;
  sil(id: string): Promise<void>;
  /** Son "gun" günde oluşturulan ve ödenen dilekçe sayıları */
  istatistik(gun: number): Promise<{ olusturulan: number; odenen: number }>;
  bugunOlusturulan(): Promise<number>;
  suresiDolanlariSil(): Promise<number>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function silinmeTarihi(): string {
  return new Date(Date.now() + site.dilekceSaklamaGun * 86_400_000).toISOString();
}

function gunBasi(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------

type Satir = {
  id: string;
  tur: string;
  durum: DilekceKaydi["durum"];
  test: Cevaplar;
  hikaye: Cevaplar;
  cikti: TaslakCiktisi;
  saglayici: string;
  fiyat: number;
  odeme: DilekceKaydi["odeme"];
  olusturma: string;
  silinecek: string;
};

type SupabaseHatasi = { message: string; code?: string; details?: string; hint?: string };

/**
 * Supabase hatasını, nedeni anlaşılır bir hata koduna çevirir.
 * Not: Supabase bazı yanıtlarda hata açıklaması göndermez; bu yüzden HTTP
 * durum kodu da (401 = anahtar, 404 = tablo) dikkate alınır.
 */
export function vtHatasi(error: SupabaseHatasi, islem: string, durum?: number): DilektoHatasi {
  const m = `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`;
  const ayrinti = { ...error, httpDurumu: durum };
  if (
    durum === 401 ||
    durum === 403 ||
    error.code === "42501" ||
    /row-level security|permission denied|invalid api key|jwt|unauthorized/i.test(m)
  ) {
    return new DilektoHatasi(
      "VT-ANAHTAR",
      `${islem}: Supabase anahtarı kabul edilmedi (anahtar eksik/yanlış kopyalanmış, başka projeye ait ya da secret key değil).`,
      ayrinti,
    );
  }
  if (
    durum === 404 ||
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /does not exist|could not find the table/i.test(m)
  ) {
    return new DilektoHatasi("VT-TABLO", `${islem}: dilekceler tablosu bulunamadı (kurulum.sql çalıştırılmalı).`, ayrinti);
  }
  if (!durum || /fetch failed|enotfound|econnrefused|network/i.test(m)) {
    return new DilektoHatasi("VT-BAGLANTI", `${islem}: Supabase'e ulaşılamadı (SUPABASE_URL kontrol edilmeli).`, ayrinti);
  }
  return new DilektoHatasi("VT-HATA", `${islem}: ${error.message || `HTTP ${durum}`}`, ayrinti);
}

class SupabaseDepo implements Depo {
  constructor(private db: SupabaseClient) {}

  async olustur(k: YeniKayit) {
    const { data, error, status } = await this.db
      .from("dilekceler")
      .insert({ ...k, durum: "onizleme", silinecek: silinmeTarihi() })
      .select()
      .single<Satir>();
    if (error) throw vtHatasi(error, "Kayıt oluşturma", status);
    return data;
  }

  async getir(id: string) {
    if (!UUID.test(id)) return null;
    const { data, error, status } = await this.db
      .from("dilekceler")
      .select()
      .eq("id", id)
      .gt("silinecek", new Date().toISOString())
      .maybeSingle<Satir>();
    if (error) throw vtHatasi(error, "Kayıt okuma", status);
    return data;
  }

  async odemeIsle(id: string, odeme: NonNullable<DilekceKaydi["odeme"]>) {
    const { error, status } = await this.db
      .from("dilekceler")
      .update({ durum: "odendi", odeme })
      .eq("id", id)
      .eq("durum", "onizleme");
    if (error) throw vtHatasi(error, "Ödeme kaydı", status);
  }

  async sil(id: string) {
    const { error, status } = await this.db.from("dilekceler").delete().eq("id", id);
    if (error) throw vtHatasi(error, "Silme", status);
  }

  async istatistik(gun: number) {
    const baslangic = new Date(Date.now() - gun * 86_400_000).toISOString();
    const say = async (yalnizOdenen: boolean) => {
      let sorgu = this.db
        .from("dilekceler")
        .select("id", { count: "exact" })
        .gte("olusturma", baslangic)
        .neq("tur", "durum-testi");
      if (yalnizOdenen) sorgu = sorgu.eq("durum", "odendi");
      const { count, error, status } = await sorgu.limit(1);
      if (error) throw vtHatasi(error, "İstatistik", status);
      return count ?? 0;
    };
    return { olusturulan: await say(false), odenen: await say(true) };
  }

  async bugunOlusturulan() {
    const { count, error, status } = await this.db
      .from("dilekceler")
      // "head" sorgusu hata açıklaması döndürmediği için küçük bir GET sorgusu
      .select("id", { count: "exact" })
      .gte("olusturma", gunBasi())
      .limit(1);
    if (error) throw vtHatasi(error, "Günlük sayım", status);
    return count ?? 0;
  }

  async suresiDolanlariSil() {
    const { data, error, status } = await this.db
      .from("dilekceler")
      .delete()
      .lte("silinecek", new Date().toISOString())
      .select("id");
    if (error) throw vtHatasi(error, "Silme", status);
    return data?.length ?? 0;
  }
}

// ---------------------------------------------------------------------------

class BellekDepo implements Depo {
  private kayitlar = new Map<string, DilekceKaydi>();

  async olustur(k: YeniKayit) {
    const kayit: DilekceKaydi = {
      ...k,
      id: crypto.randomUUID(),
      durum: "onizleme",
      odeme: null,
      olusturma: new Date().toISOString(),
      silinecek: silinmeTarihi(),
    };
    this.kayitlar.set(kayit.id, kayit);
    return kayit;
  }

  async getir(id: string) {
    const k = this.kayitlar.get(id);
    return k && k.silinecek > new Date().toISOString() ? k : null;
  }

  async odemeIsle(id: string, odeme: NonNullable<DilekceKaydi["odeme"]>) {
    const k = this.kayitlar.get(id);
    if (k && k.durum === "onizleme") this.kayitlar.set(id, { ...k, durum: "odendi", odeme });
  }

  async sil(id: string) {
    this.kayitlar.delete(id);
  }

  async istatistik(gun: number) {
    const bas = new Date(Date.now() - gun * 86_400_000).toISOString();
    const liste = [...this.kayitlar.values()].filter((k) => k.olusturma >= bas && k.tur !== "durum-testi");
    return { olusturulan: liste.length, odenen: liste.filter((k) => k.durum === "odendi").length };
  }

  async bugunOlusturulan() {
    const bas = gunBasi();
    return [...this.kayitlar.values()].filter((k) => k.olusturma >= bas).length;
  }

  async suresiDolanlariSil() {
    const simdi = new Date().toISOString();
    let n = 0;
    for (const [id, k] of this.kayitlar) {
      if (k.silinecek <= simdi) {
        this.kayitlar.delete(id);
        n++;
      }
    }
    return n;
  }
}

// ---------------------------------------------------------------------------

/** "https://xxxx.supabase.co/rest/v1/" gibi yapıştırılan adresleri köke indirger. */
export function supabaseAdresi(ham: string): string {
  try {
    const u = new URL(ham.includes("://") ? ham : `https://${ham}`);
    return u.origin;
  } catch {
    throw new DilektoHatasi("VT-BAGLANTI", "SUPABASE_URL geçerli bir adres değil (https://xxxx.supabase.co olmalı).");
  }
}

/** Yanlış türde (herkese açık) anahtar girildiyse hemen anlaşılır hata verir. */
export function sunucuAnahtari(anahtar: string): string {
  if (anahtar.startsWith("sb_publishable_")) {
    throw new DilektoHatasi(
      "VT-ANAHTAR",
      "SUPABASE_SECRET_KEY olarak 'publishable' anahtar girilmiş; 'secret' (sb_secret_ ile başlayan) anahtar gerekli.",
    );
  }
  const parcalar = anahtar.split(".");
  if (parcalar.length === 3) {
    try {
      const yuk = JSON.parse(Buffer.from(parcalar[1], "base64url").toString("utf8")) as { role?: string };
      if (yuk.role === "anon") {
        throw new DilektoHatasi(
          "VT-ANAHTAR",
          "SUPABASE_SECRET_KEY olarak 'anon' anahtar girilmiş; 'service_role' ya da 'secret' anahtar gerekli.",
        );
      }
    } catch (e) {
      if (e instanceof DilektoHatasi) throw e;
    }
  }
  return anahtar;
}

const kuresel = globalThis as unknown as { __dilektoDepo?: Depo };

export function depo(): Depo {
  if (kuresel.__dilektoDepo) return kuresel.__dilektoDepo;
  const url = ayar("SUPABASE_URL");
  const anahtar = ayar("SUPABASE_SECRET_KEY");
  if (url && anahtar) {
    kuresel.__dilektoDepo = new SupabaseDepo(
      createClient(supabaseAdresi(url), sunucuAnahtari(anahtar), {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    );
  } else if (process.env.NODE_ENV !== "production") {
    kuresel.__dilektoDepo = new BellekDepo();
  } else {
    throw new DilektoHatasi("VT-AYAR", "SUPABASE_URL ve SUPABASE_SECRET_KEY ayarlanmamış (bkz. docs/KURULUM.md).");
  }
  return kuresel.__dilektoDepo;
}
