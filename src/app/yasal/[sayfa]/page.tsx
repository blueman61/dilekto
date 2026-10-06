// Yasal sayfalar. Bu metinler TASLAKTIR; gerçek ödemeye geçmeden önce
// bir uzmana kontrol ettirilmeli ve src/config/site.ts içindeki satıcı
// bilgileri doldurulmalıdır.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { site, tlYaz } from "@/config/site";
import { SORUMLULUK_METNI } from "@/components/Sorumluluk";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";

const S = site.satici;
const GUNCELLEME = "4 Ekim 2026";

function SaticiBilgileri() {
  return (
    <ul>
      <li>Unvan: {S.unvan}</li>
      <li>Adres: {S.adres}</li>
      <li>
        Vergi dairesi / numarası: {S.vergiDairesi} / {S.vergiNo}
      </li>
      <li>Telefon: {S.telefon}</li>
      <li>E-posta: {site.eposta}</li>
    </ul>
  );
}

const SAYFALAR: Record<string, { baslik: string; icerik: () => ReactNode }> = {
  kvkk: {
    baslik: "KVKK aydınlatma metni",
    icerik: () => (
      <>
        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, {site.ad} sitesini
          kullanırken kişisel verilerinizin nasıl işlendiğini açıklar.
        </p>

        <h2>1. Veri sorumlusu</h2>
        <SaticiBilgileri />

        <h2>2. Hangi verileri işliyoruz?</h2>
        <p>Az veri ilkesiyle çalışırız. Sunucularımıza yalnızca şunlar ulaşır:</p>
        <ul>
          <li>
            <strong>Dilekçe bilgileri:</strong> uygunluk testi cevaplarınız, aldığınız ürün veya hizmet, satıcının
            adı ve adresi, olayın anlatımı, talebiniz ve elinizdeki belgelerin türü.
          </li>
          <li>
            <strong>Yüklediğiniz fatura (isteğe bağlı):</strong> yalnızca ürün, satıcı, tarih ve tutar bilgilerini okumak
            için yapay zekâ servisine gönderilir. Dosya hiçbir yerde kaydedilmez; işlem bitince bellekten silinir.
            Faturada yer alan adınız ve adresiniz okunmaz ve kaydedilmez.
          </li>
          <li>
            <strong>Ödeme bilgisi:</strong> ödeme sağlayıcısının (Shopier) verdiği işlem numarası ve ödeme tarihi. Kart
            bilgileriniz bize ulaşmaz.
          </li>
          <li>
            <strong>Teknik kayıtlar:</strong> güvenlik ve hata takibi için barındırma sağlayıcısının tuttuğu,
            IP adresi ve tarayıcı bilgisi gibi kısa süreli sunucu kayıtları.
          </li>
        </ul>
        <p>
          <strong>Adınız, TC kimlik numaranız, adresiniz, telefonunuz ve e-postanız sunucularımıza gönderilmez.</strong>{" "}
          Bu bilgiler dilekçeye yalnızca kendi cihazınızda, tarayıcınızın içinde eklenir ve yalnızca o cihazda
          saklanır. Dilekçe sayfasındaki &quot;Bilgilerimi bu cihazdan sil&quot; düğmesiyle istediğiniz an
          silebilirsiniz.
        </p>
        <p>
          Olayı anlatırken adınızı, kimlik numaranızı, IBAN ya da kart numaranızı veya sağlık bilgisi gibi özel
          nitelikli verileri yazmamanızı rica ederiz. Olay anlatımı dilekçeyi yazmak için yapay zekâ servisine
          gönderildiğinden, kimlik numarası, IBAN ve kart numarası gibi bilgiler fark edildiğinde sistem tarafından
          kabul edilmez; bu bilgiler dilekçeye yalnızca ödemeden sonra, tarayıcınızda siz tarafından eklenir.
        </p>

        <h2>3. Hangi amaçla ve hangi hukuki sebeple işliyoruz?</h2>
        <ul>
          <li>
            Dilekçe taslağınızı hazırlamak ve size sunmak: sözleşmenin kurulması ve ifası (KVKK m. 5/2-c).
          </li>
          <li>Ödeme ve muhasebe kayıtlarını tutmak: hukuki yükümlülük (KVKK m. 5/2-ç).</li>
          <li>Siteyi güvenli ve çalışır tutmak, otomatik kötüye kullanımı (robotları) engellemek: meşru menfaat (KVKK m. 5/2-f).</li>
        </ul>

        <h2>4. Verileri kimlere aktarıyoruz?</h2>
        <p>Hizmeti sunabilmek için şu hizmet sağlayıcılarla çalışırız:</p>
        <ul>
          <li>Barındırma: Vercel Inc. (ABD)</li>
          <li>Veritabanı: Supabase Inc. (sunucu konumu: Almanya, Frankfurt)</li>
          <li>
            Metin üretimi ve fatura okuma için yapay zekâ: Google LLC (Gemini API) veya Anthropic PBC (Claude API)
            (ABD). Bu sağlayıcılara olayın anlatımı ve dilekçe bilgileri ile, yüklerseniz faturanızın görüntüsü
            gönderilir. Dilekçeye eklediğiniz adınız ve kimlik bilgileriniz gönderilmez.
          </li>
          <li>Robot koruması: Cloudflare Inc. (Turnstile), yalnızca tarayıcı ve bağlantı bilgileri.</li>
          <li>
            Ziyaretçi istatistiği: Vercel Web Analytics. Çerez kullanmaz ve sizi tanımlamaz; dilekçe sayfalarının
            adresindeki size özel kimlik istatistiğe gönderilmeden silinir.
          </li>
          <li>
            Ödeme: Shopier. Ödeme sayfasında yazdığınız ad, soyad, e-posta, telefon ve adres bilgileri fatura ve
            ödeme işlemi için tarayıcınızdan doğrudan Shopier&apos;e iletilir; bizim sunucularımızda saklanmaz. Kart
            bilgilerinizi yalnızca Shopier&apos;in ödeme sayfasında girersiniz.
          </li>
        </ul>
        <p>
          Bu sağlayıcıların bir kısmı yurt dışındadır. Yurt dışına aktarım, KVKK&apos;nın 9. maddesinde öngörülen
          güvencelere uygun olarak yapılır.
        </p>

        <h2>5. Ne kadar süre saklıyoruz?</h2>
        <ul>
          <li>Dilekçe bilgileri: oluşturulduktan {site.dilekceSaklamaGun} gün sonra kendiliğinden silinir.</li>
          <li>Yüklenen belgeler (fatura vb.): hiç kaydedilmez; okunduktan hemen sonra silinir.</li>
          <li>Ödeme kayıtları: vergi mevzuatının öngördüğü süre boyunca saklanır.</li>
        </ul>

        <h2>6. Haklarınız</h2>
        <p>KVKK&apos;nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi isteme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı kişilere bildirilmesini isteme, otomatik sistemlerle analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.</p>
        <p>
          Başvurularınızı <a href={`mailto:${site.eposta}`}>{site.eposta}</a> adresine iletebilirsiniz. En geç 30
          gün içinde ücretsiz olarak yanıtlarız.
        </p>
      </>
    ),
  },

  "kullanim-sartlari": {
    baslik: "Kullanım şartları",
    icerik: () => (
      <>
        <p>
          {site.ad} sitesini kullanarak aşağıdaki şartları kabul etmiş olursunuz. Site, {S.unvan} tarafından
          işletilir.
        </p>
        <h2>1. Hizmetin niteliği</h2>
        <p>{SORUMLULUK_METNI}</p>
        <p>
          {site.ad}, verdiğiniz bilgilerle dilekçe taslağı hazırlayan bir yazı aracıdır. Taslağın bir kısmı yapay
          zekâ ile yazılır; kanun maddelerine yapılan atıflar ise yalnızca resmî metinle kontrol edilmiş sabit bir
          listeden eklenir.
        </p>
        <h2>2. Sizin sorumluluğunuz</h2>
        <ul>
          <li>Verdiğiniz bilgilerin doğru ve eksiksiz olması size aittir.</li>
          <li>Dilekçeyi göndermeden önce okumak, gerekirse düzeltmek ve imzalamak size aittir.</li>
          <li>Başvuruyu ilgili kuruma yapmak ve süreleri takip etmek size aittir.</li>
        </ul>
        <h2>3. Ücret</h2>
        <p>
          Uygunluk testi ve önizleme ücretsizdir. Dilekçenin tamamı için tek seferlik ücret alınır (
          {hakemHeyeti.ad}: {tlYaz(hakemHeyeti.fiyat)}, KDV dahil). Abonelik yoktur.
        </p>
        <h2>4. Kullanım sınırları</h2>
        <ul>
          <li>Siteyi gerçeğe aykırı, yanıltıcı veya başkasına zarar verecek başvurular hazırlamak için kullanamazsınız.</li>
          <li>Siteyi otomatik araçlarla aşırı yükleyemez, güvenliğini aşmaya çalışamazsınız.</li>
        </ul>
        <h2>5. Sorumluluğun sınırı</h2>
        <p>
          Başvurunuzun sonucu, ilgili kurumun değerlendirmesine bağlıdır. {site.ad}, başvurunun sonucundan ve
          verdiğiniz bilgilerin yanlışlığından doğan zararlardan sorumlu tutulamaz. Bu hüküm, kanunen
          sınırlanamayan sorumlulukları etkilemez.
        </p>
        <h2>6. Değişiklikler</h2>
        <p>Bu şartlar güncellenebilir. Güncel metin her zaman bu sayfada yer alır.</p>
        <h2>7. Uyuşmazlıklar</h2>
        <p>
          Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Tüketici uyuşmazlıklarında, parasal sınırlar
          dâhilinde tüketici hakem heyetleri, bu sınırların üzerinde tüketici mahkemeleri yetkilidir.
        </p>
      </>
    ),
  },

  "mesafeli-satis": {
    baslik: "Ön bilgilendirme ve mesafeli satış sözleşmesi",
    icerik: () => (
      <>
        <h2>1. Satıcı</h2>
        <SaticiBilgileri />
        <h2>2. Alıcı</h2>
        <p>Siteden ödeme yaparak dilekçe hazırlama hizmetini satın alan kişi.</p>
        <h2>3. Sözleşmenin konusu</h2>
        <p>
          Alıcının sitede verdiği bilgilerle hazırlanan, düzenlenebilir ve indirilebilir dilekçe taslağına,
          eklenecek belgelerin listesine ve başvuru adımlarına elektronik ortamda erişim hizmetidir.
        </p>
        <h2>4. Fiyat ve ödeme</h2>
        <p>
          {hakemHeyeti.ad}: {tlYaz(hakemHeyeti.fiyat)} (KDV dahil, tek seferlik). Ödeme, sitede belirtilen ödeme
          kuruluşu aracılığıyla kredi veya banka kartıyla yapılır. Ek bir ücret veya teslimat masrafı yoktur.
        </p>
        <h2>5. İfa ve teslim</h2>
        <p>
          Hizmet, ödemenin onaylanmasının hemen ardından elektronik ortamda ifa edilir: dilekçenin tamamı alıcının
          ekranında açılır ve {site.dilekceSaklamaGun} gün boyunca aynı adresten yeniden indirilebilir.
        </p>
        <h2>6. Cayma hakkı</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği uyarınca, elektronik ortamda anında ifa edilen hizmetlere ve tüketiciye
          anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde cayma hakkı kullanılamaz. Alıcı, ödeme
          öncesinde bu durumu ayrıca onaylar. Teknik sorunlarda uygulanacak iade koşulları için{" "}
          <Link href="/yasal/iade">iade koşulları</Link> sayfasına bakınız.
        </p>
        <h2>7. Şikâyet ve uyuşmazlık</h2>
        <p>
          Şikâyetlerinizi {site.eposta} adresine iletebilirsiniz. Uyuşmazlıklarda, parasal sınırlar dâhilinde
          alıcının yerleşim yerindeki veya işlemin yapıldığı yerdeki tüketici hakem heyetine, bu sınırların
          üzerinde tüketici mahkemesine başvurulabilir.
        </p>
        <h2>8. Yürürlük</h2>
        <p>Alıcı, ödeme adımında bu metni okuyup onayladığında sözleşme kurulmuş olur.</p>
      </>
    ),
  },

  iade: {
    baslik: "İade koşulları",
    icerik: () => (
      <>
        <p>
          Dilekçeniz ödemeden hemen sonra elektronik ortamda teslim edildiği için yasal cayma hakkı
          bulunmamaktadır. Buna rağmen aşağıdaki durumlarda ödediğiniz ücretin tamamını iade ederiz:
        </p>
        <ul>
          <li>Teknik bir sorun nedeniyle ödeme sonrası dilekçenize erişemediyseniz veya dosyayı indiremediyseniz.</li>
          <li>Aynı dilekçe için yanlışlıkla birden fazla ödeme alındıysa.</li>
        </ul>
        <h2>Nasıl başvurulur?</h2>
        <p>
          Ödeme tarihinden itibaren 14 gün içinde <a href={`mailto:${site.eposta}`}>{site.eposta}</a> adresine,
          dilekçe sayfanızın adresini ve sorunu kısaca yazarak başvurun. Uygun bulunan iadeler, ödemeyi
          yaptığınız karta yapılır; tutarın hesabınıza geçme süresi bankanıza göre değişir.
        </p>
        <p>
          Deneme sürümünde ödeme alınmadığı için iade işlemi de yoktur.
        </p>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(SAYFALAR).map((sayfa) => ({ sayfa }));
}

export async function generateMetadata(props: PageProps<"/yasal/[sayfa]">): Promise<Metadata> {
  const s = SAYFALAR[(await props.params).sayfa];
  return s ? { title: s.baslik } : {};
}

export default async function YasalSayfa(props: PageProps<"/yasal/[sayfa]">) {
  const s = SAYFALAR[(await props.params).sayfa];
  if (!s) notFound();
  return (
    <article className="kapsayici metin-sayfasi max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{s.baslik}</h1>
      <p className="mt-2 text-sm text-gri">Son güncelleme: {GUNCELLEME}</p>
      <p className="mt-4 rounded-xl bg-uyari-zemin p-4 text-sm text-uyari">
        Bu metin taslaktır ve gerçek ödemeye geçilmeden önce güncellenecektir.
      </p>
      {s.icerik()}
    </article>
  );
}
