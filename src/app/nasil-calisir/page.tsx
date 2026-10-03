import type { Metadata } from "next";
import Link from "next/link";
import { site, tlYaz } from "@/config/site";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { AdimListesi, BaslaKutusu } from "@/components/Tanitim";
import { HAKEM_HEYETI_SINIRI } from "@/lib/mevzuat";

export const metadata: Metadata = {
  title: "Nasıl çalışır?",
  description:
    "Tüketici Hakem Heyeti dilekçenizi 4 adımda hazırlayın: ücretsiz test, olayın anlatımı, önizleme ve indirme. e-Devlet'ten başvuru adımları dahil.",
  alternates: { canonical: "/nasil-calisir" },
};

const AYRINTILAR = [
  {
    baslik: "1. Ücretsiz test: Başvurabilir miyim?",
    metin: [
      `Önce 6 kısa soru sorarız: Ürünü ya da hizmeti kişisel kullanım için mi aldınız, kimden aldınız, sorun ne, ne kadar ödediniz, ne zaman aldınız? Hakem heyetine ${HAKEM_HEYETI_SINIRI.yil} yılında değeri ${tlYaz(HAKEM_HEYETI_SINIRI.tutar)}'nin altındaki sorunlar için başvurulabilir.`,
      "Cevaplarınıza göre başvurunun uygun olup olmadığını ve dikkat etmeniz gereken süreleri hemen görürsünüz.",
    ],
  },
  {
    baslik: "2. Olayı kendi cümlelerinizle anlatın",
    metin: [
      "Ne satın aldığınızı, satıcıyı, ne olduğunu ve ne istediğinizi yazarsınız. İsterseniz faturanızın fotoğrafını yükleyin; ürün ve satıcı bilgilerini sizin için dolduralım.",
      "Faturanız kaydedilmez; yalnızca bilgileri okumak için kullanılır ve hemen silinir.",
    ],
  },
  {
    baslik: "3. Dilekçenizin önizlemesini görün",
    metin: [
      "Anlattıklarınızdan size özel bir dilekçe hazırlanır. İlk bölümünü ücretsiz okursunuz. Dilekçede yalnızca resmî metniyle kontrol edilmiş kanun maddelerine yer verilir.",
    ],
  },
  {
    baslik: "4. İndirin ve e-Devlet'ten başvurun",
    metin: [
      "Ödemeden sonra dilekçenin tamamı açılır. Adınızı, TC kimlik numaranızı ve adresinizi yazarsınız; bu bilgiler sunucumuza gönderilmez, dilekçeye yalnızca sizin cihazınızda eklenir.",
      `Dilekçeyi dilediğiniz gibi düzeltip PDF ya da Word olarak indirirsiniz. Yanında eklemeniz gereken belgelerin listesi ve e-Devlet'ten başvuru adımları da vardır. Dilekçenize ${site.dilekceSaklamaGun} gün boyunca aynı adresten ulaşabilirsiniz.`,
    ],
  },
];

export default function NasilCalisirSayfasi() {
  return (
    <div className="kapsayici py-10">
      <h1 className="text-3xl font-bold">Nasıl çalışır?</h1>
      <p className="mt-3 max-w-2xl text-lg text-gri">
        Dilekto ile Tüketici Hakem Heyeti dilekçenizi dört kısa adımda, kendiniz hazırlarsınız.
      </p>
      <div className="mt-8">
        <AdimListesi />
      </div>
      <div className="mt-10 max-w-3xl space-y-8">
        {AYRINTILAR.map((a) => (
          <section key={a.baslik}>
            <h2 className="text-xl font-bold">{a.baslik}</h2>
            {a.metin.map((m) => (
              <p key={m} className="mt-2 text-gri">
                {m}
              </p>
            ))}
          </section>
        ))}
        <p className="text-gri">
          Ücret bilgisi için <Link href="/fiyat" className="text-marka-700 underline">fiyat</Link> sayfasına, merak
          ettikleriniz için <Link href="/sss" className="text-marka-700 underline">sık sorulan sorulara</Link> bakın.
        </p>
      </div>
      <BaslaKutusu />
      <SorumlulukNotu className="mt-8 max-w-3xl" />
    </div>
  );
}
