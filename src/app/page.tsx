import Link from "next/link";
import { site, tlYaz } from "@/config/site";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";
import { HAKEM_HEYETI_SINIRI } from "@/lib/mevzuat";

const SORUNLAR = [
  { baslik: "Bozuk çıkan ürün", metin: "Telefon, beyaz eşya, ayakkabı ya da başka bir ürün kısa sürede bozuldu." },
  { baslik: "Kargodan hasarlı gelen ürün", metin: "Paket ezik, ürün kırık ya da eksik çıktı." },
  { baslik: "Kötü yapılan hizmet", metin: "Tamir, tadilat, montaj ya da abonelik söylendiği gibi yapılmadı." },
  { baslik: "Gelmeyen sipariş", metin: "Parasını ödediğiniz sipariş gelmedi ya da çok gecikti." },
  { baslik: "Kabul edilmeyen iade", metin: "İnternetten aldığınız ürünü 14 gün içinde iade etmek istediniz ama kabul edilmedi." },
];

const ADIMLAR = [
  { baslik: "Ücretsiz testi yapın", metin: "6 kısa soruyla hakem heyetine başvurup başvuramayacağınızı hemen öğrenin." },
  { baslik: "Ne olduğunu anlatın", metin: "Ne aldığınızı, ne olduğunu ve ne istediğinizi kendi cümlelerinizle yazın." },
  { baslik: "Önizlemeyi görün", metin: "Size özel dilekçenizin ilk bölümünü ücretsiz okuyun." },
  { baslik: "İndirin ve başvurun", metin: "Ödemeden sonra dilekçeyi düzenleyin, PDF ya da Word olarak indirin, e-Devlet'ten gönderin." },
];

const SSS = [
  {
    s: "Tüketici hakem heyeti nedir?",
    c: `Tüketiciler ile satıcılar arasındaki sorunlara bakan, Ticaret Bakanlığı'na bağlı başvuru yeridir. ${HAKEM_HEYETI_SINIRI.yil} yılında değeri ${tlYaz(HAKEM_HEYETI_SINIRI.tutar)}'nin altındaki sorunlar için hakem heyetine başvurmak zorunludur.`,
  },
  {
    s: "Hakem heyetine başvurmak ücretli mi?",
    c: `Hayır, başvuru ücretsizdir. Dilekto'ya ödediğiniz ${tlYaz(hakemHeyeti.fiyat)}, dilekçenizi hazırlayan aracın ücretidir.`,
  },
  {
    s: "Dilekto ne yapar, ne yapmaz?",
    c: "Dilekto, verdiğiniz bilgilerle dilekçenizi düzenli ve resmî bir dille yazmanıza yardım eden bir araçtır. Sizin adınıza başvuru yapmaz, sizi temsil etmez ve sonuç hakkında söz vermez. Başvuruyu siz yaparsınız; nasıl yapacağınızı adım adım anlatırız.",
  },
  {
    s: "Kişisel bilgilerim ne oluyor?",
    c: `Adınız, TC kimlik numaranız, adresiniz ve telefonunuz sunucularımıza hiç gönderilmez; dilekçeye yalnızca sizin cihazınızda eklenir. Olayı anlatan bilgiler ${site.dilekceSaklamaGun} gün sonra kendiliğinden silinir.`,
  },
  {
    s: "Dilekçeyi değiştirebilir miyim?",
    c: "Evet. Ödemeden sonra dilekçenin tamamı açılır; istediğiniz yeri düzeltip PDF ya da Word olarak indirebilirsiniz.",
  },
  {
    s: "Dilekçeme sonra nasıl ulaşırım?",
    c: `Dilekçenizin size özel bir adresi vardır. Bu adresi kaydederseniz ${site.dilekceSaklamaGun} gün boyunca dilekçenize yeniden ulaşabilirsiniz.`,
  },
  {
    s: "Başvuruyu nereden yapacağım?",
    c: "En kolay yol e-Devlet'tir. Dilekçenizle birlikte e-Devlet'te hangi adımları izleyeceğinizi ve hangi belgeleri ekleyeceğinizi gösteren bir liste de hazırlarız.",
  },
];

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
            <div key={s.baslik} className="kart">
              <h3 className="font-semibold">{s.baslik}</h3>
              <p className="mt-1 text-gri">{s.metin}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section id="nasil-calisir" className="scroll-mt-20 bg-zemin py-12">
        <div className="kapsayici">
          <h2 className="text-2xl font-bold">Nasıl çalışır?</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ADIMLAR.map((a, i) => (
              <li key={a.baslik} className="kart">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marka-600 font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{a.baslik}</h3>
                <p className="mt-1 text-gri">{a.metin}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fiyat */}
      <section id="fiyat" className="kapsayici scroll-mt-20 py-12">
        <h2 className="text-2xl font-bold">Fiyat</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="kart border-2 border-marka-600">
            <p className="font-semibold text-marka-700">{hakemHeyeti.ad}</p>
            <p className="mt-2 text-4xl font-bold">
              {tlYaz(hakemHeyeti.fiyat)}
              <span className="ml-2 text-base font-normal text-gri">tek seferlik, KDV dahil</span>
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Size özel, düzenlenebilir dilekçe",
                "PDF ve Word olarak indirme",
                "Eklemeniz gereken belgelerin listesi",
                "e-Devlet'ten başvuru için adım adım anlatım",
                `${site.dilekceSaklamaGun} gün boyunca yeniden indirme`,
              ].map((m) => (
                <li key={m} className="flex gap-2">
                  <span className="text-basari" aria-hidden="true">✓</span>
                  {m}
                </li>
              ))}
            </ul>
            <Link href="/olustur/hakem-heyeti" className="dugme mt-6 w-full">
              Ücretsiz teste başla
            </Link>
          </div>
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
          <div className="mt-6 space-y-3">
            {SSS.map((x) => (
              <details key={x.s} className="kart group p-0 sm:p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
                  {x.s}
                  <span className="text-marka-600 transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-gri">{x.c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="kapsayici max-w-3xl pt-12">
        <SorumlulukNotu />
      </section>
    </>
  );
}
