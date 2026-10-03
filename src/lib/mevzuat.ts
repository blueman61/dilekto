// SABİT MEVZUAT LİSTESİ
//
// Yapay zekâ bu listenin DIŞINDA hiçbir kanun maddesine atıf yapamaz.
// Dilekçedeki "Hukuki nedenler" bölümü yalnızca buradaki kayıtlardan,
// kod tarafından yazılır. Yapay zekânın yazdığı metinde madde numarası
// geçerse metin reddedilir (bkz. src/lib/ai/dogrula.ts).
//
// Doğrulama: Her maddenin metni, 6502 sayılı Kanun'un iki bağımsız
// kopyasıyla harfi harfine karşılaştırılmıştır:
//   1) Adalet Bakanlığı UYAP mevzuat sistemi (mevzuat.adalet.gov.tr/mevzuat/103101)
//   2) mevzuat.gov.tr biçimli kanun metni
// Yeni bir madde eklerken aynı işlemi yapın ve "dogrulama" alanını doldurun.

export type MevzuatKaydi = {
  id: string;
  kanun: string;
  kisaAd: string;
  madde: string;
  fikra?: string;
  baslik: string;
  /** Kullanıcıya gösterilecek sade açıklama */
  ozet: string;
  /** Resmî metinden alıntı (değiştirilmeden) */
  metin: string;
  dogrulama: { tarih: string; kaynaklar: string[] };
};

const KANUN_6502 = "6502 sayılı Tüketicinin Korunması Hakkında Kanun";
const DOGRULAMA_6502 = {
  tarih: "2026-10-02",
  kaynaklar: [
    "mevzuat.adalet.gov.tr/mevzuat/103101 (UYAP)",
    "mevzuat.gov.tr - 6502 sayılı Kanun metni",
  ],
};

export const MEVZUAT: Record<string, MevzuatKaydi> = {
  "6502-m3-k": {
    id: "6502-m3-k",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "3",
    baslik: "Tanımlar (tüketici)",
    ozet: "\"Tüketici\" kimdir: ticari veya mesleki olmayan amaçlarla hareket eden kişi.",
    metin:
      "(1) ... k) Tüketici: Ticari veya mesleki olmayan amaçlarla hareket eden gerçek veya tüzel kişiyi",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m8": {
    id: "6502-m8",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "8",
    baslik: "Ayıplı mal",
    ozet: "Anlatılan ya da olması gereken özellikleri taşımayan mal ayıplıdır.",
    metin:
      "(1) Ayıplı mal, tüketiciye teslimi anında, taraflarca kararlaştırılmış olan örnek ya da modele uygun olmaması ya da objektif olarak sahip olması gereken özellikleri taşımaması nedeniyle sözleşmeye aykırı olan maldır. (2) Ambalajında, etiketinde, tanıtma ve kullanma kılavuzunda, internet portalında ya da reklam ve ilanlarında yer alan özelliklerinden bir veya birden fazlasını taşımayan; satıcı tarafından bildirilen veya teknik düzenlemesinde tespit edilen niteliğe aykırı olan; muadili olan malların kullanım amacını karşılamayan, tüketicinin makul olarak beklediği faydaları azaltan veya ortadan kaldıran maddi, hukuki veya ekonomik eksiklikler içeren mallar da ayıplı olarak kabul edilir.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m9": {
    id: "6502-m9",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "9",
    baslik: "Ayıplı maldan sorumluluk",
    ozet: "Satıcı, malı sözleşmeye uygun teslim etmek zorundadır.",
    metin:
      "(1) Satıcı, malı satış sözleşmesine uygun olarak tüketiciye teslim etmekle yükümlüdür.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m10": {
    id: "6502-m10",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "10",
    baslik: "İspat yükü",
    ozet: "Teslimden sonraki 6 ay içinde çıkan ayıpların teslimde var olduğu kabul edilir.",
    metin:
      "(1) Teslim tarihinden itibaren altı ay içinde ortaya çıkan ayıpların, teslim tarihinde var olduğu kabul edilir. Bu durumda malın ayıplı olmadığının ispatı satıcıya aittir. Bu karine, malın veya ayıbın niteliği ile bağdaşmıyor ise uygulanmaz.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m11": {
    id: "6502-m11",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "11",
    baslik: "Tüketicinin seçimlik hakları",
    ozet: "Ayıplı malda iade, indirim, ücretsiz onarım veya değişim istenebilir.",
    metin:
      "(1) Malın ayıplı olduğunun anlaşılması durumunda tüketici; a) Satılanı geri vermeye hazır olduğunu bildirerek sözleşmeden dönme, b) Satılanı alıkoyup ayıp oranında satış bedelinden indirim isteme, c) Aşırı bir masraf gerektirmediği takdirde, bütün masrafları satıcıya ait olmak üzere satılanın ücretsiz onarılmasını isteme, ç) İmkân varsa, satılanın ayıpsız bir misli ile değiştirilmesini isteme, seçimlik haklarından birini kullanabilir. Satıcı, tüketicinin tercih ettiği bu talebi yerine getirmekle yükümlüdür. (4) Ücretsiz onarım veya malın ayıpsız misli ile değiştirilmesi haklarından birinin seçilmesi durumunda bu talebin satıcıya, üreticiye veya ithalatçıya yöneltilmesinden itibaren azami otuz iş günü, konut ve tatil amaçlı taşınmazlarda ise altmış iş günü içinde yerine getirilmesi zorunludur. Ancak, bu Kanunun 58 inci maddesi uyarınca çıkarılan yönetmelik eki listede yer alan mallara ilişkin, tüketicinin ücretsiz onarım talebi, yönetmelikte belirlenen azami tamir süresi içinde yerine getirilir. Aksi hâlde tüketici diğer seçimlik haklarını kullanmakta serbesttir. (5) Tüketicinin sözleşmeden dönme veya ayıp oranında bedelden indirim hakkını seçtiği durumlarda, ödemiş olduğu bedelin tümü veya bedelden yapılan indirim tutarı derhâl tüketiciye iade edilir.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m12": {
    id: "6502-m12",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "12",
    baslik: "Zamanaşımı (mal)",
    ozet: "Ayıplı maldan sorumluluk, teslimden itibaren 2 yıldır; ayıp hile ile gizlendiyse bu süre uygulanmaz.",
    metin:
      "(1) Kanunlarda veya taraflar arasındaki sözleşmede daha uzun bir süre belirlenmediği takdirde, ayıplı maldan sorumluluk, ayıp daha sonra ortaya çıkmış olsa bile, malın tüketiciye teslim tarihinden itibaren iki yıllık zamanaşımına tabidir. Bu süre konut veya tatil amaçlı taşınmaz mallarda taşınmazın teslim tarihinden itibaren beş yıldır. (2) Bu Kanunun 10 uncu maddesinin üçüncü fıkrası saklı olmak üzere ikinci el satışlarda satıcının ayıplı maldan sorumluluğu bir yıldan, konut veya tatil amaçlı taşınmaz mallarda ise üç yıldan az olamaz. (3) Ayıp, ağır kusur ya da hile ile gizlenmişse zamanaşımı hükümleri uygulanmaz.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m13": {
    id: "6502-m13",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "13",
    baslik: "Ayıplı hizmet",
    ozet: "Sözleşmeye ya da anlatılana uygun olmayan hizmet ayıplıdır.",
    metin:
      "(1) Ayıplı hizmet, sözleşmede belirlenen süre içinde başlamaması veya taraflarca kararlaştırılmış olan ve objektif olarak sahip olması gereken özellikleri taşımaması nedeniyle sözleşmeye aykırı olan hizmettir. (2) Hizmet sağlayıcısı tarafından bildirilen, internet portalında veya reklam ve ilanlarında yer alan özellikleri taşımayan ya da yararlanma amacı bakımından değerini veya tüketicinin ondan makul olarak beklediği faydaları azaltan veya ortadan kaldıran maddi, hukuki veya ekonomik eksiklikler içeren hizmetler ayıplıdır.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m14": {
    id: "6502-m14",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "14",
    baslik: "Ayıplı hizmetten sorumluluk",
    ozet: "Sağlayıcı, hizmeti sözleşmeye uygun yapmak zorundadır.",
    metin:
      "(1) Sağlayıcı, hizmeti sözleşmeye uygun olarak ifa etmekle yükümlüdür.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m15": {
    id: "6502-m15",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "15",
    baslik: "Tüketicinin seçimlik hakları (hizmet)",
    ozet: "Ayıplı hizmette yeniden yapılma, onarım, indirim veya bedel iadesi istenebilir.",
    metin:
      "(1) Hizmetin ayıplı ifa edildiği durumlarda tüketici, hizmetin yeniden görülmesi, hizmet sonucu ortaya çıkan eserin ücretsiz onarımı, ayıp oranında bedelden indirim veya sözleşmeden dönme haklarından birini sağlayıcıya karşı kullanmakta serbesttir. Sağlayıcı, tüketicinin tercih ettiği bu talebi yerine getirmekle yükümlüdür. Seçimlik hakların kullanılması nedeniyle ortaya çıkan tüm masraflar sağlayıcı tarafından karşılanır. Tüketici, bu seçimlik haklarından biri ile birlikte Türk Borçlar Kanunu hükümleri uyarınca tazminat da talep edebilir. (3) Tüketicinin sözleşmeden dönme veya ayıp oranında bedelden indirim hakkını seçtiği durumlarda, ödemiş olduğu bedelin tümü veya bedelden indirim yapılan tutar derhâl tüketiciye iade edilir. (4) Ücretsiz onarım veya hizmetin yeniden görülmesinin seçildiği hâllerde, hizmetin niteliği ve tüketicinin bu hizmetten yararlanma amacı dikkate alındığında, makul sayılabilecek bir süre içinde ve tüketici için ciddi sorunlar doğurmayacak şekilde bu talep sağlayıcı tarafından yerine getirilir. Her hâlükârda bu süre talebin sağlayıcıya yöneltilmesinden itibaren otuz iş gününü geçemez. Aksi takdirde tüketici diğer seçimlik haklarını kullanmakta serbesttir.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m16": {
    id: "6502-m16",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "16",
    baslik: "Zamanaşımı (hizmet)",
    ozet: "Ayıplı hizmetten sorumluluk, hizmetin yapıldığı tarihten itibaren 2 yıldır.",
    metin:
      "(1) Kanunlarda veya taraflar arasındaki sözleşmede daha uzun bir süre belirlenmediği takdirde, ayıplı hizmetten sorumluluk, ayıp daha sonra ortaya çıkmış olsa bile, hizmetin ifası tarihinden itibaren iki yıllık zamanaşımına tabidir. (2) Ayıp, ağır kusur ya da hile ile gizlenmişse zamanaşımı hükümleri uygulanmaz.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m48-3": {
    id: "6502-m48-3",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "48",
    fikra: "3",
    baslik: "Mesafeli sözleşmeler (teslim süresi)",
    ozet: "İnternetten alınan mal en geç 30 gün içinde teslim edilmelidir; edilmezse sözleşme feshedilebilir.",
    metin:
      "(3) Satıcı veya sağlayıcı, tüketicinin siparişinin kendisine ulaştığı andan itibaren taahhüt edilen süre içinde edimini yerine getirir. Tüketicinin isteği veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler haricinde mal satışlarında bu süre her hâlükârda otuz günü geçemez. Satıcı veya sağlayıcının bu süre içinde edimini yerine getirmemesi durumunda tüketici sözleşmeyi feshedebilir.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m48-4": {
    id: "6502-m48-4",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "48",
    fikra: "4",
    baslik: "Mesafeli sözleşmeler (cayma hakkı)",
    ozet: "İnternetten alışverişte 14 gün içinde gerekçesiz cayma hakkı vardır.",
    metin:
      "(4) Tüketici, on dört gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanıldığına dair bildirimin bu süre içinde satıcı veya sağlayıcıya yöneltilmiş olması yeterlidir. Satıcı veya sağlayıcı, cayma hakkı konusunda tüketicinin bilgilendirildiğini ispat etmekle yükümlüdür. Tüketici, cayma hakkı konusunda gerektiği şekilde bilgilendirilmezse, cayma hakkını kullanmak için on dört günlük süreyle bağlı değildir. Her hâlükârda bu süre cayma süresinin bittiği tarihten itibaren bir yıl sonra sona erer. Tüketici, cayma hakkı süresi içinde malın mutat kullanımı sebebiyle meydana gelen değişiklik ve bozulmalardan sorumlu değildir.",
    dogrulama: DOGRULAMA_6502,
  },
  "6502-m68": {
    id: "6502-m68",
    kanun: KANUN_6502,
    kisaAd: "6502 sayılı Kanun",
    madde: "68",
    baslik: "Tüketici hakem heyetlerine başvuru",
    ozet: "Parasal sınırın altındaki uyuşmazlıklarda hakem heyetine başvurulur.",
    metin:
      "(1) Tarafların İcra ve İflas Kanunundaki hakları saklı kalmak kaydıyla; değeri otuz bin Türk Lirasının altında bulunan uyuşmazlıklarda tüketici hakem heyetlerine başvuru zorunludur. Bu değerlerin üzerindeki uyuşmazlıklar için tüketici hakem heyetlerine başvuru yapılamaz. (3) Başvurular, tüketicinin yerleşim yerinin bulunduğu veya tüketici işleminin yapıldığı yerdeki tüketici hakem heyetine yapılabilir. Tüketici hakem heyetinin bulunmadığı yerlerde ise başvurular o ilçe kaymakamlığına yapılabilir. Yapılan bu başvurular, kaymakamlıklarca gereği yapılmak üzere Bakanlıkça belirlenen yetkili tüketici hakem heyetine iletilir.",
    dogrulama: DOGRULAMA_6502,
  },
};

/**
 * Tüketici hakem heyetine başvuru için 2026 yılı parasal sınırı.
 * 6502 s. Kanun m. 68/1'deki tutar her yıl yeniden değerleme oranında
 * artırılır. 2026 için Ticaret Bakanlığı'nın ilan ettiği tutar 186.000 TL'dir
 * (değeri bu tutarın altında olan uyuşmazlıklar). Her ocak ayında güncelleyin.
 */
export const HAKEM_HEYETI_SINIRI = { yil: 2026, tutar: 186_000 };

export function mevzuatGetir(id: string): MevzuatKaydi {
  const kayit = MEVZUAT[id];
  if (!kayit) throw new Error(`Mevzuat listesinde olmayan kayıt: ${id}`);
  return kayit;
}

/** "6502 sayılı Kanun m. 11" biçiminde kısa atıf */
export function atifYaz(k: MevzuatKaydi): string {
  return `m. ${k.madde}${k.fikra ? `/${k.fikra}` : ""}`;
}

/**
 * Atıf listesini dilekçe diliyle yazar:
 * "6502 sayılı Tüketicinin Korunması Hakkında Kanun m. 8, m. 11, m. 68"
 */
export function hukukiNedenlerYaz(idler: string[]): string {
  const kayitlar = [...new Set(idler)].map(mevzuatGetir);
  const kanunlar = new Map<string, MevzuatKaydi[]>();
  for (const k of kayitlar) {
    const liste = kanunlar.get(k.kanun) ?? [];
    liste.push(k);
    kanunlar.set(k.kanun, liste);
  }
  return [...kanunlar.entries()]
    .map(([kanun, liste]) => {
      const sirali = liste.sort(
        (a, b) =>
          Number(a.madde) - Number(b.madde) ||
          Number(a.fikra ?? 0) - Number(b.fikra ?? 0),
      );
      return `${kanun} ${sirali.map(atifYaz).join(", ")}`;
    })
    .join("; ");
}
