import type { Metadata, Viewport } from "next";
import { aramaMotorlarinaAcik, site, siteAdresi } from "@/config/site";
import { SiteAlt } from "@/components/SiteAlt";
import { Olcum } from "@/components/Olcum";
import { SiteBaslik } from "@/components/SiteBaslik";
import { TEMA_BASLANGIC_BETIGI } from "@/lib/tema";
import { denemeModundaMi } from "@/lib/odeme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteAdresi()),
  title: {
    default: "Dilekto | Tüketici Hakem Heyeti dilekçesi hazırlayın",
    template: "%s | Dilekto",
  },
  description:
    "Bozuk ürün, kötü hizmet, gelmeyen sipariş veya kabul edilmeyen iade için Tüketici Hakem Heyeti dilekçenizi birkaç dakikada kendiniz hazırlayın. Ücretsiz uygunluk testi.",
  applicationName: site.ad,
  robots: aramaMotorlarinaAcik() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: site.ad, locale: "tr_TR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f56d6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Kaydedilmiş tema seçimini sayfa boyanmadan uygular (yanıp sönmeyi önler) */}
        <script dangerouslySetInnerHTML={{ __html: TEMA_BASLANGIC_BETIGI }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteBaslik denemeModu={denemeModundaMi()} />
        <main className="flex-1">{children}</main>
        <SiteAlt />
        <Olcum />
      </body>
    </html>
  );
}
