// "Dilekçeyi nereye, nasıl vereceksiniz?" rehberi (ödemeden sonra gösterilir).
// Kaynaklar ve güven düzeyleri: docs/DILEKCE-KURALLARI.md
//
// Kural: Adres, çalışma saati ve karar süresi gibi sürekli değişen şeyler için
// söz vermeyiz; kullanıcıyı resmî listeye (ticaret.gov.tr) ve Alo 175'e yönlendiririz.

import type { BasvuruYolu } from "../tipler";

export const RESMI_ADRESLER = {
  ilMudurlukleri: "ticaret.gov.tr/iletisim/il-mudurlukleri",
  basvuruFormu: "ticaret.gov.tr > Tüketici > Tüketici Hakem Heyetleri > Başvuru Formları",
  aloHatti: "Alo 175",
} as const;

export function basvuruYollari(il?: string): BasvuruYolu[] {
  const heyet = il ? `${il} Tüketici Hakem Heyeti` : "bulunduğunuz yerdeki tüketici hakem heyeti";
  const yer = il
    ? `Başvuru yeriniz: ${il} Tüketici Hakem Heyeti (yerleşim yeriniz ${il} ise). Dilerseniz alışverişi yaptığınız yerdeki heyete de başvurabilirsiniz.`
    : "Başvuruyu, oturduğunuz yerdeki ya da alışverişi yaptığınız yerdeki tüketici hakem heyetine yapabilirsiniz.";

  return [
    {
      id: "edevlet",
      baslik: "e-Devlet (en kolay yol)",
      ozet: "Evden, günün her saati yapılır. Belgeleri dosya olarak yüklersiniz. Gitmenize gerek kalmaz.",
      hazirlik: [
        "e-Devlet girişiniz (e-Devlet şifresi, mobil imza, e-imza ya da bankanızla giriş)",
        "Bu dilekçenin PDF dosyası (aşağıdan indirin)",
        "Belgelerinizin fotoğrafı ya da PDF'i: fatura, servis fişi, yazışmalar, fotoğraflar",
        'Dilekçenizdeki "KARŞI TARAF" bilgileri: satıcının unvanı ve adresi',
      ],
      adimlar: [
        "turkiye.gov.tr adresine girin ve oturum açın.",
        'Üstteki arama kutusuna "Tüketici Hakem Heyeti" yazın. Ticaret Bakanlığı\'nın tüketici hakem heyetine başvuru hizmetini (Tüketici Bilgi Sistemi, TÜBİS) açın.',
        `Yeni başvuru başlatın ve başvuru yerini seçin. ${yer}`,
        "Şikâyet ettiğiniz firmanın unvanını ve adresini girin (dilekçenizin KARŞI TARAF bölümündeki gibi).",
        "Uyuşmazlığın konusunu, tutarını (dilekçedeki UYUŞMAZLIK DEĞERİ) ve talebinizi (iade, değişim, onarım ya da indirim) girin.",
        'Açıklama alanına dilekçenizdeki "AÇIKLAMALAR" ve "SONUÇ VE İSTEM" metnini yapıştırın. Aşağıdaki "Metni kopyala" düğmesi bunu sizin için hazırlar.',
        "Belgeler bölümüne dilekçenin PDF'ini ve elinizdeki belgeleri yükleyin. Dosya boyutu ya da biçimi sorun çıkarırsa fotoğrafları tek bir PDF'te birleştirin.",
        "Bilgileri son kez kontrol edip başvuruyu gönderin.",
      ],
      sonra: [
        "Size verilen başvuru numarasını not edin ve onay ekranının görüntüsünü saklayın.",
        "Başvurunuzun durumunu aynı hizmetten takip edebilirsiniz.",
        "Dilekçenin ve yüklediğiniz belgelerin bir kopyasını kendinizde tutun.",
      ],
      notlar: [
        "Elektronik başvurunun geçerli olması için başvuru formunun eksiksiz doldurulması ve belgelerin sisteme yüklenmesi gerekir.",
        'e-Devlet ekranlarının ve düğmelerinin adları zaman zaman değişir; aradığınızı bulamazsanız arama kutusuna "tüketici" yazın.',
      ],
    },
    {
      id: "elden",
      baslik: "Elden (kâğıt dilekçeyle)",
      ozet: "e-Devlet kullanamıyorsanız ya da kâğıt üzerinde vermek istiyorsanız. Resmî çalışma saatlerinde yapılır.",
      hazirlik: [
        "Dilekçeyi A4 beyaz kâğıda, tek yüze çıktı alın; en az 2 nüsha: biri heyete verilecek, biri kayıt işlemi için sizde kalacak",
        'Dilekçedeki "İmza" yerini mavi ya da siyah tükenmez kalemle, kimliğinizdeki imzanızla atın (her nüshayı imzalayın)',
        "Belgelerin fotokopileri: fatura, servis fişi, yazışmalar, fotoğraf baskıları. Asılları sizde kalsın, sorulursa gösterirsiniz",
        "Kimliğiniz ve kimlik fotokopiniz",
        `İsterseniz Bakanlığın hazır başvuru formunu da doldurup dilekçenizle birlikte verebilirsiniz (${RESMI_ADRESLER.basvuruFormu})`,
      ],
      adimlar: [
        `Gideceğiniz yeri belirleyin: ${heyet}. Heyetler illerde Ticaret İl Müdürlüğü, ilçelerde kaymakamlık bünyesinde çalışır. Adresi ${RESMI_ADRESLER.ilMudurlukleri} sayfasından bulabilir ya da ${RESMI_ADRESLER.aloHatti}'ı arayabilirsiniz.`,
        "Bulunduğunuz ilçede tüketici hakem heyeti yoksa ilçe kaymakamlığına başvurabilirsiniz; kaymakamlık başvurunuzu yetkili heyete iletir (6502 sayılı Kanun m. 68/3).",
        "Gitmeden önce telefonla çalışma saatlerini ve evrak kabul biriminin yerini sorun.",
        "Evrak kayıt (gelen evrak) birimine imzalı dilekçenizi ve eklerini verin; istenirse kimliğinizi gösterin.",
        "Size kalacak nüshanın üzerine kayıt tarihini ve numarasını yazdırın ya da kaşe bastırın. Bu nüsha başvurunuzun kanıtıdır.",
      ],
      sonra: [
        "Kayıt tarihli nüshayı ve belge fotokopilerini saklayın.",
        "Başvurunuz heyete havale edilir. Heyetin size ulaşabilmesi için telefon ve adres bilgilerinizin doğru olduğundan emin olun.",
      ],
      notlar: ["Başvuru ücretsizdir.", "Kâğıtların arka yüzünü kullanmayın; dilekçe sığmazsa ikinci sayfaya geçin."],
    },
    {
      id: "posta",
      baslik: "Posta ile (PTT)",
      ozet: "Gitmeniz mümkün değilse. Teslim belgesi sizde kalır; elden ve e-Devlet'ten daha yavaştır.",
      hazirlik: [
        "Elden başvurudaki gibi: imzalı dilekçe, belge fotokopileri ve kimlik fotokopisi",
        `Alıcı: "${il ? `${il} ` : ""}Tüketici Hakem Heyeti Başkanlığı". Açık adresi ${RESMI_ADRESLER.ilMudurlukleri} sayfasından bulun`,
        "Kendi adresiniz ve telefonunuz (gönderici bilgisi olarak)",
      ],
      adimlar: [
        "Evrakları bir zarfa koyun, alıcı adresini ve gönderici bilgilerinizi yazın.",
        "PTT şubesinde gönderiyi teslim belgeli (iadeli taahhütlü) olarak gönderin.",
        "Gönderi makbuzunu ve takip numarasını alın; PTT takip ekranından teslimi izleyin.",
      ],
      sonra: [
        "Makbuzu, teslim belgesini ve gönderdiğiniz belgelerin kopyasını saklayın.",
        "Bir süre bilgi gelmezse heyet sekretaryasını arayıp başvurunuzun kayıtlı olup olmadığını sorun.",
      ],
      notlar: [
        "Posta yoluyla başvuruda gönderinin teslim edildiğini gösteren belge saklanmalıdır.",
        "Zarfta kaybolma ihtimaline karşı dilekçenin ve belgelerin bir kopyasını kendinizde tutun.",
      ],
    },
  ];
}

/** Başvurudan sonra ne olacağı: yalnızca doğrulanmış 6502 sayılı Kanun hükümlerine dayanır. */
export const BASVURU_SONRASI: string[] = [
  "Heyet başvurunuzu inceler; gerekirse sizden ya da karşı taraftan bilgi ve belge ister (6502 sayılı Kanun m. 69). Bu yüzden iletişim bilgilerinizi güncel tutun.",
  "Heyetin tebligatları elektronik ortamda yapılır; elektronik tebligat yapılamazsa posta ile yapılır (m. 70/2). e-Devlet bildirimlerinizi ve postanızı takip edin.",
  "Heyet kararı tarafları bağlar. Karara karşı, tebliğ tarihinden itibaren 2 hafta içinde heyete ya da yerleşim yerinizdeki tüketici mahkemesine itiraz edilebilir; itiraz kararın uygulanmasını kendiliğinden durdurmaz (m. 70/1 ve 3).",
  "Karar aleyhinize çıkarsa tebligat ve bilirkişi ücretleri Bakanlıkça karşılanır; bu ücretler sizden istenmez (m. 70/7).",
  "Kararın ne zaman çıkacağı heyetin yoğunluğuna göre değişir. Dilekto süre ya da sonuç hakkında söz vermez.",
];

/**
 * e-Devlet başvuru formunun "açıklama" alanına yapıştırılacak metin:
 * dilekçenin AÇIKLAMALAR ve SONUÇ VE İSTEM bölümleri.
 */
export function eDevletAciklamasi(metin: string): string {
  const satirlar = metin.replace(/\r\n/g, "\n").split("\n");
  const parcalar: string[] = [];
  const kucuk = (m: string) => m.toLocaleLowerCase("tr-TR");
  // Başlık eşleştirmesi Türkçe büyük/küçük harfe duyarsızdır ("Açıklamalar:" da olur)
  const baslik = /^(açıklamalar|hukuki nedenler|deliller|sonuç ve istem)\s*:/u;
  let alinan: "aciklama" | "istem" | null = null;
  for (const ham of satirlar) {
    const s = ham.trim();
    const m = baslik.exec(kucuk(s));
    if (m) {
      alinan = m[1] === "açıklamalar" ? "aciklama" : m[1] === "sonuç ve istem" ? "istem" : null;
      if (alinan === "istem") parcalar.push(s);
      continue;
    }
    if (/^tarih\s*:/u.test(kucuk(s)) || /^ekler\s*:/u.test(kucuk(s))) {
      alinan = null;
      continue;
    }
    if (alinan && s) parcalar.push(s);
  }
  return parcalar.join("\n\n");
}
