// Yüklenen faturayı okur ve bilgileri döndürür. Dosya SAKLANMAZ.

import { EN_BUYUK_BELGE_BASE64, faturaOku, IZINLI_BELGE_TURLERI } from "@/lib/ai/fatura";
import { hatayiIsle } from "@/lib/hatalar";
import { robotDegilMi } from "@/lib/robot";

export const maxDuration = 60;

export async function POST(istek: Request) {
  const govde = (await istek.json().catch(() => null)) as {
    dosya?: { tur?: string; veri?: string };
    robotJetonu?: string;
  } | null;
  const tur = govde?.dosya?.tur ?? "";
  const veri = govde?.dosya?.veri ?? "";

  if (!IZINLI_BELGE_TURLERI.includes(tur) || !veri || !/^[A-Za-z0-9+/=]+$/.test(veri)) {
    return Response.json({ hata: "Lütfen faturanızın fotoğrafını (JPG, PNG) ya da PDF dosyasını yükleyin." }, { status: 400 });
  }
  if (veri.length > EN_BUYUK_BELGE_BASE64) {
    return Response.json({ hata: "Dosya çok büyük. Lütfen daha küçük bir fotoğraf yükleyin." }, { status: 413 });
  }
  if (!(await robotDegilMi(govde?.robotJetonu, istek))) {
    return Response.json({ hata: "Güvenlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin." }, { status: 403 });
  }

  try {
    const bilgi = await faturaOku({ tur, veri });
    return Response.json({ bilgi });
  } catch (e) {
    const { kod, mesaj } = hatayiIsle(e, "fatura");
    return Response.json({ hata: mesaj, kod }, { status: kod === "BELGE-OKUNAMADI" ? 422 : 503 });
  }
}
