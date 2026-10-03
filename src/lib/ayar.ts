// Ortam değişkenlerini (Vercel > Settings > Environment Variables) okur.
// Yapıştırırken araya karışan boşluk, satır sonu ve tırnakları temizler.

export function ayar(ad: string): string | undefined {
  const deger = process.env[ad]?.trim().replace(/^["']|["']$/g, "").trim();
  return deger ? deger : undefined;
}
