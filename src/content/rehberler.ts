// Arama motorları için şikâyet türüne özel rehber sayfaları.
// Her sayfa kökte kendi adresinde yayınlanır: dilekto.com/<slug>
//
// Kurallar:
// - Kanun atıfları YALNIZCA src/lib/mevzuat.ts listesindeki kimliklerle yapılır.
// - Yasaklı ifadeler (src/lib/yasakli-ifadeler.ts) kullanılmaz; derleme taraması yakalar.
// - Her sayfanın metni kendine özgü olmalı (kopya içerik arama sıralamasını düşürür).

export type Rehber = {
  slug: string;
  /** Uygunluk testindeki konu (testi önceden doldurmak için) */
  konu: "ayipli_mal" | "kargo_hasar" | "ayipli_hizmet" | "teslimat" | "cayma";
  alisSekli?: "internet" | "magaza";
  /** Dilekçe örnekleri sayfasındaki kart başlığı */
  kisaAd: string;
  /** Tarayıcı sekmesi ve arama sonucu başlığı (~60 karakter) */
  baslik: string;
  /** Arama sonucu açıklaması (~150 karakter) */
  aciklama: string;
  h1: string;
  giris: string[];
  durumlar: string[];
  haklar: { mevzuat: string; metin: string }[];
  sureler: string[];
  belgeler: string[];
  ipuclari: string[];
  ornek: { konu: string; olaylar: string[]; talep: string; mevzuat: string[] };
  sss: { s: string; c: string }[];
  ilgili: string[];
};

export const REHBERLER: Rehber[] = [
  // -------------------------------------------------------------------------
  {
    slug: "tuketici-hakem-heyeti-dilekce-ornegi",
    konu: "ayipli_mal",
    kisaAd: "Tüketici hakem heyeti dilekçe örneği",
    baslik: "Tüketici Hakem Heyeti Dilekçe Örneği (2026) ve Başvuru Rehberi",
    aciklama:
      "Tüketici hakem heyetine başvuru dilekçesi nasıl yazılır? 2026 parasal sınırı, dilekçede olması gerekenler, gerekli belgeler ve örnek dilekçe.",
    h1: "Tüketici hakem heyeti dilekçe örneği ve başvuru rehberi",
    giris: [
      "Aldığınız bir ürün ya da hizmetle ilgili sorununuz satıcıyla görüşerek çözülmediyse, tüketici hakem heyetine başvurabilirsiniz. Başvuru ücretsizdir ve e-Devlet üzerinden evden yapılabilir.",
      "Bu sayfada dilekçenizde hangi bilgilerin bulunması gerektiğini, hangi belgeleri eklemeniz gerektiğini ve örnek bir dilekçenin nasıl göründüğünü bulacaksınız.",
    ],
    durumlar: [
      "Bozuk, kusurlu ya da anlatıldığı gibi çıkmayan ürünler",
      "Eksik ya da kötü yapılan hizmetler (tamir, montaj, tadilat, abonelik)",
      "Gelmeyen ya da çok geciken internet siparişleri",
      "14 gün içinde iade edilmek istenen ama kabul edilmeyen ürünler",
    ],
    haklar: [
      {
        mevzuat: "6502-m68",
        metin:
          "Değeri parasal sınırın altında olan tüketici sorunlarında hakem heyetine başvurmak zorunludur. Başvuruyu oturduğunuz yerdeki ya da alışverişi yaptığınız yerdeki hakem heyetine yapabilirsiniz.",
      },
      {
        mevzuat: "6502-m11",
        metin:
          "Ürün ayıplı çıkarsa iade, değişim, ücretsiz onarım ya da indirim haklarından birini siz seçersiniz; satıcı seçtiğiniz talebi yerine getirmekle yükümlüdür.",
      },
      {
        mevzuat: "6502-m15",
        metin: "Hizmet ayıplı yapıldıysa yeniden yapılmasını, düzeltilmesini, indirim ya da ücret iadesini isteyebilirsiniz.",
      },
    ],
    sureler: [
      "2026 yılında değeri 186.000 TL'nin altındaki sorunlar için hakem heyetine başvurulur.",
      "Ayıplı mal ve hizmetlerde satıcının sorumluluğu, kanunda ya da sözleşmede daha uzun bir süre yoksa teslimden itibaren 2 yıldır.",
    ],
    belgeler: [
      "Fatura, fiş ya da ödemeyi gösteren banka kaydı",
      "Satıcıyla yazışmalar ya da şikâyet kayıtları",
      "Sorunu gösteren fotoğraf, video ya da servis raporu",
      "Dilekçenin kendisi (e-Devlet'e PDF olarak yüklenir)",
    ],
    ipuclari: [
      "Olayları tarih sırasıyla, kısa ve sade cümlelerle anlatın.",
      "Ne istediğinizi (iade, değişim, onarım, indirim) açıkça yazın; birden fazla seçeneği aynı anda istemeyin.",
      "Uyuşmazlığın değerini, yani ödediğiniz tutarı mutlaka belirtin.",
      "Satıcının unvanını faturadaki gibi yazın; adresini biliyorsanız ekleyin.",
    ],
    ornek: {
      konu: "Ayıplı ürünün bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı taraftan [ürün adı] satın aldım ve [tutar] TL ödedim.",
        "Ürünü kullanmaya başladıktan kısa süre sonra [sorunun kısa anlatımı] sorunu ortaya çıktı.",
        "Durumu [tarih] tarihinde karşı tarafa bildirdim; ancak talebim bugüne kadar karşılanmadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m8", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Tüketici hakem heyeti başvurusu ücretli mi?",
        c: "Hayır. Hakem heyetine başvuru ücretsizdir; e-Devlet üzerinden ya da il ticaret müdürlüğüne, kaymakamlığa elden yapılabilir.",
      },
      {
        s: "Hakem heyetine hangi tutara kadar başvurulur?",
        c: "2026 yılında değeri 186.000 TL'nin altındaki uyuşmazlıklar için hakem heyetine başvurulur. Bu tutar her yıl yeniden belirlenir.",
      },
      {
        s: "Dilekçeyi kendim yazabilir miyim?",
        c: "Evet. Dilekçede kimlik ve iletişim bilgileriniz, satıcının bilgileri, olayın anlatımı, talebiniz ve eklediğiniz belgeler bulunmalıdır. Dilekto bu bilgileri sırayla sorup dilekçeyi düzenli bir biçimde hazırlamanıza yardım eder.",
      },
    ],
    ilgili: ["ayipli-mal-iade-dilekcesi", "bozuk-telefon-iade-dilekcesi", "internetten-alinan-urun-iade-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "ayipli-mal-iade-dilekcesi",
    konu: "ayipli_mal",
    kisaAd: "Ayıplı mal iade dilekçesi",
    baslik: "Ayıplı Mal İade Dilekçesi: Haklarınız ve Örnek Dilekçe",
    aciklama:
      "Ayıplı mal nedir, hangi hakları kullanabilirsiniz? İade, değişim, onarım ve indirim talepleri için hakem heyetine ayıplı mal dilekçesi örneği.",
    h1: "Ayıplı mal iade dilekçesi",
    giris: [
      "Satın aldığınız ürün söylenen özellikleri taşımıyorsa, olması gerektiği gibi çalışmıyorsa ya da kullanım amacını karşılamıyorsa kanunda buna \"ayıplı mal\" denir.",
      "Ayıplı mal aldıysanız ve satıcı talebinizi karşılamıyorsa, tüketici hakem heyetine başvurarak hakkınızı arayabilirsiniz.",
    ],
    durumlar: [
      "Kısa sürede bozulan ya da hiç çalışmayan ürünler",
      "Ambalajında, ilanında ya da reklamında yazan özellikleri taşımayan ürünler",
      "Eksik parçalı, yanlış ölçülü ya da hasarlı teslim edilen ürünler",
      "Satıcının yaptığı montajın hatalı olması",
    ],
    haklar: [
      {
        mevzuat: "6502-m8",
        metin:
          "Ambalajında, etiketinde, kullanma kılavuzunda, internet sitesinde ya da reklamında yazan özelliklerden birini taşımayan ürün de ayıplı sayılır.",
      },
      {
        mevzuat: "6502-m11",
        metin:
          "Dört hakkınız vardır: ürünü geri verip parayı geri almak, ürünü tutup indirim istemek, ücretsiz onarım istemek ya da ürünün sağlam bir yenisiyle değiştirilmesini istemek. Hangisini kullanacağınızı siz seçersiniz.",
      },
      {
        mevzuat: "6502-m10",
        metin:
          "Teslimden sonraki 6 ay içinde ortaya çıkan ayıpların teslim anında var olduğu kabul edilir; ürünün ayıplı olmadığını ispat etmek satıcıya düşer.",
      },
    ],
    sureler: [
      "Ücretsiz onarım ya da değişim istediyseniz, talebiniz en geç 30 iş günü içinde yerine getirilmelidir. Bazı ürünler için yönetmelikte ayrıca en uzun tamir süreleri belirlenmiştir.",
      "İade ya da indirim istediyseniz para derhâl ödenmelidir.",
      "Satıcının sorumluluğu, kanunda ya da sözleşmede daha uzun bir süre yoksa teslimden itibaren 2 yıldır; ayıp hile ile gizlendiyse bu süre uygulanmaz.",
    ],
    belgeler: [
      "Fatura ya da satış fişi",
      "Garanti belgesi (varsa)",
      "Servis fişi ya da teknik rapor",
      "Ayıbı gösteren fotoğraf veya video",
      "Satıcıya yaptığınız bildirimin kaydı",
    ],
    ipuclari: [
      "Sorunu fark eder etmez satıcıya yazılı olarak bildirin (e-posta, mesaj ya da şikâyet kaydı).",
      "Ürünü servise verdiyseniz size verilen fişi saklayın; giriş ve çıkış tarihleri önemlidir.",
      "Talebinizi net seçin: \"İade istiyorum\" ya da \"değişim istiyorum\" gibi.",
    ],
    ornek: {
      konu: "Ayıplı malın yenisiyle değiştirilmesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı taraftan [ürün adı] satın aldım ve [tutar] TL ödedim.",
        "Ürün, ilanında belirtilen [özellik] özelliğini taşımamaktadır / [tarih] tarihinde [arıza] arızası vermiştir.",
        "Durumu [tarih] tarihinde karşı tarafa bildirerek ürünün sağlam bir yenisiyle değiştirilmesini talep ettim; talebim karşılanmadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ürünün ayıpsız bir misli ile değiştirilmesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m8", "6502-m10", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Ayıplı ürün için iade mi, değişim mi istemeliyim?",
        c: "Seçim size aittir. Ürüne güveniniz kalmadıysa iade, ürünü kullanmaya devam etmek istiyorsanız değişim ya da onarım isteyebilirsiniz. Onarım ya da değişim satıcı için orantısız güçlük doğuruyorsa iade ya da indirim seçeneği kalır.",
      },
      {
        s: "Ürünü kullandım, yine de iade edebilir miyim?",
        c: "Ayıp, normal kullanım dışında bir nedenle ortaya çıkmadıysa kullanmış olmanız hakkınızı ortadan kaldırmaz. Ayıbın teslimden sonraki 6 ay içinde ortaya çıkması durumunda ispat yükü satıcıdadır.",
      },
      {
        s: "Ayıplı ürünü fark ettiğimde ne yapmalıyım?",
        c: "Önce satıcıya yazılı olarak bildirin ve talebinizi belirtin. Çözüm olmazsa belgelerinizle birlikte hakem heyetine başvurun.",
      },
    ],
    ilgili: ["bozuk-telefon-iade-dilekcesi", "beyaz-esya-ariza-dilekcesi", "ayakkabi-iade-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "bozuk-telefon-iade-dilekcesi",
    konu: "ayipli_mal",
    kisaAd: "Bozuk telefon iade dilekçesi",
    baslik: "Bozuk Telefon İade Dilekçesi: Hakem Heyetine Başvuru (2026)",
    aciklama:
      "Telefonunuz kısa sürede bozuldu, servis \"kullanıcı hatası\" mı dedi? Bozuk telefon için iade, değişim veya onarım dilekçesi ve gerekli belgeler.",
    h1: "Bozuk telefon iade dilekçesi",
    giris: [
      "Yeni aldığınız telefon ekran, şarj, batarya ya da yazılım sorunu çıkarıyorsa ve satıcı ya da servis sorununuzu çözmüyorsa, tüketici hakem heyetine başvurabilirsiniz.",
      "Servisin \"sıvı teması\" ya da \"kullanıcı hatası\" gibi gerekçelerle ücretsiz onarımı reddetmesi sık karşılaşılan bir durumdur. Böyle bir durumda servis raporunu saklamanız ve olayı dilekçenizde açıkça anlatmanız önemlidir.",
    ],
    durumlar: [
      "Ekranın kendiliğinden kapanması, donması ya da kararması",
      "Şarj olmaması, bataryanın çabuk bitmesi ya da şişmesi",
      "Kamera, hoparlör ya da mikrofonun çalışmaması",
      "Servisin ücretsiz onarımı \"kullanıcı hatası\" diyerek reddetmesi",
      "Aynı arızanın onarımdan sonra tekrar etmesi",
    ],
    haklar: [
      {
        mevzuat: "6502-m11",
        metin:
          "Telefon ayıplıysa bedel iadesi, yenisiyle değişim, ücretsiz onarım ya da indirimden birini seçebilirsiniz. Ücretsiz onarım ve değişim talebini üreticiye ya da ithalatçıya karşı da kullanabilirsiniz.",
      },
      {
        mevzuat: "6502-m10",
        metin:
          "Arıza teslimden sonraki 6 ay içinde çıktıysa, telefonun teslimde de ayıplı olduğu kabul edilir; aksini ispat etmek satıcıya düşer.",
      },
    ],
    sureler: [
      "Ücretsiz onarım talebi, kanunda belirtilen ve yönetmelikte bazı ürünler için ayrıca düzenlenen en uzun tamir süreleri içinde yerine getirilmelidir; süre aşılırsa diğer haklarınızı kullanabilirsiniz.",
      "Telefon, satın aldığınız tarihten itibaren 2 yıl içindeyse satıcının sorumluluğu devam eder.",
    ],
    belgeler: [
      "Fatura (internetten aldıysanız e-Arşiv fatura)",
      "Garanti belgesi (varsa)",
      "Servis giriş fişi ve servis raporu",
      "Arızayı gösteren fotoğraf ya da video",
      "Satıcı ya da servisle yazışmalar",
    ],
    ipuclari: [
      "Telefonu servise verirken arızayı servis fişine ayrıntılı yazdırın ve fişin fotoğrafını çekin.",
      "Servis \"sıvı teması\" ya da \"darbe\" gibi bir gerekçe yazdıysa, raporun bir kopyasını isteyin ve katılmadığınızı yazılı olarak bildirin.",
      "Aynı arıza tekrar ettiyse her servis kaydını saklayın; tekrar eden arıza dilekçenizi güçlendirir.",
    ],
    ornek: {
      konu: "Ayıplı cep telefonunun bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı taraftan [marka ve model] cep telefonu satın aldım ve [tutar] TL ödedim.",
        "Telefonun ekranı [süre] sonra kendiliğinden kapanmaya başladı. [Tarih] tarihinde telefonu servise teslim ettim.",
        "Servis, [tarih] tarihli raporunda [servisin gerekçesi] diyerek ücretsiz onarımı reddetti. Telefon kullanım hatasına uğramamıştır.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile telefonun iadesi karşılığında ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m8", "6502-m10", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Servis \"sıvı teması var\" dedi, ne yapabilirim?",
        c: "Servis raporunun bir kopyasını alın ve katılmadığınızı yazılı olarak bildirin. Hakem heyetine başvurduğunuzda raporu da belgeleriniz arasında ekleyin; heyet kararını belgeleri ve gerekirse ürünü inceleyerek verir.",
      },
      {
        s: "Telefonu internetten aldım, nereye başvururum?",
        c: "Oturduğunuz yerdeki ya da alışverişin yapıldığı yerdeki hakem heyetine başvurabilirsiniz. e-Devlet'te başvuru yaparken bu seçimi siz yaparsınız.",
      },
      {
        s: "Telefonu yenisiyle değiştirmelerini isteyebilir miyim?",
        c: "Evet, imkân varsa ayıpsız bir misli ile değişim isteyebilirsiniz. Dilekçenizde talebinizi \"değişim\" olarak açıkça belirtin.",
      },
    ],
    ilgili: ["bilgisayar-ariza-iade-dilekcesi", "ayipli-mal-iade-dilekcesi", "servis-tamir-sikayet-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "ayakkabi-iade-dilekcesi",
    konu: "ayipli_mal",
    kisaAd: "Ayakkabı iade dilekçesi",
    baslik: "Ayakkabı İade Dilekçesi: Tabanı Açılan, Yırtılan Ayakkabı",
    aciklama:
      "Ayakkabınızın tabanı kısa sürede açıldı ya da yırtıldı mı? Mağaza iadeyi kabul etmiyorsa hakem heyeti için ayakkabı iade dilekçesi örneği.",
    h1: "Ayakkabı iade dilekçesi",
    giris: [
      "Kısa süre giydiğiniz ayakkabının tabanı ayrıldıysa, dikişi söküldüyse ya da derisi çatladıysa bu durum ayıplı mal kapsamında değerlendirilebilir.",
      "Mağaza \"kullanımdan kaynaklanıyor\" diyerek iadeyi ya da değişimi kabul etmiyorsa, hakem heyetine başvurabilirsiniz.",
    ],
    durumlar: [
      "Tabanın ayrılması ya da su alması",
      "Dikişlerin sökülmesi, derinin çatlaması ya da boyanın akması",
      "\"Su geçirmez\" diye satılan ayakkabının su alması",
      "Mağazanın ayakkabıyı incelemeye gönderip olumsuz dönmesi",
    ],
    haklar: [
      {
        mevzuat: "6502-m8",
        metin:
          "Etiketinde ya da ilanında yazan özelliği (ör. su geçirmezlik, hakiki deri) taşımayan ya da tüketicinin makul olarak beklediği faydayı sağlamayan ürün ayıplıdır.",
      },
      {
        mevzuat: "6502-m11",
        metin: "İade, değişim, ücretsiz onarım ya da indirim haklarından birini seçebilirsiniz.",
      },
      {
        mevzuat: "6502-m10",
        metin: "Ayıp ilk 6 ay içinde ortaya çıktıysa, ayakkabının teslimde de ayıplı olduğu kabul edilir.",
      },
    ],
    sureler: [
      "Satıcının sorumluluğu teslimden itibaren 2 yıldır.",
      "Onarım ya da değişim istediyseniz talebiniz en geç 30 iş günü içinde karşılanmalıdır.",
    ],
    belgeler: [
      "Fatura ya da fiş",
      "Ayıbı gösteren net fotoğraflar (taban, dikiş, etiket)",
      "Mağazanın verdiği inceleme / tamir formu",
      "Ürünün etiketi ya da ilan ekran görüntüsü (su geçirmezlik gibi özellikler için)",
    ],
    ipuclari: [
      "Ayakkabıyı mağazaya teslim ederseniz mutlaka teslim belgesi alın.",
      "Ayıbın göründüğü yerleri yakından ve gün ışığında fotoğraflayın.",
      "Ayakkabıyı ne sıklıkla ve nasıl kullandığınızı dilekçede dürüstçe anlatın.",
    ],
    ornek: {
      konu: "Ayıplı ayakkabının bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı tarafın [mağaza adı] mağazasından [marka ve model] ayakkabı satın aldım ve [tutar] TL ödedim.",
        "Ayakkabıyı normal günlük kullanımda [süre] giydikten sonra tabanı ayrıldı.",
        "Ayakkabıyı [tarih] tarihinde mağazaya götürdüm; mağaza sorunun kullanımdan kaynaklandığını belirterek iade ve değişim talebimi reddetti.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m8", "6502-m10", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Mağaza \"kullanım hatası\" diyorsa ne olur?",
        c: "Hakem heyeti, belgeleri ve gerekirse ürünü inceleyerek karar verir. İlk 6 ay içinde ortaya çıkan ayıplarda ayıbın olmadığını ispat etmek satıcıya düşer.",
      },
      {
        s: "İndirimli aldığım ayakkabı için de başvurabilir miyim?",
        c: "Evet. İndirimli satılan ürünlerde de ayıptan doğan haklarınız geçerlidir; yalnızca satın alırken size bildirilmiş ayıplar için talepte bulunamazsınız.",
      },
      {
        s: "Ayakkabıyı internetten aldım ve sadece beğenmedim, ne yapmalıyım?",
        c: "Ayakkabı ayıplı değilse ve internetten aldıysanız, teslimden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz.",
      },
    ],
    ilgili: ["internetten-alinan-urun-iade-dilekcesi", "ayipli-mal-iade-dilekcesi", "kargo-hasari-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "kargo-hasari-dilekcesi",
    konu: "kargo_hasar",
    alisSekli: "internet",
    kisaAd: "Kargo hasarı dilekçesi",
    baslik: "Kargo Hasarı Dilekçesi: Hasarlı Gelen Ürün İçin Başvuru",
    aciklama:
      "Ürün kargodan kırık, ezik ya da eksik mi geldi? Satıcı ile kargo firması sorumluluğu birbirine atıyorsa hakem heyeti için kargo hasarı dilekçesi.",
    h1: "Kargo hasarı dilekçesi",
    giris: [
      "İnternetten aldığınız ürün kırık, ezik, ıslak ya da eksik geldiyse, satıcı ürünü size sözleşmeye uygun şekilde teslim etmekle yükümlüdür.",
      "Satıcı \"kargo firmasıyla görüşün\" diyerek sizi yönlendiriyorsa bile muhatabınız satıcıdır. Sorun çözülmezse hakem heyetine başvurabilirsiniz.",
    ],
    durumlar: [
      "Kırık, çizik ya da ezik gelen ürünler",
      "Kutusundan eksik parça ya da farklı ürün çıkması",
      "Islanmış ya da hasar görmüş paket",
      "Satıcı ile kargo firmasının sorumluluğu birbirine atması",
    ],
    haklar: [
      {
        mevzuat: "6502-m9",
        metin: "Satıcı, ürünü satış sözleşmesine uygun olarak, yani sağlam ve eksiksiz teslim etmekle yükümlüdür.",
      },
      {
        mevzuat: "6502-m11",
        metin: "Hasarlı gelen ürün için iade, sağlam bir yenisiyle değişim, onarım ya da indirim isteyebilirsiniz.",
      },
    ],
    sureler: [
      "Hasarı fark ettiğiniz anda, mümkünse kargo görevlisi yanındayken tespit ettirin ve satıcıya hemen bildirin.",
      "Değişim istediyseniz talebiniz en geç 30 iş günü içinde karşılanmalıdır.",
    ],
    belgeler: [
      "Sipariş özeti ve fatura",
      "Kargo teslim belgesi ya da hasar tespit tutanağı (tutulduysa)",
      "Paketin ve ürünün açılış anını gösteren fotoğraf veya video",
      "Satıcıyla ve kargo firmasıyla yazışmalar",
    ],
    ipuclari: [
      "Paket dışarıdan hasarlı görünüyorsa kargo görevlisinden hasar tespit tutanağı tutmasını isteyin.",
      "Paketi açarken video çekin; bu kayıt en güçlü kanıtlardan biridir.",
      "Satıcıya hasarı fotoğraflarla birlikte, sipariş numaranızı yazarak yazılı bildirin.",
    ],
    ornek: {
      konu: "Hasarlı teslim edilen ürünün sağlam bir misli ile değiştirilmesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı tarafın [site adı] internet sitesinden [ürün adı] siparişi verdim ve [tutar] TL ödedim. Sipariş numaram [sipariş no]'dur.",
        "Ürün [tarih] tarihinde [hasarın kısa anlatımı] şekilde, hasarlı olarak teslim edildi. Hasarı fotoğraflarla belgeledim.",
        "Durumu aynı gün karşı tarafa bildirdim; karşı taraf beni kargo firmasına yönlendirdi ve talebimi karşılamadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ürünün sağlam bir misli ile değiştirilmesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m9", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Kargo hasarından satıcı mı, kargo firması mı sorumlu?",
        c: "Tüketici olarak muhatabınız satıcıdır; satıcı ürünü size sağlam teslim etmekle yükümlüdür. Satıcı daha sonra kargo firmasına başvurabilir.",
      },
      {
        s: "Hasar tespit tutanağı tutturmadım, yine de başvurabilir miyim?",
        c: "Evet. Paketin ve ürünün fotoğrafları, açılış videosu ve satıcıya yaptığınız bildirim de kanıt olarak kullanılabilir.",
      },
      {
        s: "Hasarlı ürünü geri göndermeli miyim?",
        c: "Satıcıyla anlaşarak gönderebilirsiniz. Göndermeden önce ürünün fotoğraflarını çekin ve gönderi belgesini saklayın.",
      },
    ],
    ilgili: ["gelmeyen-siparis-sikayet-dilekcesi", "internetten-alinan-urun-iade-dilekcesi", "ayipli-mal-iade-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "beyaz-esya-ariza-dilekcesi",
    konu: "ayipli_mal",
    kisaAd: "Beyaz eşya arıza dilekçesi",
    baslik: "Beyaz Eşya Arıza Dilekçesi: Buzdolabı, Çamaşır Makinesi",
    aciklama:
      "Buzdolabı, çamaşır ya da bulaşık makineniz sürekli arıza mı yapıyor, tamir uzadı mı? Beyaz eşya için iade veya değişim dilekçesi rehberi.",
    h1: "Beyaz eşya arıza dilekçesi",
    giris: [
      "Buzdolabı, çamaşır makinesi, bulaşık makinesi ya da fırın gibi beyaz eşyalarda arıza sık tekrar ediyorsa ya da tamir çok uzun sürüyorsa, onarım yerine değişim ya da iade isteyebilirsiniz.",
      "Servis kayıtlarınız, tamirin ne kadar sürdüğünü ve arızanın kaç kez tekrar ettiğini gösterdiği için başvurunuzun temelini oluşturur.",
    ],
    durumlar: [
      "Buzdolabının soğutmaması ya da aşırı buzlanması",
      "Çamaşır ya da bulaşık makinesinin su boşaltmaması, sızdırması",
      "Aynı arızanın onarımdan sonra tekrar etmesi",
      "Tamirin uzun sürmesi ya da parça bulunamaması",
    ],
    haklar: [
      {
        mevzuat: "6502-m11",
        metin:
          "Ücretsiz onarım talebiniz belirlenen süre içinde yerine getirilmezse diğer haklarınızı (değişim, iade, indirim) kullanmakta serbestsiniz. Onarım ve değişim talebini üreticiye ya da ithalatçıya karşı da kullanabilirsiniz.",
      },
      {
        mevzuat: "6502-m8",
        metin: "Kullanım amacını karşılamayan ya da beklenen faydayı sağlamayan ürün ayıplıdır.",
      },
    ],
    sureler: [
      "Ücretsiz onarım talebi en geç 30 iş günü içinde yerine getirilmelidir; beyaz eşya gibi bazı ürünler için yönetmelikte ayrıca en uzun tamir süreleri belirlenmiştir.",
      "Kanunda ya da sözleşmede daha uzun bir süre yoksa satıcının sorumluluğu teslimden itibaren 2 yıldır.",
    ],
    belgeler: [
      "Fatura",
      "Garanti belgesi",
      "Her servis ziyaretinin kaydı (servis fişi, iş emri)",
      "Arızayı gösteren fotoğraf ya da video",
      "Çağrı merkezi şikâyet numaraları",
    ],
    ipuclari: [
      "Her servis çağrısında kayıt numarası alın ve not edin.",
      "Servis fişine yapılan işlemi ve değiştirilen parçayı yazdırın.",
      "Arıza tekrar ettiyse dilekçenizde her arızanın tarihini sırayla yazın.",
    ],
    ornek: {
      konu: "Sürekli arıza yapan buzdolabının yenisiyle değiştirilmesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı taraftan [marka ve model] buzdolabı satın aldım ve [tutar] TL ödedim.",
        "Buzdolabı [tarih] tarihinde soğutmayı bıraktı. Yetkili servis [tarih] ve [tarih] tarihlerinde onarım yaptı; ancak arıza tekrar etti.",
        "[Tarih] tarihinde karşı tarafa yazılı olarak başvurarak ürünün değiştirilmesini talep ettim; talebim karşılanmadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile buzdolabının ayıpsız bir misli ile değiştirilmesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m8", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Tamir 30 iş gününü geçti, ne yapabilirim?",
        c: "Onarım belirlenen süre içinde yapılmazsa değişim, iade ya da indirim haklarınızı kullanabilirsiniz. Bunu satıcıya yazılı bildirin; çözüm olmazsa hakem heyetine başvurun.",
      },
      {
        s: "Ürünün garanti süresi bitti, yine başvurabilir miyim?",
        c: "Satıcının ayıptan sorumluluğu teslimden itibaren 2 yıldır. Bu süre geçtiyse ayıbın hile ile gizlendiği durumlar dışında talepte bulunmak zorlaşır.",
      },
      {
        s: "Başvuruyu satıcıya mı, üreticiye mi yapmalıyım?",
        c: "Dilekçede satıcıyı karşı taraf olarak gösterebilirsiniz. Onarım ve değişim taleplerinde satıcı, üretici ve ithalatçı birlikte sorumludur.",
      },
    ],
    ilgili: ["ayipli-mal-iade-dilekcesi", "servis-tamir-sikayet-dilekcesi", "bilgisayar-ariza-iade-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "bilgisayar-ariza-iade-dilekcesi",
    konu: "ayipli_mal",
    kisaAd: "Bilgisayar arıza iade dilekçesi",
    baslik: "Bilgisayar ve Tablet Arıza İade Dilekçesi (Hakem Heyeti)",
    aciklama:
      "Dizüstü bilgisayar ya da tabletiniz kısa sürede arıza mı yaptı? Ekran, şarj, klavye arızaları için iade veya değişim dilekçesi rehberi.",
    h1: "Bilgisayar ve tablet arıza iade dilekçesi",
    giris: [
      "Dizüstü bilgisayar, masaüstü bilgisayar ya da tabletinizde ekran, klavye, şarj ya da ısınma sorunları kısa sürede ortaya çıktıysa ayıplı mal hükümleri uygulanır.",
      "Bilgisayarı servise vermeden önce kişisel dosyalarınızı yedekleyin ve servis fişine cihazın durumunu ayrıntılı yazdırın.",
    ],
    durumlar: [
      "Ekranda çizgi, ölü piksel ya da görüntü kaybı",
      "Bilgisayarın açılmaması, kendiliğinden kapanması ya da aşırı ısınması",
      "Klavye, dokunmatik yüzey ya da şarj girişinin çalışmaması",
      "İlanda yazan donanım özelliklerinin (bellek, depolama) farklı çıkması",
    ],
    haklar: [
      {
        mevzuat: "6502-m8",
        metin:
          "İlanda ya da kutusunda yazan teknik özellikleri taşımayan ya da düzgün çalışmayan cihaz ayıplıdır.",
      },
      {
        mevzuat: "6502-m11",
        metin: "İade, değişim, ücretsiz onarım ya da indirim haklarından birini seçebilirsiniz.",
      },
      {
        mevzuat: "6502-m10",
        metin: "Arıza teslimden sonraki 6 ay içinde çıktıysa ayıbın teslimde var olduğu kabul edilir.",
      },
    ],
    sureler: [
      "Ücretsiz onarım ya da değişim talebi en geç 30 iş günü içinde karşılanmalıdır; bazı ürünler için yönetmelikte ayrıca en uzun tamir süreleri vardır.",
      "Satıcının sorumluluğu teslimden itibaren 2 yıldır.",
    ],
    belgeler: [
      "Fatura",
      "Garanti belgesi (varsa)",
      "Servis fişi ve servis raporu",
      "Arızayı gösteren fotoğraf ya da video",
      "İlan ya da ürün sayfasının ekran görüntüsü (özellik farkı varsa)",
    ],
    ipuclari: [
      "Servise vermeden önce verilerinizi yedekleyin.",
      "Cihazın kozmetik durumunu (çizik, ezik) servise teslim ederken fotoğraflayın.",
      "Özellik farkı varsa ilanın ekran görüntüsünü tarihli olarak saklayın.",
    ],
    ornek: {
      konu: "Ayıplı dizüstü bilgisayarın bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı taraftan [marka ve model] dizüstü bilgisayar satın aldım ve [tutar] TL ödedim.",
        "Bilgisayarın ekranında [süre] sonra [arıza] sorunu ortaya çıktı. [Tarih] tarihinde cihazı yetkili servise teslim ettim.",
        "Servisten döndükten sonra aynı arıza tekrar etti. Durumu [tarih] tarihinde karşı tarafa bildirdim; talebim karşılanmadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile cihazın iadesi karşılığında ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m8", "6502-m10", "6502-m11", "6502-m68"],
    },
    sss: [
      {
        s: "Servis verilerimi silerse ne olur?",
        c: "Servise vermeden önce verilerinizi yedeklemeniz en güvenli yoldur. Verilerinizle ilgili özel bir talebiniz varsa servis fişine yazdırın.",
      },
      {
        s: "İlanda yazan özellik ile cihaz farklı, bu ayıp sayılır mı?",
        c: "Evet. İlanda ya da reklamda belirtilen özellikleri taşımayan ürün kanuna göre ayıplı sayılır.",
      },
      {
        s: "Tablet ve oyun konsolu için de aynı yol mu geçerli?",
        c: "Evet. Kişisel kullanım için aldığınız tüm elektronik cihazlarda aynı haklar ve aynı başvuru yolu geçerlidir.",
      },
    ],
    ilgili: ["bozuk-telefon-iade-dilekcesi", "beyaz-esya-ariza-dilekcesi", "servis-tamir-sikayet-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "internetten-alinan-urun-iade-dilekcesi",
    konu: "cayma",
    alisSekli: "internet",
    kisaAd: "İnternetten alınan ürün iade dilekçesi",
    baslik: "İnternetten Alınan Ürün İade Dilekçesi: 14 Gün Cayma Hakkı",
    aciklama:
      "İnternetten aldığınız ürünü 14 gün içinde iade etmek istediniz ama kabul edilmedi mi? Cayma hakkı ve iade parası için hakem heyeti dilekçesi.",
    h1: "İnternetten alınan ürün iade dilekçesi (cayma hakkı)",
    giris: [
      "İnternetten, telefonla ya da uygulama üzerinden yaptığınız alışverişlerde, ürünü teslim aldığınız günden itibaren 14 gün içinde hiçbir gerekçe göstermeden sözleşmeden cayabilirsiniz.",
      "Satıcı iadenizi kabul etmiyorsa ya da ürünü geri aldığı hâlde paranızı iade etmiyorsa hakem heyetine başvurabilirsiniz.",
    ],
    durumlar: [
      "14 gün içinde yapılan iade talebinin reddedilmesi",
      "İade edilen ürünün parasının ödenmemesi ya da geciktirilmesi",
      "Satıcının iade için gerekçe istemesi ya da ceza kesmesi",
    ],
    haklar: [
      {
        mevzuat: "6502-m48-4",
        metin:
          "14 gün içinde gerekçe göstermeden ve ceza ödemeden cayabilirsiniz. Bildirimin bu süre içinde satıcıya ulaşması yeterlidir. Cayma hakkı konusunda gerektiği gibi bilgilendirilmediyseniz 14 günlük süreyle bağlı değilsiniz.",
      },
    ],
    sureler: [
      "Cayma süresi, malın size teslim edildiği gün başlar ve 14 gündür.",
      "Bazı ürünlerde (örneğin size özel hazırlanan ürünlerde) cayma hakkı bulunmayabilir; bu istisnalar Mesafeli Sözleşmeler Yönetmeliği'nde sayılmıştır.",
    ],
    belgeler: [
      "Sipariş özeti ve fatura",
      "Cayma bildiriminizin kaydı (e-posta, site üzerinden iade talebi ekran görüntüsü)",
      "İade gönderi fişi ve kargo takip numarası",
      "Satıcıyla yazışmalar",
    ],
    ipuclari: [
      "Cayma bildiriminizi yazılı yapın ve ekran görüntüsünü alın; tarih önemlidir.",
      "Ürünü geri gönderirken kargo fişini saklayın.",
      "Ürünü normal inceleme ölçüsünde kullanın; mutat kullanımdan doğan değişikliklerden sorumlu değilsiniz.",
    ],
    ornek: {
      konu: "Cayma hakkı kullanılan ürünün bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı tarafın [site adı] internet sitesinden [ürün adı] satın aldım ve [tutar] TL ödedim. Ürün [tarih] tarihinde tarafıma teslim edildi.",
        "Teslimden sonraki 14 gün içinde, [tarih] tarihinde karşı tarafa cayma bildiriminde bulundum ve ürünü [tarih] tarihinde [kargo firması] ile geri gönderdim.",
        "Karşı taraf, ürünü teslim aldığı hâlde ödediğim bedeli bugüne kadar iade etmedi.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m48-4", "6502-m68"],
    },
    sss: [
      {
        s: "Cayma hakkı için gerekçe göstermem gerekir mi?",
        c: "Hayır. Kanuna göre 14 gün içinde hiçbir gerekçe göstermeden cayabilirsiniz.",
      },
      {
        s: "14 gün ne zaman başlar?",
        c: "Mal satın alımlarında 14 gün, ürünü sizin ya da belirlediğiniz kişinin teslim aldığı gün başlar.",
      },
      {
        s: "Ürünü denedim, yine de iade edebilir miyim?",
        c: "Ürünü normal inceleme ölçüsünde denemeniz hakkınızı ortadan kaldırmaz. Kanuna göre olağan kullanımdan doğan değişikliklerden sorumlu değilsiniz.",
      },
    ],
    ilgili: ["gelmeyen-siparis-sikayet-dilekcesi", "kargo-hasari-dilekcesi", "ayakkabi-iade-dilekcesi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "gelmeyen-siparis-sikayet-dilekcesi",
    konu: "teslimat",
    alisSekli: "internet",
    kisaAd: "Gelmeyen sipariş şikâyet dilekçesi",
    baslik: "Gelmeyen Sipariş Şikâyet Dilekçesi: 30 Gün Kuralı ve İade",
    aciklama:
      "Parasını ödediğiniz internet siparişi gelmedi mi? 30 günlük teslim süresi, sözleşmeyi feshetme hakkı ve hakem heyeti için şikâyet dilekçesi.",
    h1: "Gelmeyen sipariş şikâyet dilekçesi",
    giris: [
      "İnternetten verdiğiniz sipariş söz verilen sürede gelmediyse, satıcı ürünü en geç 30 gün içinde teslim etmek zorundadır (size özel hazırlanan ürünler hariç).",
      "Süre dolduğu hâlde ürün gelmediyse sözleşmeyi feshedip paranızı geri isteyebilirsiniz.",
    ],
    durumlar: [
      "Parası ödenmiş ama hiç gelmeyen sipariş",
      "Sürekli ertelenen teslim tarihi",
      "\"Teslim edildi\" görünen ama elinize ulaşmayan sipariş",
      "Siparişin tek taraflı iptal edilip paranın iade edilmemesi",
    ],
    haklar: [
      {
        mevzuat: "6502-m48-3",
        metin:
          "Satıcı, söz verdiği sürede ve her hâlükârda en geç 30 gün içinde ürünü teslim etmelidir. Teslim etmezse sözleşmeyi feshedebilirsiniz.",
      },
    ],
    sureler: [
      "30 günlük süre, siparişinizin satıcıya ulaştığı andan itibaren başlar.",
      "Size özel hazırlanan ürünlerde bu 30 günlük üst sınır uygulanmaz; söz verilen süre esas alınır.",
    ],
    belgeler: [
      "Sipariş özeti (sipariş tarihi ve numarası görünür şekilde)",
      "Ödeme dekontu ya da kart ekstresi",
      "Kargo takip ekranının görüntüsü",
      "Satıcıyla yazışmalar ve şikâyet kayıtları",
    ],
    ipuclari: [
      "Satıcıya yazılı olarak teslim için son bir süre verin ya da sözleşmeyi feshettiğinizi bildirin.",
      "\"Teslim edildi\" görünüyorsa ama ürün size ulaşmadıysa kargo firmasından teslim imzasını isteyin.",
      "Ödeme kartla yapıldıysa bankanıza da itiraz başvurusu yapabilirsiniz.",
    ],
    ornek: {
      konu: "Teslim edilmeyen siparişin bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı tarafın [site adı] internet sitesinden [ürün adı] siparişi verdim ve [tutar] TL ödedim. Sipariş numaram [sipariş no]'dur.",
        "Karşı taraf ürünü [söz verilen tarih] tarihine kadar teslim edeceğini bildirdi; ancak aradan 30 günden fazla geçmesine rağmen ürün teslim edilmedi.",
        "[Tarih] tarihinde karşı tarafa yazılı olarak sözleşmeyi feshettiğimi bildirerek paramın iadesini talep ettim; talebim karşılanmadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m48-3", "6502-m68"],
    },
    sss: [
      {
        s: "Sipariş ne kadar sürede gelmezse başvurabilirim?",
        c: "Satıcı söz verdiği sürede, her hâlükârda en geç 30 gün içinde teslim etmelidir. Bu süre geçtiyse sözleşmeyi feshedip paranızı isteyebilirsiniz.",
      },
      {
        s: "Pazaryerinden aldım, kime karşı başvurmalıyım?",
        c: "Dilekçede satıcı firmayı karşı taraf olarak gösterin. Faturada yazan satıcı unvanını kullanmanız en doğrusudur.",
      },
      {
        s: "Kargo \"teslim edildi\" diyor ama ürün gelmedi, ne yapmalıyım?",
        c: "Satıcıya ve kargo firmasına yazılı bildirimde bulunun, teslim imzasının kime ait olduğunu sorun. Sorun çözülmezse belgelerinizle hakem heyetine başvurun.",
      },
    ],
    ilgili: ["internetten-alinan-urun-iade-dilekcesi", "kargo-hasari-dilekcesi", "tuketici-hakem-heyeti-dilekce-ornegi"],
  },

  // -------------------------------------------------------------------------
  {
    slug: "servis-tamir-sikayet-dilekcesi",
    konu: "ayipli_hizmet",
    kisaAd: "Servis ve tamir şikâyet dilekçesi",
    baslik: "Servis ve Tamir Şikâyet Dilekçesi: Kötü Yapılan Hizmet",
    aciklama:
      "Tamir, montaj, tadilat ya da teknik servis işi kötü mü yapıldı? Ayıplı hizmet için ücret iadesi veya yeniden yapılma talebiyle dilekçe rehberi.",
    h1: "Servis ve tamir şikâyet dilekçesi (ayıplı hizmet)",
    giris: [
      "Ücret ödediğiniz bir tamir, montaj, tadilat, temizlik ya da teknik servis işi söylendiği gibi yapılmadıysa, kanunda buna \"ayıplı hizmet\" denir.",
      "Hizmeti veren firma işi düzeltmiyor ya da ücretinizi iade etmiyorsa hakem heyetine başvurabilirsiniz.",
    ],
    durumlar: [
      "Tamir edilen cihazın kısa sürede aynı arızayı vermesi",
      "Montaj ya da kurulumun hatalı yapılması",
      "Tadilat ya da boya işinin eksik veya kusurlu bırakılması",
      "Hizmetin söz verilen tarihte başlamaması",
    ],
    haklar: [
      {
        mevzuat: "6502-m13",
        metin:
          "Sözleşmede belirlenen sürede başlamayan ya da söz verilen, beklenen özellikleri taşımayan hizmet ayıplıdır.",
      },
      {
        mevzuat: "6502-m15",
        metin:
          "Hizmetin yeniden yapılmasını, ortaya çıkan işin ücretsiz onarımını, indirim ya da ücret iadesini isteyebilirsiniz; masrafları hizmeti veren karşılar.",
      },
    ],
    sureler: [
      "Yeniden yapma ya da onarım talebiniz makul bir sürede, her hâlükârda en geç 30 iş günü içinde karşılanmalıdır.",
      "Hizmet verenin sorumluluğu, hizmetin yapıldığı tarihten itibaren 2 yıldır.",
    ],
    belgeler: [
      "Fatura ya da ödeme belgesi",
      "Teklif, sözleşme ya da iş emri",
      "Kusurlu işi gösteren fotoğraf ya da video",
      "Firmayla yazışmalar",
    ],
    ipuclari: [
      "İşin başlamadan önceki ve sonraki hâlini fotoğraflayın.",
      "Firmaya kusurları yazılı olarak bildirin ve düzeltmesi için makul bir süre verin.",
      "Hizmeti veren kişi bir firma adına ya da meslek olarak çalışıyorsa tüketici işlemi sayılır.",
    ],
    ornek: {
      konu: "Ayıplı ifa edilen hizmetin bedelinin iadesi talebi",
      olaylar: [
        "[Tarih] tarihinde karşı tarafla [hizmetin adı] için anlaştım ve [tutar] TL ödedim.",
        "Hizmet [tarih] tarihinde tamamlandı; ancak [kusurun kısa anlatımı] sorunu ortaya çıktı.",
        "Durumu [tarih] tarihinde karşı tarafa bildirerek kusurun giderilmesini istedim; talebim karşılanmadı.",
      ],
      talep:
        "Yukarıda açıkladığım nedenlerle, uyuşmazlık değeri [tutar] TL olan başvurumun kabulü ile ödediğim bedelin tarafıma iadesine karar verilmesini saygılarımla arz ve talep ederim.",
      mevzuat: ["6502-m13", "6502-m15", "6502-m68"],
    },
    sss: [
      {
        s: "Ustayla yazılı sözleşme yapmadım, başvurabilir miyim?",
        c: "Evet. Ödeme kaydı, mesajlaşmalar ve fotoğraflar da hizmetin varlığını ve kusuru gösterebilir.",
      },
      {
        s: "Hizmetin yeniden yapılmasını mı, para iadesini mi istemeliyim?",
        c: "Seçim size aittir. Firmaya güveniniz kalmadıysa ücret iadesi ya da indirim, işin düzeltilmesini istiyorsanız yeniden yapılmasını talep edebilirsiniz.",
      },
      {
        s: "Tamir edilen cihaz yine bozuldu, kime başvurmalıyım?",
        c: "Tamiri yapan servisin hizmeti ayıplıysa servise karşı başvurabilirsiniz. Cihaz yeni alındıysa ve arıza ürünün kendisinden kaynaklanıyorsa ayıplı mal yolunu da düşünebilirsiniz.",
      },
    ],
    ilgili: ["beyaz-esya-ariza-dilekcesi", "bozuk-telefon-iade-dilekcesi", "tuketici-hakem-heyeti-dilekce-ornegi"],
  },
];

export function rehberGetir(slug: string): Rehber | undefined {
  return REHBERLER.find((r) => r.slug === slug);
}
