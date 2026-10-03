// Shopier ödeme sonucu. Ödeme bitince Shopier, kullanıcının tarayıcısı
// üzerinden bu adrese imzalı bir form gönderir. Shopier panelinde
// "Geri dönüş adresi" olarak https://<site>/api/odeme/shopier girilmelidir.

import { depo } from "@/lib/depo";
import { hatayiIsle } from "@/lib/hatalar";
import { odemeModu } from "@/lib/odeme";
import { donusImzasiGecerliMi, donusuOku } from "@/lib/odeme/shopier";

function yonlendir(istek: Request, yol: string) {
  return Response.redirect(new URL(yol, istek.url), 303);
}

export async function POST(istek: Request) {
  if (odemeModu() !== "shopier") return new Response("Shopier ödemesi kapalı.", { status: 404 });

  const form = await istek.formData().catch(() => null);
  if (!form) return new Response("Geçersiz istek.", { status: 400 });
  const donus = donusuOku(form);

  try {
    if (!donusImzasiGecerliMi(donus)) {
      console.warn("Shopier: geçersiz imza", { siparisNo: donus.siparisNo, durum: donus.durum });
      return new Response("Geçersiz imza.", { status: 400 });
    }
    const d = depo();
    const kayit = await d.getir(donus.siparisNo);
    if (!kayit) {
      // Ödeme alınmış ama dilekçe bulunamıyorsa (ör. süresi dolmuş) kayıtlara düş
      console.error("Shopier: ödeme var, dilekçe yok", { siparisNo: donus.siparisNo, odemeNo: donus.odemeNo });
      return yonlendir(istek, "/iletisim?odeme=sorun");
    }
    if (donus.durum.toLowerCase() !== "success") {
      return yonlendir(istek, `/odeme/${kayit.id}?durum=basarisiz`);
    }
    await d.odemeIsle(kayit.id, {
      saglayici: "shopier",
      referans: donus.odemeNo || "bilinmiyor",
      tarih: new Date().toISOString(),
    });
    return yonlendir(istek, `/dilekce/${kayit.id}`);
  } catch (e) {
    hatayiIsle(e, "shopier-donus");
    return yonlendir(istek, `/odeme/${encodeURIComponent(donus.siparisNo)}?durum=hata`);
  }
}
