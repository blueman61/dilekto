import Link from "next/link";
import { tlYaz } from "@/config/site";
import { MobilCagri } from "@/components/MobilCagri";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { AdimListesi, FiyatKarti, SssListesi } from "@/components/Tanitim";
import { SORUNLAR } from "@/content/genel";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";

export default function AnaSayfa() {
  return (
    <>
      {/* Giriş */}
      <section className="bg-gradient-to-b from-marka-50 to-white">
        <div className="kapsayici grid gap-10 py-12 sm:py-16 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white px-3 py-1 text-sm font-medium text-marka-700 shadow-sm">
              Tüketici Hakem Heyeti başvuruları için
            </p>
            <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
              Hakem heyeti dilekçenizi birkaç dakikada kendiniz hazırlayın
            </h1>
            <p className="mt-4 text-lg text-gri">
              Birkaç basit soruyu cevaplayın. Size özel dilekçenizi, eklemeniz gereken belgelerin
              listesini ve e-Devlet&apos;ten nasıl başvuracağınızı adım adım hazırlayalım.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/olustur/hakem-heyeti" className="dugme text-lg">
                Ücretsiz teste başla
              </Link>
              <Link href="#nasil-calisir" className="dugme-ikincil">
                Nasıl çalışır?
              </Link>
            </div>
            <p className="mt-4 text-sm text-gri">
              Test ücretsizdir. Dilekçenin tamamı için tek seferlik {tlYaz(hakemHeyeti.fiyat)}. Üyelik
              gerekmez.
            </p>
          </div>

          <div className="kart shadow-lg" aria-hidden="true">
            <p className="text-center font-serif text-sm font-bold">
              İSTANBUL / KADIKÖY TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA
            </p>
            <div className="mt-4 space-y-1.5 font-serif text-sm">
              <p>
                <strong>KONU:</strong> Ayıplı cep telefonunun bedelinin iadesi talebi
              </p>
              <p className="pt-2">
                <strong>AÇIKLAMALAR:</strong>
              </p>
              <p className="text-gri">
                1. 12.03.2026 tarihinde karşı taraftan cep telefonu satın aldım. Telefonun ekranı üç
                hafta sonra kendiliğinden kapanmaya başladı…
              </p>
              <div className="space-y-2 pt-2 blur-[3px]">
                <div className="h-2.5 w-full rounded bg-cizgi" />
                <div className="h-2.5 w-11/12 rounded bg-cizgi" />
                <div className="h-2.5 w-4/5 rounded bg-cizgi" />
                <div className="h-2.5 w-full rounded bg-cizgi" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kimler için */}
      <section className="kapsayici py-12">
        <h2 className="text-2xl font-bold">Hangi sorunlar için?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SORUNLAR.map((s) => (
            <Link key={s.baslik} href={`/${s.rehber}`} className="kart transition hover:border-marka-600">
              <h3 className="font-semibold text-marka-700">{s.baslik}</h3>
              <p className="mt-1 text-gri">{s.metin}</p>
            </Link>
          ))}
        </div>
        <Link href="/dilekce-ornekleri" className="mt-6 inline-block font-semibold text-marka-700 underline">
          Tüm dilekçe örnekleri
        </Link>
      </section>

      {/* Nasıl çalışır */}
      <section id="nasil-calisir" className="scroll-mt-20 bg-zemin py-12">
        <div className="kapsayici">
          <h2 className="text-2xl font-bold">Nasıl çalışır?</h2>
          <div className="mt-6">
            <AdimListesi />
          </div>
          <Link href="/nasil-calisir" className="mt-6 inline-block font-semibold text-marka-700 underline">
            Ayrıntılı anlatım
          </Link>
        </div>
      </section>

      {/* Fiyat */}
      <section id="fiyat" className="kapsayici scroll-mt-20 py-12">
        <h2 className="text-2xl font-bold">Fiyat</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <FiyatKarti />
          <div className="kart bg-zemin">
            <h3 className="font-semibold">Önce ücretsiz deneyin</h3>
            <p className="mt-2 text-gri">
              &quot;Hakem heyetine başvurabilir miyim?&quot; testi ve dilekçenizin önizlemesi ücretsizdir.
              Beğenirseniz ödeme yapıp dilekçenin tamamını açarsınız. Abonelik yoktur, kart bilgileriniz
              saklanmaz.
            </p>
            <h3 className="mt-5 font-semibold">Kişisel bilgileriniz sizde kalır</h3>
            <p className="mt-2 text-gri">
              Adınız, TC kimlik numaranız ve adresiniz sunucularımıza gönderilmez; dilekçeye yalnızca sizin
              cihazınızda eklenir.
            </p>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section id="sss" className="scroll-mt-20 bg-zemin py-12">
        <div className="kapsayici max-w-3xl">
          <h2 className="text-2xl font-bold">Sık sorulan sorular</h2>
          <div className="mt-6">
            <SssListesi adet={5} />
          </div>
          <Link href="/sss" className="mt-6 inline-block font-semibold text-marka-700 underline">
            Tüm soruları gör
          </Link>
        </div>
      </section>

      <section className="kapsayici max-w-3xl pt-12">
        <SorumlulukNotu />
      </section>
      <MobilCagri />
    </>
  );
}
