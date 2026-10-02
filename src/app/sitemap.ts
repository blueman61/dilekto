import type { MetadataRoute } from "next";
import { siteAdresi } from "@/config/site";
import { DILEKCE_TURLERI } from "@/lib/dilekce-turleri";

export default function sitemap(): MetadataRoute.Sitemap {
  const adres = siteAdresi();
  const sayfalar = ["", "/iletisim", "/yasal/kvkk", "/yasal/kullanim-sartlari", "/yasal/mesafeli-satis", "/yasal/iade"];
  return [
    ...sayfalar.map((s) => ({ url: `${adres}${s}` })),
    ...DILEKCE_TURLERI.map((t) => ({ url: `${adres}/olustur/${t.id}` })),
  ];
}
