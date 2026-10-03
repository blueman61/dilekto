// Süresi dolan dilekçeleri siler. Vercel her gece bir kez çağırır (vercel.json).

import { ayar } from "@/lib/ayar";
import { depo } from "@/lib/depo";

export async function GET(istek: Request) {
  const sir = ayar("CRON_SECRET");
  if (!sir || istek.headers.get("authorization") !== `Bearer ${sir}`) {
    return Response.json({ hata: "Yetkisiz." }, { status: 401 });
  }
  const silinen = await depo().suresiDolanlariSil();
  return Response.json({ silinen });
}
