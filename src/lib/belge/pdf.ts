// Dilekçeyi tarayıcıda PDF'e çevirir (sunucuya veri gönderilmez).

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { bicimle, type Parca } from "./bicim";

const A4 = { genislik: 595.28, yukseklik: 841.89 };
const KENAR = { sol: 70, sag: 60, ust: 64, alt: 64 };
const PUNTO = 12;
const SATIR = 17;

type Kelime = { metin: string; kalin: boolean; genislik: number };

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

  const genislik = A4.genislik - KENAR.sol - KENAR.sag;
  let sayfa: PDFPage = belge.addPage([A4.genislik, A4.yukseklik]);
  let y = A4.yukseklik - KENAR.ust;

  const font = (k: boolean): PDFFont => (k ? kalin : normal);
  const yeniSatir = () => {
    y -= SATIR;
    if (y < KENAR.alt) {
      sayfa = belge.addPage([A4.genislik, A4.yukseklik]);
      y = A4.yukseklik - KENAR.ust;
    }
  };

  const satirlar = bicimle(metin);
  const imzaBasi = satirlar.findIndex((s) => s.hizalama === "sag");

  for (const [i, satir] of satirlar.entries()) {
    // İmza bölümü (tarih, ad, imza) bölünmesin: sığmıyorsa yeni sayfadan başla
    if (i === imzaBasi && y - (satirlar.length - i) * SATIR < KENAR.alt) {
      sayfa = belge.addPage([A4.genislik, A4.yukseklik]);
      y = A4.yukseklik - KENAR.ust;
    }
    if (satir.bos) {
      yeniSatir();
      continue;
    }
    // Satırı kelimelere böl, sığdığı kadarını yan yana diz
    const kelimeler: Kelime[] = satir.parcalar.flatMap((p: Parca) =>
      p.metin
        .split(/(\s+)/u)
        .filter((k) => k !== "")
        .map((k) => ({ metin: k, kalin: p.kalin, genislik: font(p.kalin).widthOfTextAtSize(k, PUNTO) })),
    );

    let dizi: Kelime[] = [];
    let dizGenislik = 0;
    const yaz = () => {
      while (dizi.length && /^\s+$/u.test(dizi[dizi.length - 1].metin)) {
        dizGenislik -= dizi.pop()!.genislik;
      }
      let x = KENAR.sol;
      if (satir.hizalama === "orta") x += (genislik - dizGenislik) / 2;
      if (satir.hizalama === "sag") x += genislik - dizGenislik;
      for (const k of dizi) {
        if (!/^\s+$/u.test(k.metin)) {
          sayfa.drawText(k.metin, { x, y, size: PUNTO, font: font(k.kalin), color: rgb(0, 0, 0) });
        }
        x += k.genislik;
      }
      dizi = [];
      dizGenislik = 0;
    };

    for (const k of kelimeler) {
      const bosluk = /^\s+$/u.test(k.metin);
      if (bosluk && dizi.length === 0) continue;
      if (!bosluk && dizGenislik + k.genislik > genislik && dizi.length) {
        yaz();
        yeniSatir();
      }
      // Tek kelime satıra sığmıyorsa harf harf böl
      if (!bosluk && k.genislik > genislik) {
        for (const harf of k.metin) {
          const g = font(k.kalin).widthOfTextAtSize(harf, PUNTO);
          if (dizGenislik + g > genislik) {
            yaz();
            yeniSatir();
          }
          dizi.push({ metin: harf, kalin: k.kalin, genislik: g });
          dizGenislik += g;
        }
        continue;
      }
      dizi.push(k);
      dizGenislik += k.genislik;
    }
    yaz();
    yeniSatir();
  }

  const baytlar = await belge.save();
  return new Blob([baytlar as BlobPart], { type: "application/pdf" });
}
