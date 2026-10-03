// Yüklenen fatura fotoğrafını tarayıcıda küçültür (telefon fotoğrafları
// 5-10 MB olabilir). PDF dosyaları olduğu gibi gönderilir.

export type HazirDosya = { tur: string; veri: string /* base64 */ };

const EN_BUYUK_KENAR = 1800;
const EN_BUYUK_PDF = 2_900_000; // bayt

function base64(blob: Blob): Promise<string> {
  return new Promise((coz, reddet) => {
    const okuyucu = new FileReader();
    okuyucu.onload = () => coz(String(okuyucu.result).split(",")[1] ?? "");
    okuyucu.onerror = () => reddet(okuyucu.error);
    okuyucu.readAsDataURL(blob);
  });
}

export async function dosyaHazirla(dosya: File): Promise<HazirDosya> {
  if (dosya.type === "application/pdf") {
    if (dosya.size > EN_BUYUK_PDF) throw new Error("PDF dosyası çok büyük (en fazla 2,9 MB).");
    return { tur: dosya.type, veri: await base64(dosya) };
  }
  if (!dosya.type.startsWith("image/") && !/\.(heic|heif)$/i.test(dosya.name)) {
    throw new Error("Lütfen bir fotoğraf ya da PDF dosyası seçin.");
  }
  try {
    const resim = await createImageBitmap(dosya);
    const oran = Math.min(1, EN_BUYUK_KENAR / Math.max(resim.width, resim.height));
    const tuval = document.createElement("canvas");
    tuval.width = Math.round(resim.width * oran);
    tuval.height = Math.round(resim.height * oran);
    tuval.getContext("2d")!.drawImage(resim, 0, 0, tuval.width, tuval.height);
    resim.close();
    const blob = await new Promise<Blob | null>((coz) => tuval.toBlob(coz, "image/jpeg", 0.85));
    if (!blob) throw new Error("Fotoğraf hazırlanamadı.");
    return { tur: "image/jpeg", veri: await base64(blob) };
  } catch {
    // Tarayıcı açamadıysa (ör. bazı HEIC dosyaları) küçükse olduğu gibi gönder
    if (dosya.size > EN_BUYUK_PDF) {
      throw new Error("Bu fotoğraf açılamadı. Lütfen telefonunuzun kamerasıyla yeniden çekip deneyin.");
    }
    const tur = dosya.type || (/\.heif$/i.test(dosya.name) ? "image/heif" : "image/heic");
    return { tur, veri: await base64(dosya) };
  }
}
