// Robot koruması (Cloudflare Turnstile). Yapay zekâ isteklerinin otomatik
// araçlarla sömürülmesini, dolayısıyla masrafın artmasını engeller.
//
// İsteğe bağlıdır: TURNSTILE_SECRET_KEY ve NEXT_PUBLIC_TURNSTILE_SITE_KEY
// ayarlanmamışsa koruma kapalıdır ve her istek kabul edilir.

import { ayar } from "@/lib/ayar";

export function robotKorumasiAcik(): boolean {
  return Boolean(ayar("TURNSTILE_SECRET_KEY") && ayar("NEXT_PUBLIC_TURNSTILE_SITE_KEY"));
}

export async function robotDegilMi(jeton: string | undefined, istek: Request): Promise<boolean> {
  if (!robotKorumasiAcik()) return true;
  if (!jeton) return false;
  const govde = new URLSearchParams({ secret: ayar("TURNSTILE_SECRET_KEY")!, response: jeton });
  const ip = istek.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) govde.set("remoteip", ip);
  try {
    const yanit = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: govde,
      signal: AbortSignal.timeout(8000),
    });
    const sonuc = (await yanit.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!sonuc.success) console.warn("Robot doğrulaması başarısız:", sonuc["error-codes"]);
    return sonuc.success === true;
  } catch (e) {
    // Cloudflare'e ulaşılamazsa gerçek kullanıcıları engellememek için geçir
    console.error("Robot doğrulama servisine ulaşılamadı:", e);
    return true;
  }
}
