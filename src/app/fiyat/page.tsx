import type { Metadata } from "next";
import Link from "next/link";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { FiyatKarti } from "@/components/Tanitim";
import { FIYAT } from "@/content/genel";

export const metadata: Metadata = {
  title: "Fiyat",
  description: `Tüketici Hakem Heyeti dilekçesi tek seferlik ${FIYAT.metin}. Abonelik yok. Uygunluk testi ve önizleme ücretsiz.`,
  alternates: { canonical: "/fiyat" },
};

export default function FiyatSayfasi() {
  return (
    <div className="kapsayici max-w-4xl py-10">
      <h1 className="text-3xl font-bold">Fiyat</h1>
      <p className="mt-3 text-lg text-gri">Abonelik yok. Yalnızca hazırladığınız dilekçe için bir kez ödersiniz.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <FiyatKarti />
        <div className="space-y-6">
          <div className="kart bg-zemin">
            <h2 className="font-semibold">Ücretsiz olanlar</h2>
            <ul className="mt-2 space-y-1 text-gri">
              <li>• &quot;Hakem heyetine başvurabilir miyim?&quot; testi</li>
              <li>• Dilekçenizin önizlemesi</li>
              <li>• Hakem heyetine başvuru (devlet ücret almaz)</li>
            </ul>
          </div>
          <div className="kart bg-zemin">
            <h2 className="font-semibold">Ödeme ve iade</h2>
            <p className="mt-2 text-gri">
              Kart bilgileriniz bize ulaşmaz; ödeme, lisanslı bir ödeme kuruluşu üzerinden alınır. Dilekçe ödemeden hemen
              sonra teslim edildiği için cayma hakkı yoktur; teknik bir sorun yaşarsanız ücretinizi iade ederiz.{" "}
              <Link href="/yasal/iade" className="text-marka-700 underline">
                İade koşulları
              </Link>
            </p>
          </div>
        </div>
      </div>
      <SorumlulukNotu className="mt-10" />
    </div>
  );
}
