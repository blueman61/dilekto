import type { NextConfig } from "next";

// Deneme döneminde site arama motorlarına kapalıdır.
// Açmak için Vercel'de SITE_ARAMA_MOTORLARINA_ACIK=evet yapılır.
const aramaMotorlarinaAcik = process.env.SITE_ARAMA_MOTORLARINA_ACIK?.trim() === "evet";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const ortak = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const gizle = aramaMotorlarinaAcik ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:yol*", headers: [...ortak, ...gizle] },
      // Kişiye özel dilekçe ve ödeme sayfaları hiçbir zaman dizine eklenmez.
      { source: "/dilekce/:id", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/odeme/:id", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
