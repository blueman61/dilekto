// Şikâyet türüne özel rehber sayfaları (ör. /bozuk-telefon-iade-dilekcesi).
// İçerik: src/content/rehberler.ts

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteAdresi, tlYaz } from "@/config/site";
import { MobilCagri } from "@/components/MobilCagri";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { REHBERLER, rehberGetir, type Rehber } from "@/content/rehberler";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";
import { atifYaz, HAKEM_HEYETI_SINIRI, hukukiNedenlerYaz, mevzuatGetir } from "@/lib/mevzuat";

export const dynamicParams = false;

export function generateStaticParams() {
  return REHBERLER.map((r) => ({ rehber: r.slug }));
}

export async function generateMetadata(props: PageProps<"/[rehber]">): Promise<Metadata> {
  const r = rehberGetir((await props.params).rehber);
  if (!r) return {};
  return {
    title: { absolute: `${r.baslik} | Dilekto` },
    description: r.aciklama,
    alternates: { canonical: `/${r.slug}` },
    openGraph: { title: r.baslik, description: r.aciklama, type: "article" },
  };
}

function testBaglantisi(r: Rehber): string {
  const p = new URLSearchParams({ konu: r.konu });
  if (r.alisSekli) p.set("alis", r.alisSekli);
  return `/olustur/hakem-heyeti?${p.toString()}`;
}

const DILEKCEDE_OLMASI_GEREKENLER = [
  "Başvurduğunuz hakem heyetinin adı (il / ilçe)",
  "Adınız, TC kimlik numaranız, adresiniz ve telefonunuz",
  "Satıcının ya da hizmet verenin unvanı ve adresi",
  "Ürün ya da hizmet, satın alma tarihi ve ödediğiniz tutar",
  "Olayların tarih sırasıyla kısa anlatımı",
  "Talebiniz (iade, değişim, onarım, indirim gibi)",
  "Eklediğiniz belgelerin listesi, tarih ve imzanız",
];

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold sm:text-2xl">{baslik}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Liste({ ogeler }: { ogeler: string[] }) {
  return (
    <ul className="space-y-2">
      {ogeler.map((o) => (
        <li key={o} className="flex gap-2 text-gri">
          <span className="mt-0.5 text-marka-600" aria-hidden="true">
            •
          </span>
          <span>{o}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function RehberSayfasi(props: PageProps<"/[rehber]">) {
  const r = rehberGetir((await props.params).rehber);
  if (!r) notFound();
  const baglanti = testBaglantisi(r);
  const ilgili = r.ilgili.map(rehberGetir).filter((x): x is Rehber => Boolean(x));

  const yapilandirilmisVeri = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: r.sss.map((x) => ({
        "@type": "Question",
        name: x.s,
        acceptedAnswer: { "@type": "Answer", text: x.c },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana sayfa", item: `${siteAdresi()}/` },
        { "@type": "ListItem", position: 2, name: "Dilekçe örnekleri", item: `${siteAdresi()}/dilekce-ornekleri` },
        { "@type": "ListItem", position: 3, name: r.kisaAd, item: `${siteAdresi()}/${r.slug}` },
      ],
    },
  ];

  return (
    <article className="kapsayici max-w-3xl py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(yapilandirilmisVeri).replace(/</g, "\\u003c") }}
      />
      <nav className="text-sm text-gri" aria-label="Sayfa yolu">
        <Link href="/" className="hover:underline">
          Ana sayfa
        </Link>{" "}
        ›{" "}
        <Link href="/dilekce-ornekleri" className="hover:underline">
          Dilekçe örnekleri
        </Link>{" "}
        › <span>{r.kisaAd}</span>
      </nav>

      <h1 className="mt-4 text-2xl leading-tight font-bold sm:text-4xl">{r.h1}</h1>
      {r.giris.map((p) => (
        <p key={p} className="mt-4 text-lg text-gri">
          {p}
        </p>
      ))}

      <div className="kart mt-6 border-2 border-marka-600 bg-marka-50">
        <p className="font-semibold">Başvurabilir misiniz? 1 dakikada öğrenin.</p>
        <p className="mt-1 text-gri">
          Ücretsiz testi yapın, dilekçenizin önizlemesini görün. Dilekçenin tamamı {tlYaz(hakemHeyeti.fiyat)}.
        </p>
        <Link href={baglanti} className="dugme mt-4 w-full sm:w-auto">
          Ücretsiz teste başla
        </Link>
      </div>

      <Bolum baslik="Hangi durumlarda kullanılır?">
        <Liste ogeler={r.durumlar} />
      </Bolum>

      <Bolum baslik="Haklarınız neler?">
        <div className="space-y-4">
          {r.haklar.map((h) => {
            const m = mevzuatGetir(h.mevzuat);
            return (
              <div key={h.mevzuat} className="kart">
                <p className="text-sm font-semibold text-marka-700">
                  {m.kisaAd} {atifYaz(m)} – {m.baslik}
                </p>
                <p className="mt-1">{h.metin}</p>
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-marka-700">Madde metnini göster</summary>
                  <p className="mt-2 font-serif text-gri">{m.metin}</p>
                </details>
              </div>
            );
          })}
        </div>
      </Bolum>

      <Bolum baslik="Süreler ve sınırlar">
        <Liste
          ogeler={[
            `${HAKEM_HEYETI_SINIRI.yil} yılında değeri ${tlYaz(HAKEM_HEYETI_SINIRI.tutar)}'nin altındaki sorunlar için hakem heyetine başvurulur; başvuru ücretsizdir.`,
            ...r.sureler,
          ]}
        />
      </Bolum>

      <Bolum baslik="Dilekçede neler olmalı?">
        <Liste ogeler={DILEKCEDE_OLMASI_GEREKENLER} />
      </Bolum>

      <Bolum baslik="Örnek dilekçe">
        <p className="mb-3 text-sm text-gri">
          Köşeli parantez içindeki yerleri kendi bilgilerinizle doldurun. Dilekto, verdiğiniz bilgilerle bu
          boşlukları sizin için doldurur ve metni olayınıza göre yazar.
        </p>
        <div className="rounded-2xl border border-cizgi bg-white p-5 font-serif text-[0.95rem] leading-relaxed shadow-sm sm:p-8">
          <p className="text-center font-bold">[İL / İLÇE] TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA</p>
          <p className="mt-4">
            <strong>BAŞVURU SAHİBİ:</strong> [Adınız Soyadınız], [TC kimlik numaranız], [Adresiniz]
          </p>
          <p>
            <strong>KARŞI TARAF:</strong> [Satıcının unvanı ve adresi]
          </p>
          <p className="mt-3">
            <strong>KONU:</strong> {r.ornek.konu}
          </p>
          <p className="mt-3 font-bold">AÇIKLAMALAR:</p>
          {r.ornek.olaylar.map((o, i) => (
            <p key={o} className="mt-1">
              {i + 1}. {o}
            </p>
          ))}
          <p className="mt-3">
            <strong>HUKUKİ NEDENLER:</strong> {hukukiNedenlerYaz(r.ornek.mevzuat)} ve ilgili mevzuat.
          </p>
          <p className="mt-3">
            <strong>SONUÇ VE İSTEM:</strong> {r.ornek.talep}
          </p>
          <p className="mt-4 text-right">
            [Tarih]
            <br />
            [Adınız Soyadınız]
            <br />
            İmza
          </p>
        </div>
      </Bolum>

      <Bolum baslik="Hangi belgeleri eklemelisiniz?">
        <Liste ogeler={r.belgeler} />
      </Bolum>

      <Bolum baslik="e-Devlet'ten adım adım başvuru">
        <ol className="space-y-3">
          {hakemHeyeti.basvuruAdimlari.adimlar.map((a, i) => (
            <li key={a} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marka-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-gri">{a}</span>
            </li>
          ))}
        </ol>
      </Bolum>

      <Bolum baslik="İpuçları">
        <Liste ogeler={r.ipuclari} />
      </Bolum>

      <Bolum baslik="Sık sorulan sorular">
        <div className="space-y-3">
          {r.sss.map((x) => (
            <details key={x.s} className="kart group p-0 sm:p-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
                {x.s}
                <span className="text-xl text-marka-600 transition group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-gri">{x.c}</p>
            </details>
          ))}
        </div>
      </Bolum>

      <div className="kart mt-10 flex flex-col items-start gap-4 bg-marka-50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold">Dilekçenizi birkaç dakikada hazırlayın</p>
          <p className="text-gri">Test ve önizleme ücretsizdir.</p>
        </div>
        <Link href={baglanti} className="dugme shrink-0">
          Ücretsiz teste başla
        </Link>
      </div>

      {ilgili.length > 0 && (
        <Bolum baslik="Benzer dilekçeler">
          <div className="grid gap-3 sm:grid-cols-3">
            {ilgili.map((x) => (
              <Link key={x.slug} href={`/${x.slug}`} className="kart p-4 font-semibold text-marka-700 hover:border-marka-600 sm:p-4">
                {x.kisaAd}
              </Link>
            ))}
          </div>
        </Bolum>
      )}

      <SorumlulukNotu className="mt-10" />
      <MobilCagri />
    </article>
  );
}
