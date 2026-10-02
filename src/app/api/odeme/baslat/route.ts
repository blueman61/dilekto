// Ödemeyi başlatır ve kullanıcının gideceği ödeme sayfasını döndürür.

import { siteAdresi } from "@/config/site";
import { depo } from "@/lib/depo";
import { odemeSaglayicisi } from "@/lib/odeme";

export async function POST(istek: Request) {
  const { id } = (await istek.json().catch(() => ({}))) as { id?: string };
  const kayit = id ? await depo().getir(id) : null;
  if (!kayit) return Response.json({ hata: "Dilekçe bulunamadı." }, { status: 404 });
  if (kayit.durum === "odendi") return Response.json({ yonlendirme: `/dilekce/${kayit.id}` });

  const { yonlendirme } = await odemeSaglayicisi().baslat(kayit, siteAdresi());
  return Response.json({ yonlendirme });
}
