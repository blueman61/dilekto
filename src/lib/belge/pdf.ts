// Dilekçeyi tarayıcıda PDF'e çevirir (sunucuya veri gönderilmez).
//
// Düzen (bkz. docs/DILEKCE-KURALLARI.md): A4, Times New Roman ölçülü Liberation Serif
// 12 punto, 2,5 cm kenar boşluğu, 1,5 satır aralığı, metin iki yana yaslı,
// makam adı ortalı, imza bloğu sağda, ekler solda.

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { bicimle, type Parca } from "./bicim";

const A4 = { genislik: 595.28, yukseklik: 841.89 };
const KENAR = 70.87; // 2,5 cm
const PUNTO = 12;
const SATIR = 18; // 1,5 satır aralığı

type Kelime = { metin: string; kalin: boolean; genislik: number };

const bosluk = (k: string) => /^\s+$/u.test(k);

export async function pdfOlustur(metin: string): Promise<Blob> {
  const belge = await PDFDocument.create();
  belge.registerFontkit(fontkit);
  const [normalVeri, kalinVeri] = await Promise.all([
    fetch("/fonts/LiberationSerif-Regular.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/LiberationSerif-Bold.ttf").then((r) => r.arrayBuffer()),
  ]);
  const normal = await belge.embedFont(normalVeri, { subset: true });
  const kalin = await belge.embedFont(kalinVeri, { subset: true });
  belge.setTitle("Dilekçe");
  belge.setCreator("Dilekto");

  const genislik = A4.genislik - 2 * KENAR;
  const altSinir = KENAR;
  let sayfa: PDFPage = belge.addPage([A4.genislik, A4.yukseklik]);
  let y = A4.yukseklik - KENAR - PUNTO; // ilk satırın taban çizgisi

  const font = (k: boolean): PDFFont => (k ? kalin : normal);
  const yeniSayfa = () => {
    sayfa = belge.addPage([A4.genislik, A4.yukseklik]);
    y = A4.yukseklik - KENAR - PUNTO;
  };
  /** Bir sonraki satıra geç; sığmazsa yeni sayfa */
  const yeniSatir = () => {
    y -= SATIR;
    if (y < altSinir) yeniSayfa();
  };
  /** Verilen sayıda satırın bu sayfaya sığıp sığmadığı */
  const sigiyor = (satirSayisi: number) => y - (satirSayisi - 1) * SATIR >= altSinir;

  const satirlar = bicimle(metin);
  const imzaIndeksleri = satirlar.map((s, i) => (s.hizalama === "sag" && !s.bos ? i : -1)).filter((i) => i >= 0);
  const imzaBasi = imzaIndeksleri[0] ?? -1;
  const imzaSonu = imzaIndeksleri[imzaIndeksleri.length - 1] ?? -1;

  for (const [i, satir] of satirlar.entries()) {
    // İmza bloğu (tarih, imza, ad) tek sayfada kalsın
    if (i === imzaBasi && !sigiyor(imzaSonu - imzaBasi + 1)) yeniSayfa();
    // Başlık sayfanın son satırı olmasın (kendinden sonraki ilk satırla birlikte)
    if (satir.baslik && !sigiyor(2)) yeniSayfa();

    if (satir.bos) {
      yeniSatir();
      continue;
    }

    // Satırı kelimelere ve boşluklara böl
    const kelimeler: Kelime[] = satir.parcalar.flatMap((p: Parca) =>
      p.metin
        .split(/(\s+)/u)
        .filter((k) => k !== "")
        .map((k) => ({ metin: k, kalin: p.kalin, genislik: font(p.kalin).widthOfTextAtSize(k, PUNTO) })),
    );

    // Sığdığı kadarını yan yana dizerek satırlara ayır
    const dizilmis: { kelimeler: Kelime[]; genislik: number }[] = [];
    let dizi: Kelime[] = [];
    let dizGenislik = 0;
    const satiriKapat = () => {
      while (dizi.length && bosluk(dizi[dizi.length - 1].metin)) dizGenislik -= dizi.pop()!.genislik;
      dizilmis.push({ kelimeler: dizi, genislik: dizGenislik });
      dizi = [];
      dizGenislik = 0;
    };
    for (const k of kelimeler) {
      if (bosluk(k.metin) && dizi.length === 0) continue;
      if (!bosluk(k.metin) && dizGenislik + k.genislik > genislik && dizi.length) satiriKapat();
      // Tek kelime satıra sığmıyorsa harf harf böl
      if (!bosluk(k.metin) && k.genislik > genislik) {
        for (const harf of k.metin) {
          const g = font(k.kalin).widthOfTextAtSize(harf, PUNTO);
          if (dizGenislik + g > genislik) satiriKapat();
          dizi.push({ metin: harf, kalin: k.kalin, genislik: g });
          dizGenislik += g;
        }
        continue;
      }
      dizi.push(k);
      dizGenislik += k.genislik;
    }
    if (dizi.length) satiriKapat();

    // Çizim
    dizilmis.forEach((d, n) => {
      const sonSatir = n === dizilmis.length - 1;
      let x = KENAR;
      let ekBosluk = 0;
      if (satir.hizalama === "orta") x += (genislik - d.genislik) / 2;
      else if (satir.hizalama === "sag") x += genislik - d.genislik;
      else if (!sonSatir) {
        // İki yana yasla: kalan boşluğu kelime aralarına dağıt
        const aralik = d.kelimeler.filter((k) => bosluk(k.metin)).length;
        if (aralik > 0) ekBosluk = (genislik - d.genislik) / aralik;
      }
      for (const k of d.kelimeler) {
        if (bosluk(k.metin)) {
          x += k.genislik + ekBosluk;
        } else {
          sayfa.drawText(k.metin, { x, y, size: PUNTO, font: font(k.kalin), color: rgb(0, 0, 0) });
          x += k.genislik;
        }
      }
      yeniSatir();
    });
  }

  const baytlar = await belge.save();
  return new Blob([baytlar as BlobPart], { type: "application/pdf" });
}
