// Tüketici Hakem Heyeti dilekçesinin kural denetimi.
// Kurallar ve kaynakları: docs/DILEKCE-KURALLARI.md
//
// Denetim, kullanıcının düzenlediği metin üzerinde çalışır; böylece metni elle
// değiştirse bile eksikler anında görünür. Hiçbir kişisel bilgi sunucuya gitmez
// (denetim tarayıcıda yapılır).

import { tcGecerliMi } from "../ortak";
import type { KontrolMaddesi } from "../tipler";

// Köşeli parantezli, doldurulmamış yerler (ör. [Adresiniz])
const YER_VAR = /\[[^\]\n]{2,80}\]/;
const YER_HEPSI = /\[[^\]\n]{2,80}\]/g;

function normal(metin: string): string {
  return metin.toLocaleLowerCase("tr-TR");
}

/** Satır, verilen başlıkla başlıyor mu? (Türkçe büyük/küçük harfe ve boşluğa duyarsız: "Açıklamalar :" da olur) */
function baslikla(satir: string, baslik: string): boolean {
  return new RegExp(`^${normal(baslik)}\\s*:`, "u").test(normal(satir.trim()));
}

/** "Etiket: değer" satırının değeri (etiket büyük/küçük harfe duyarsız); yoksa undefined */
function alanDegeri(satirlar: string[], etiket: string): string | undefined {
  const hedef = `${normal(etiket)}:`;
  const satir = satirlar.find((s) => normal(s.trimStart()).startsWith(hedef));
  return satir === undefined ? undefined : satir.slice(satir.indexOf(":") + 1).trim();
}


function dolumu(v: string | undefined): boolean {
  return Boolean(v && v.trim() && !YER_VAR.test(v));
}

function tarihGecerliMi(gg: string, aa: string, yyyy: string): boolean {
  const g = Number(gg);
  const a = Number(aa);
  const y = Number(yyyy);
  const d = new Date(Date.UTC(y, a - 1, g));
  return d.getUTCFullYear() === y && d.getUTCMonth() === a - 1 && d.getUTCDate() === g;
}

export function dilekceKontrol(metin: string): KontrolMaddesi[] {
  const satirlar = metin.replace(/\r\n/g, "\n").split("\n");
  const sonuc: KontrolMaddesi[] = [];
  const ekle = (m: KontrolMaddesi) => sonuc.push(m);

  // 1. Makam başlığı (uygulama kuralı)
  const ilk = satirlar.find((s) => s.trim()) ?? "";
  if (!/BAŞKANLIĞINA\s*$/u.test(ilk.trim())) {
    ekle({
      id: "makam",
      baslik: "Makam adı ilk satırda",
      durum: "eksik",
      ayrinti: 'İlk satır "… TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA" biçiminde, büyük harfle olmalı.',
      kaynak: "Dilekçe yazım düzeni",
      zorunlu: false,
    });
  } else if (YER_VAR.test(ilk)) {
    ekle({
      id: "makam",
      baslik: "Makam adı ilk satırda",
      durum: "uyari",
      ayrinti: "Başvuracağınız heyetin il (ve varsa ilçe) adını yazın.",
      kaynak: "Dilekçe yazım düzeni",
      zorunlu: false,
    });
  } else {
    ekle({ id: "makam", baslik: "Makam adı ilk satırda", durum: "tamam", kaynak: "Dilekçe yazım düzeni", zorunlu: false });
  }

  // 2-4. Başvuru sahibi (3071 s. K. m. 4; Hakem Heyetleri Yönetmeliği m. 11)
  const adSoyad = alanDegeri(satirlar, "Adı Soyadı");
  ekle({
    id: "adSoyad",
    baslik: "Adınız ve soyadınız",
    durum: dolumu(adSoyad) ? "tamam" : "eksik",
    ayrinti: dolumu(adSoyad) ? undefined : '"Adı Soyadı" satırını doldurun.',
    kaynak: "3071 s. Kanun m. 4",
    zorunlu: true,
  });

  const tc = alanDegeri(satirlar, "T.C. Kimlik No");
  const tcSade = (tc ?? "").replace(/\s/g, "");
  ekle({
    id: "tc",
    baslik: "T.C. kimlik numaranız",
    durum: !dolumu(tc) ? "eksik" : tcGecerliMi(tcSade) ? "tamam" : "uyari",
    ayrinti: !dolumu(tc)
      ? "11 haneli kimlik numaranızı yazın."
      : tcGecerliMi(tcSade)
        ? undefined
        : "Bu numara geçerli görünmüyor; lütfen kontrol edin.",
    kaynak: "Tüketici Hakem Heyetleri Yönetmeliği m. 11",
    zorunlu: true,
  });

  const adres = alanDegeri(satirlar, "Adres");
  ekle({
    id: "adres",
    baslik: "Adresiniz",
    durum: dolumu(adres) ? "tamam" : "eksik",
    ayrinti: dolumu(adres) ? undefined : "Açık adresinizi yazın (ikametgâh ya da iş adresi).",
    kaynak: "3071 s. Kanun m. 4",
    zorunlu: true,
  });

  const telefon = alanDegeri(satirlar, "Telefon");
  ekle({
    id: "iletisim",
    baslik: "İletişim bilgisi (telefon)",
    durum: dolumu(telefon) ? "tamam" : "uyari",
    ayrinti: dolumu(telefon) ? undefined : "Heyetin size ulaşabilmesi için telefon yazmanız önerilir.",
    kaynak: "Tüketici Hakem Heyetleri Yönetmeliği m. 11",
    zorunlu: false,
  });

  // 5-6. Karşı taraf (Yönetmelik m. 11: şikâyet edilene ilişkin bilgiler)
  const unvan = alanDegeri(satirlar, "Unvanı");
  ekle({
    id: "karsiTaraf",
    baslik: "Karşı tarafın adı / unvanı",
    durum: dolumu(unvan) ? "tamam" : "eksik",
    ayrinti: dolumu(unvan) ? undefined : "Satıcının ya da hizmet verenin unvanını faturadaki gibi yazın.",
    kaynak: "Tüketici Hakem Heyetleri Yönetmeliği m. 11",
    zorunlu: true,
  });
  const karsiAdres = alanDegeri(satirlar, "Adresi");
  ekle({
    id: "karsiAdres",
    baslik: "Karşı tarafın adresi",
    durum: dolumu(karsiAdres) ? "tamam" : "uyari",
    ayrinti: dolumu(karsiAdres) ? undefined : "Faturada yazar. Bilmiyorsanız boş bırakmayıp internet sitesini ya da mağaza adresini yazın.",
    kaynak: "Tüketici Hakem Heyetleri Yönetmeliği m. 11",
    zorunlu: false,
  });

  // 7. Uyuşmazlık değeri (TL)
  const deger = alanDegeri(satirlar, "UYUŞMAZLIK DEĞERİ");
  ekle({
    id: "deger",
    baslik: "Uyuşmazlık değeri (TL)",
    durum: dolumu(deger) && /\d/.test(deger ?? "") && /TL/i.test(deger ?? "") ? "tamam" : "eksik",
    ayrinti: 'Ödediğiniz tutarı "12.499 TL" gibi yazın.',
    kaynak: "Tüketici Hakem Heyetleri Yönetmeliği m. 11",
    zorunlu: true,
  });

  // 8. Konu (3071 s. K. m. 6)
  const konu = alanDegeri(satirlar, "KONU");
  ekle({
    id: "konu",
    baslik: "Konu satırı",
    durum: dolumu(konu) && (konu ?? "").trim().length >= 5 ? "tamam" : "eksik",
    ayrinti: '"KONU:" satırına başvurunuzu tek cümleyle yazın.',
    kaynak: "3071 s. Kanun m. 6",
    zorunlu: true,
  });

  // 9. Açıklamalar: numaralı paragraflar
  const aciklamaBasi = satirlar.findIndex((s) => baslikla(s, "AÇIKLAMALAR"));
  let numarali = 0;
  if (aciklamaBasi >= 0) {
    for (let i = aciklamaBasi + 1; i < satirlar.length; i++) {
      const s = satirlar[i].trim();
      if (["HUKUKİ NEDENLER", "DELİLLER", "SONUÇ VE İSTEM"].some((b) => baslikla(s, b))) break;
      if (/^\d+[.)-]\s*\S/u.test(s)) numarali++;
    }
  }
  ekle({
    id: "aciklama",
    baslik: "Olayın tarih sırasıyla anlatımı",
    durum: numarali >= 1 ? "tamam" : "eksik",
    ayrinti: '"AÇIKLAMALAR:" altında olayları numaralı kısa paragraflarla anlatın.',
    kaynak: "Dilekçe yazım düzeni",
    zorunlu: false,
  });

  // 10. Talep
  const istek = alanDegeri(satirlar, "SONUÇ VE İSTEM");
  ekle({
    id: "istek",
    baslik: "Talebiniz (sonuç ve istem)",
    durum: dolumu(istek) && (istek ?? "").trim().length >= 20 ? "tamam" : "eksik",
    ayrinti: "Ne istediğinizi (iade, değişim, onarım, indirim) açıkça yazın.",
    kaynak: "Tüketici Hakem Heyetleri Yönetmeliği m. 11",
    zorunlu: true,
  });

  // 11. Tarih
  const tarihSatiri = [...satirlar].reverse().find((s) => baslikla(s, "Tarih"));
  const tarihM = tarihSatiri ? /(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(tarihSatiri) : null;
  const tarihGecerli = tarihM ? tarihGecerliMi(tarihM[1], tarihM[2], tarihM[3]) : false;
  ekle({
    id: "tarih",
    baslik: "Dilekçe tarihi",
    durum: tarihGecerli ? "tamam" : "eksik",
    ayrinti: tarihGecerli ? undefined : '"Tarih: GG.AA.YYYY" biçiminde yazın.',
    kaynak: "Dilekçe yazım düzeni",
    zorunlu: false,
  });

  // 12. İmza bloğu: tarih → İmza → Ad SOYAD (imza adın üstüne atılır)
  const tarihIndex = tarihSatiri ? satirlar.lastIndexOf(tarihSatiri) : -1;
  const sonrasi = tarihIndex >= 0 ? satirlar.slice(tarihIndex + 1).filter((s) => s.trim()) : [];
  const imzaIndex = sonrasi.findIndex((s) => normal(s.trim()).replace(/[():]/g, "") === "imza");
  const imzaAdi = imzaIndex >= 0 ? (sonrasi[imzaIndex + 1] ?? "").trim() : "";
  const adTutuyor = Boolean(adSoyad && imzaAdi && normal(imzaAdi) === normal(adSoyad));
  ekle({
    id: "imza",
    baslik: "İmza satırı ve ad soyad",
    durum: imzaIndex < 0 ? "eksik" : dolumu(imzaAdi) ? (adTutuyor || !dolumu(adSoyad) ? "tamam" : "uyari") : "eksik",
    ayrinti:
      imzaIndex < 0
        ? 'Tarihten sonra "İmza" satırı ve altında adınız soyadınız olmalı. Çıktıyı almadan önce imzalamayı unutmayın.'
        : !dolumu(imzaAdi)
          ? "İmza satırının altına adınızı soyadınızı yazın."
          : adTutuyor || !dolumu(adSoyad)
            ? undefined
            : "İmza altındaki ad, başvuru sahibi adıyla aynı olmalı.",
    kaynak: "3071 s. Kanun m. 4",
    zorunlu: true,
  });

  // 13. Ekler
  const ekBasi = satirlar.findIndex((s) => baslikla(s, "EKLER"));
  const ekler = ekBasi >= 0 ? satirlar.slice(ekBasi + 1).filter((s) => /^\d+[.)-]\s*\S/u.test(s.trim())) : [];
  const gercekEk = ekler.filter((s) => dolumu(s));
  ekle({
    id: "ekler",
    baslik: "Ekler listesi",
    durum: gercekEk.length >= 1 ? "tamam" : "uyari",
    ayrinti: 'Fatura gibi belgeleri imzadan sonra "EKLER:" altında numaralı yazın; belge eklemek incelemeyi kolaylaştırır.',
    kaynak: "Resmî yazışma düzeni (Ek:)",
    zorunlu: false,
  });

  // 14. Doldurulmamış köşeli parantezli yerler
  const bosYerler = [...new Set(metin.match(YER_HEPSI) ?? [])];
  ekle({
    id: "bosYerler",
    baslik: "Doldurulmamış yer kalmadı",
    durum: bosYerler.length === 0 ? "tamam" : "eksik",
    ayrinti: bosYerler.length ? `Doldurulacak yerler: ${bosYerler.slice(0, 6).join(", ")}${bosYerler.length > 6 ? " …" : ""}` : undefined,
    zorunlu: false,
  });

  // 15. Uzunluk (A4, 12 punto, 1,5 aralıkta bir sayfaya ~ 36 satır sığar)
  let kaba = 0;
  for (const s of satirlar) kaba += Math.max(1, Math.ceil(s.length / 80));
  const sayfa = Math.max(1, Math.ceil(kaba / 36));
  ekle({
    id: "uzunluk",
    baslik: `Uzunluk: yaklaşık ${sayfa} sayfa`,
    durum: sayfa <= 3 ? "tamam" : "uyari",
    ayrinti: sayfa <= 3 ? undefined : "Dilekçe uzadı; olayları daha kısa anlatmak okunmasını kolaylaştırır.",
    zorunlu: false,
  });

  return sonuc;
}

/** Zorunlu maddelerden eksik olanlar (indirmeden önce uyarmak için) */
export function zorunluEksikler(maddeler: KontrolMaddesi[]): KontrolMaddesi[] {
  return maddeler.filter((m) => m.zorunlu && m.durum === "eksik");
}
