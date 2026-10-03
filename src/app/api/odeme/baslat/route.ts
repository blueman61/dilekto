// Gerçek ödeme için imzalı ödeme formunu hazırlar.
// Alıcının kişisel bilgileri bu isteğe EKLENMEZ; tarayıcı onları doğrudan
// ödeme sağlayıcısına gönderir.

import { depo } from "@/lib/depo";
import { turGetir } from "@/lib/dilekce-turleri";
import { hatayiIsle } from "@/lib/hatalar";
import { odemeSaglayicisi } from "@/lib/odeme";

export async function POST(istek: Request) {
  const { id, onay } = (await istek.json().catch(() => ({}))) as { id?: string; onay?: boolean };
  if (onay !== true) {
    return Response.json({ hata: "Devam etmek için onay kutularını işaretleyin." }, { status: 400 });
  }
  try {
    const saglayici = odemeSaglayicisi();
    if (!saglayici.formHazirla) {
      return Response.json({ hata: "Deneme modunda gerçek ödeme başlatılamaz." }, { status: 400 });
    }
    const kayit = id ? await depo().getir(id) : null;
    const tur = kayit ? turGetir(kayit.tur) : undefined;
    if (!kayit || !tur) return Response.json({ hata: "Dilekçe bulunamadı." }, { status: 404 });
    if (kayit.durum === "odendi") return Response.json({ yonlendirme: `/dilekce/${kayit.id}` });
    return Response.json({ form: saglayici.formHazirla(kayit, tur.ad) });
  } catch (e) {
    const { kod, mesaj } = hatayiIsle(e, "odeme-baslat");
    return Response.json({ hata: mesaj, kod }, { status: 503 });
  }
}
