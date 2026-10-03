import type { Metadata } from "next";
import { site } from "@/config/site";
import { SorumlulukNotu } from "@/components/Sorumluluk";

export const metadata: Metadata = { title: "İletişim" };

export default async function IletisimSayfasi(props: PageProps<"/iletisim">) {
  const { odeme } = await props.searchParams;
  return (
    <div className="kapsayici max-w-2xl py-10">
      <h1 className="text-3xl font-bold">İletişim</h1>
      {odeme === "sorun" && (
        <p className="mt-6 rounded-2xl border-2 border-uyari bg-uyari-zemin p-5 text-uyari" role="alert">
          Ödemeniz alındı ancak dilekçenize ulaşılamadı. Lütfen aşağıdaki adrese, ödeme e-postanızdaki sipariş
          bilgisiyle birlikte yazın; en kısa sürede dilekçenizi açalım ya da ücretinizi iade edelim.
        </p>
      )}
      <div className="kart mt-6">
        <p className="text-gri">Sitenin kullanımı, ödeme veya iade ile ilgili sorularınız için bize yazın:</p>
        <a href={`mailto:${site.eposta}`} className="mt-3 inline-block text-xl font-semibold text-marka-700 underline">
          {site.eposta}
        </a>
        <p className="mt-4 text-sm text-gri">
          E-postanıza dilekçe sayfanızın adresini eklerseniz size daha hızlı yardımcı olabiliriz. Genellikle 1-2 iş
          günü içinde yanıt veririz.
        </p>
      </div>
      <SorumlulukNotu className="mt-6" />
    </div>
  );
}
