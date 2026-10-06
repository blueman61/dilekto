// Ana sayfa ve tanıtım sayfalarında ortak kullanılan metinler.

import { site, tlYaz } from "@/config/site";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";
import { HAKEM_HEYETI_SINIRI } from "@/lib/mevzuat";

export const SORUNLAR = [
  { rehber: "ayipli-mal-iade-dilekcesi", baslik: "Bozuk çıkan ürün", metin: "Telefon, beyaz eşya, ayakkabı ya da başka bir ürün kısa sürede bozuldu." },
  { rehber: "kargo-hasari-dilekcesi", baslik: "Kargodan hasarlı gelen ürün", metin: "Paket ezik, ürün kırık ya da eksik çıktı." },
  { rehber: "servis-tamir-sikayet-dilekcesi", baslik: "Kötü yapılan hizmet", metin: "Tamir, tadilat, montaj ya da abonelik söylendiği gibi yapılmadı." },
  { rehber: "gelmeyen-siparis-sikayet-dilekcesi", baslik: "Gelmeyen sipariş", metin: "Parasını ödediğiniz sipariş gelmedi ya da çok gecikti." },
  { rehber: "internetten-alinan-urun-iade-dilekcesi", baslik: "Kabul edilmeyen iade", metin: "İnternetten aldığınız ürünü 14 gün içinde iade etmek istediniz ama kabul edilmedi." },
];

export const ADIMLAR = [
  { baslik: "Ücretsiz testi yapın", metin: "6 kısa soruyla hakem heyetine başvurup başvuramayacağınızı hemen öğrenin." },
  { baslik: "Ne olduğunu anlatın", metin: "Ne aldığınızı, ne olduğunu ve ne istediğinizi kendi cümlelerinizle yazın." },
  { baslik: "Önizlemeyi görün", metin: "Size özel dilekçenizin ilk bölümünü ücretsiz okuyun." },
  { baslik: "İndirin ve başvurun", metin: "Ödemeden sonra dilekçeyi düzenleyin, PDF ya da Word olarak indirin, e-Devlet'ten gönderin." },
];

export const SSS = [
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
  {
    s: "Faturamı yüklemem gerekiyor mu?",
    c: "Hayır, isteğe bağlıdır. Yüklerseniz ürün ve satıcı bilgilerini sizin için doldururuz. Dosyanız kaydedilmez; yalnızca bilgileri okumak için kullanılır ve hemen silinir.",
  },
  {
    s: "Faturam yoksa başvurabilir miyim?",
    c: "Evet. Faturanız yoksa ödemeyi gösteren banka dekontu, kredi kartı ekstresi ya da sipariş ekran görüntüsü de işinizi görür. Belge listesinde size hangi belgeleri bulabileceğinizi gösteririz.",
  },
  {
    s: "Hakem heyeti ne kadar sürede karar verir?",
    c: "Süre heyetin yoğunluğuna göre değişir; Dilekto süre ya da sonuç hakkında söz vermez. e-Devlet'ten başvurduysanız başvurunuzun durumunu aynı hizmetten takip edebilirsiniz.",
  },
  {
    s: "Ödemeden sonra iade alabilir miyim?",
    c: "Dilekçe ödemeden hemen sonra teslim edildiği için cayma hakkı yoktur. Ancak teknik bir sorun nedeniyle dilekçenize ulaşamadıysanız ücretinizi iade ederiz. Ayrıntılar İade koşulları sayfasındadır.",
  },
];

export const ALACAKLARINIZ = [
  "Size özel, düzenlenebilir dilekçe",
  "PDF ve Word olarak indirme",
  "Eklemeniz gereken belgelerin listesi",
  "e-Devlet'ten başvuru için adım adım anlatım",
  `${site.dilekceSaklamaGun} gün boyunca yeniden indirme`,
];

export const FIYAT = { tutar: hakemHeyeti.fiyat, ad: hakemHeyeti.ad, metin: tlYaz(hakemHeyeti.fiyat) };

