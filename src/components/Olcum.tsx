"use client";

// Ziyaretçi istatistiği (Vercel Web Analytics). Çerez kullanmaz.
// Dilekçe ve ödeme adreslerindeki kişiye özel kimlik gönderilmeden silinir.

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

export function adresiTemizle(adres: string): string {
  const u = new URL(adres);
  u.pathname = u.pathname
    .replace(/^\/dilekce\/[^/]+/, "/dilekce/[id]")
    .replace(/^\/odeme\/[^/]+/, "/odeme/[id]");
  // Yalnızca pazarlama için anlamlı parametreler kalır
  const kalan = new URLSearchParams();
  for (const k of ["konu", "utm_source", "utm_medium", "utm_campaign"]) {
    const v = u.searchParams.get(k);
    if (v) kalan.set(k, v);
  }
  u.search = kalan.toString();
  return u.toString();
}

export function Olcum() {
  return (
    <Analytics
      beforeSend={(olay: BeforeSendEvent) => {
        // Site sahibinin durum sayfası ölçülmez
        if (new URL(olay.url).pathname.startsWith("/durum")) return null;
        return { ...olay, url: adresiTemizle(olay.url) };
      }}
    />
  );
}
