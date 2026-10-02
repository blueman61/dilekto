// Dilekçeyi tarayıcıda Word (.docx) dosyasına çevirir.

import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
import { bicimle } from "./bicim";

const HIZA = {
  sol: AlignmentType.JUSTIFIED,
  orta: AlignmentType.CENTER,
  sag: AlignmentType.RIGHT,
} as const;

export async function wordOlustur(metin: string): Promise<Blob> {
  const paragraflar = bicimle(metin).map(
    (s) =>
      new Paragraph({
        alignment: HIZA[s.hizalama],
        // İmza bölümü aynı sayfada kalsın
        keepNext: s.hizalama === "sag",
        spacing: { after: 0, line: 300 },
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
          page: { margin: { top: 1134, bottom: 1134, left: 1418, right: 1134 } },
        },
        children: paragraflar,
      },
    ],
  });
  return Packer.toBlob(belge);
}
