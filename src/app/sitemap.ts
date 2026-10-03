import type { MetadataRoute } from "next";
import { siteAdresi } from "@/config/site";
import { REHBERLER } from "@/content/rehberler";
import { DILEKCE_TURLERI } from "@/lib/dilekce-turleri";

export default function sitemap(): MetadataRoute.Sitemap {
  const adres = siteAdresi();
  const sayfalar = ["", "/dilekce-ornekleri", "/nasil-calisir", "/fiyat", "/sss", "/iletisim", "/yasal/kvkk", "/yasal/kullanim-sartlari", "/yasal/mesafeli-satis", "/yasal/iade"];
  return [
    ...sayfalar.map((s) => ({ url: `${adres}${s}` })),
    ...DILEKCE_TURLERI.map((t) => ({ url: `${adres}/olustur/${t.id}` })),
    ...REHBERLER.map((r) => ({ url: `${adres}/${r.slug}` })),
  ];
}
