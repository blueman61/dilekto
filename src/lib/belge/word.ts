// Dilekçeyi tarayıcıda Word (.docx) dosyasına çevirir.
// Düzen PDF ile aynıdır: A4, Times New Roman 12 punto, 2,5 cm kenar boşluğu,
// 1,5 satır aralığı, iki yana yaslı metin (bkz. docs/DILEKCE-KURALLARI.md).

import { AlignmentType, Document, LineRuleType, Packer, Paragraph, TextRun } from "docx";
import { bicimle } from "./bicim";

const HIZA = {
  sol: AlignmentType.JUSTIFIED,
  orta: AlignmentType.CENTER,
  sag: AlignmentType.RIGHT,
} as const;

const KENAR = 1418; // 2,5 cm (twip)

export async function wordOlustur(metin: string): Promise<Blob> {
  const paragraflar = bicimle(metin).map(
    (s) =>
      new Paragraph({
        alignment: HIZA[s.hizalama],
        // İmza bloğu ve başlıklar bir sonraki satırla aynı sayfada kalsın
        keepNext: s.hizalama === "sag" || s.baslik,
        spacing: { before: 0, after: 0, line: 360, lineRule: LineRuleType.AUTO },
        children: s.bos ? [] : s.parcalar.map((p) => new TextRun({ text: p.metin, bold: p.kalin })),
      }),
  );

  const belge = new Document({
    creator: "Dilekto",
    title: "Dilekçe",
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 24 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: KENAR, bottom: KENAR, left: KENAR, right: KENAR },
          },
        },
        children: paragraflar,
      },
    ],
  });
  return Packer.toBlob(belge);
}
