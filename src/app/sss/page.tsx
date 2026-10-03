import type { Metadata } from "next";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { BaslaKutusu, SssListesi } from "@/components/Tanitim";
import { SSS } from "@/content/genel";

export const metadata: Metadata = {
  title: "Sık sorulan sorular",
  description:
    "Tüketici hakem heyeti nedir, başvuru ücretli mi, faturam yoksa ne yaparım? Dilekto ve hakem heyeti başvurusu hakkında merak edilenler.",
  alternates: { canonical: "/sss" },
};

// Arama motorları için soru-cevap verisi
const yapilandirilmisVeri = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SSS.map((x) => ({
    "@type": "Question",
    name: x.s,
    acceptedAnswer: { "@type": "Answer", text: x.c },
  })),
};

export default function SssSayfasi() {
  return (
    <div className="kapsayici max-w-3xl py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(yapilandirilmisVeri).replace(/</g, "\\u003c") }}
      />
      <h1 className="text-3xl font-bold">Sık sorulan sorular</h1>
      <div className="mt-8">
        <SssListesi />
      </div>
      <BaslaKutusu />
      <SorumlulukNotu className="mt-8" />
    </div>
  );
}
