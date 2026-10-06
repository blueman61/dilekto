// Dilekçenin düz metnini PDF ve Word için biçimli satırlara çevirir.
// Kurallar basittir, böylece kullanıcı metni düzenlese de biçim korunur
// (bkz. docs/DILEKCE-KURALLARI.md):
//  - İlk dolu satır: makam adı, ortalı ve kalın
//  - Tamamı büyük harf olan başlıklar (ör. "AÇIKLAMALAR:") kalın
//  - "KONU: ..." gibi büyük harfli etiketlerin yalnızca etiket kısmı kalın
//  - "Tarih:" satırından "EKLER:" başlığına kadar olan imza bloğu sağa yaslı
//  - "EKLER:" ve sonrası, sol kenardan başlar
//  - Diğer satırlar iki yana yaslı (PDF ve Word'de)

export type Parca = { metin: string; kalin: boolean };
export type BicimliSatir = {
  parcalar: Parca[];
  hizalama: "sol" | "orta" | "sag";
  bos: boolean;
  /** Yalnızca başlıktan oluşan satır: sayfanın son satırı olmamalı */
  baslik: boolean;
};

const BUYUK = "A-ZÇĞİÖŞÜÂÎÛ";
const ETIKET = new RegExp(`^([${BUYUK}][${BUYUK}0-9 .()/]+:)(\\s*)(.*)$`, "u");
const TAM_BUYUK = new RegExp(`^[${BUYUK}0-9 .()/:-]+$`, "u");
const EK_BASLIGI = /^(EKLER|EK)\s*:/u;

export function bicimle(metin: string): BicimliSatir[] {
  const satirlar = metin.replace(/\r\n/g, "\n").split("\n");
  const ilkDolu = satirlar.findIndex((s) => s.trim() !== "");
  let imzaBasi = -1;
  for (let i = satirlar.length - 1; i >= 0; i--) {
    if (/^Tarih\s*:/u.test(satirlar[i].trim())) {
      imzaBasi = i;
      break;
    }
  }
  // İmza bloğu, varsa "EKLER:" başlığında biter
  let imzaSonu = satirlar.length;
  if (imzaBasi >= 0) {
    for (let i = imzaBasi + 1; i < satirlar.length; i++) {
      if (EK_BASLIGI.test(satirlar[i].trim())) {
        imzaSonu = i;
        break;
      }
    }
  }

  return satirlar.map((ham, i) => {
    const s = ham.replace(/\s+$/u, "");
    const hizalama = i === ilkDolu ? "orta" : imzaBasi >= 0 && i >= imzaBasi && i < imzaSonu ? "sag" : "sol";
    if (s.trim() === "") return { parcalar: [], hizalama, bos: true, baslik: false };
    const m = i === ilkDolu ? null : ETIKET.exec(s);
    if (m && m[3]) {
      return {
        parcalar: [
          { metin: m[1], kalin: true },
          { metin: ` ${m[3]}`, kalin: false },
        ],
        hizalama,
        bos: false,
        baslik: false,
      };
    }
    if (i === ilkDolu || m || (TAM_BUYUK.test(s) && /[A-ZÇĞİÖŞÜ]{3}/u.test(s))) {
      return { parcalar: [{ metin: s, kalin: true }], hizalama, bos: false, baslik: i !== ilkDolu && s.trim().endsWith(":") };
    }
    return { parcalar: [{ metin: s, kalin: false }], hizalama, bos: false, baslik: false };
  });
}

export function dosyaAdi(temel: string, uzanti: string): string {
  const tarih = new Date().toISOString().slice(0, 10);
  return `${temel}-${tarih}.${uzanti}`;
}

export function dosyaIndir(veri: Blob, ad: string) {
  const url = URL.createObjectURL(veri);
  const a = document.createElement("a");
  a.href = url;
  a.download = ad;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
