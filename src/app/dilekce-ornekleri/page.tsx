import type { Metadata } from "next";
import Link from "next/link";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { BaslaKutusu } from "@/components/Tanitim";
import { REHBERLER } from "@/content/rehberler";

export const metadata: Metadata = {
  title: "Dilekçe örnekleri",
  description:
    "Bozuk telefon, ayakkabı, kargo hasarı, beyaz eşya, gelmeyen sipariş ve daha fazlası için tüketici hakem heyeti dilekçe örnekleri ve başvuru rehberleri.",
  alternates: { canonical: "/dilekce-ornekleri" },
};

export default function DilekceOrnekleriSayfasi() {
  return (
    <div className="kapsayici py-10">
      <h1 className="text-3xl font-bold">Dilekçe örnekleri</h1>
      <p className="mt-3 max-w-2xl text-lg text-gri">
        Sorununuza en yakın rehberi seçin: haklarınızı, gereken belgeleri ve örnek dilekçeyi bulun.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REHBERLER.map((r) => (
          <Link key={r.slug} href={`/${r.slug}`} className="kart transition hover:border-marka-600">
            <h2 className="font-semibold text-marka-700">{r.kisaAd}</h2>
            <p className="mt-2 text-sm text-gri">{r.aciklama}</p>
          </Link>
        ))}
      </div>
      <BaslaKutusu />
      <SorumlulukNotu className="mt-8" />
    </div>
  );
}
