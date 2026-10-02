// DENEME MODU: Para çekmeden ödemeyi tamamlanmış sayar.
// Yalnızca ODEME_MODU "deneme" iken çalışır.

import { depo } from "@/lib/depo";
import { denemeModundaMi } from "@/lib/odeme";

export async function POST(istek: Request) {
  if (!denemeModundaMi()) {
    return Response.json({ hata: "Deneme ödemesi kapalı." }, { status: 403 });
  }
  const { id, onay } = (await istek.json().catch(() => ({}))) as { id?: string; onay?: boolean };
  if (onay !== true) {
    return Response.json({ hata: "Devam etmek için onay kutularını işaretleyin." }, { status: 400 });
  }
  const d = depo();
  const kayit = id ? await d.getir(id) : null;
  if (!kayit) return Response.json({ hata: "Dilekçe bulunamadı." }, { status: 404 });

  await d.odemeIsle(kayit.id, {
    saglayici: "deneme",
    referans: `DENEME-${Date.now()}`,
    tarih: new Date().toISOString(),
  });
  return Response.json({ yonlendirme: `/dilekce/${kayit.id}` });
}
