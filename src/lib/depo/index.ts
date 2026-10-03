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

/** Supabase hatasını, nedeni anlaşılır bir hata koduna çevirir. */
export function vtHatasi(error: SupabaseHatasi, islem: string): DilektoHatasi {
  const m = `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`;
  if (error.code === "42501" || /row-level security|permission denied|invalid api key|jwt|unauthorized/i.test(m)) {
    return new DilektoHatasi("VT-ANAHTAR", `${islem}: Supabase anahtarı yetkisiz (secret key girilmeli).`, error);
  }
  if (error.code === "PGRST205" || error.code === "42P01" || /does not exist|could not find the table/i.test(m)) {
    return new DilektoHatasi("VT-TABLO", `${islem}: dilekceler tablosu bulunamadı (kurulum.sql çalıştırılmalı).`, error);
  }
  if (/fetch failed|enotfound|econnrefused|network/i.test(m)) {
    return new DilektoHatasi("VT-BAGLANTI", `${islem}: Supabase'e ulaşılamadı (SUPABASE_URL kontrol edilmeli).`, error);
  }
  return new DilektoHatasi("VT-HATA", `${islem}: ${error.message}`, error);
}

class SupabaseDepo implements Depo {
  constructor(private db: SupabaseClient) {}

  async olustur(k: YeniKayit) {
    const { data, error } = await this.db
      .from("dilekceler")
      .insert({ ...k, durum: "onizleme", silinecek: silinmeTarihi() })
      .select()
      .single<Satir>();
    if (error) throw vtHatasi(error, "Kayıt oluşturma");
    return data;
  }

  async getir(id: string) {
    if (!UUID.test(id)) return null;
    const { data, error } = await this.db
      .from("dilekceler")
      .select()
      .eq("id", id)
      .gt("silinecek", new Date().toISOString())
      .maybeSingle<Satir>();
    if (error) throw vtHatasi(error, "Kayıt okuma");
    return data;
  }

  async odemeIsle(id: string, odeme: NonNullable<DilekceKaydi["odeme"]>) {
    const { error } = await this.db
      .from("dilekceler")
      .update({ durum: "odendi", odeme })
      .eq("id", id)
      .eq("durum", "onizleme");
    if (error) throw vtHatasi(error, "Ödeme kaydı");
  }

  async sil(id: string) {
    const { error } = await this.db.from("dilekceler").delete().eq("id", id);
    if (error) throw vtHatasi(error, "Silme");
  }

  async bugunOlusturulan() {
    const { count, error } = await this.db
      .from("dilekceler")
      .select("id", { count: "exact", head: true })
      .gte("olusturma", gunBasi());
    if (error) throw vtHatasi(error, "Günlük sayım");
    return count ?? 0;
  }

  async suresiDolanlariSil() {
    const { data, error } = await this.db
      .from("dilekceler")
      .delete()
      .lte("silinecek", new Date().toISOString())
      .select("id");
    if (error) throw vtHatasi(error, "Silme");
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

const kuresel = globalThis as unknown as { __dilektoDepo?: Depo };

export function depo(): Depo {
  if (kuresel.__dilektoDepo) return kuresel.__dilektoDepo;
  const url = ayar("SUPABASE_URL");
  const anahtar = ayar("SUPABASE_SECRET_KEY");
  if (url && anahtar) {
    kuresel.__dilektoDepo = new SupabaseDepo(
      createClient(url, anahtar, { auth: { persistSession: false, autoRefreshToken: false } }),
    );
  } else if (process.env.NODE_ENV !== "production") {
    kuresel.__dilektoDepo = new BellekDepo();
  } else {
    throw new DilektoHatasi("VT-AYAR", "SUPABASE_URL ve SUPABASE_SECRET_KEY ayarlanmamış (bkz. docs/KURULUM.md).");
  }
  return kuresel.__dilektoDepo;
}
