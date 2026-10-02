import type { MetadataRoute } from "next";
import { aramaMotorlarinaAcik, siteAdresi } from "@/config/site";

export const dynamic = "force-dynamic";

// Deneme döneminde de taramaya izin verilir; böylece arama motorları
// sayfalardaki "noindex" işaretini görüp siteyi dizine eklemez.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: aramaMotorlarinaAcik() ? `${siteAdresi()}/sitemap.xml` : undefined,
  };
}
