// Ödeme altyapısı. Site şu an "deneme" modundadır: ödeme ekranı çalışır,
// ama hiçbir karttan para çekilmez.
//
// Gerçek ödemeye geçmek için (bkz. docs/ODEME.md):
//   1. Bu klasöre sağlayıcı dosyası ekleyin (ör. iyzico.ts) ve OdemeSaglayicisi'ni uygulayın.
//   2. Sağlayıcının geri dönüş adresi için bir API ucu ekleyin.
//   3. Vercel'de ODEME_MODU=iyzico yapın ve sağlayıcının anahtarlarını girin.

import { ayar } from "@/lib/ayar";
import type { DilekceKaydi } from "@/lib/depo";

export type OdemeBaslatma = {
  /** Kullanıcının yönlendirileceği ödeme sayfası */
  yonlendirme: string;
};

export type OdemeSaglayicisi = {
  ad: string;
  /** Gerçek para çekilir mi */
  gercek: boolean;
  baslat: (kayit: DilekceKaydi, siteAdresi: string) => Promise<OdemeBaslatma>;
};

const deneme: OdemeSaglayicisi = {
  ad: "deneme",
  gercek: false,
  async baslat(kayit) {
    return { yonlendirme: `/odeme/${kayit.id}` };
  },
};

const SAGLAYICILAR: Record<string, OdemeSaglayicisi> = { deneme };

export function odemeModu(): string {
  return ayar("ODEME_MODU") || "deneme";
}

export function odemeSaglayicisi(): OdemeSaglayicisi {
  const s = SAGLAYICILAR[odemeModu()];
  if (!s) throw new Error(`Tanımsız ödeme modu: ${odemeModu()}`);
  return s;
}

export function denemeModundaMi(): boolean {
  return !odemeSaglayicisi().gercek;
}
