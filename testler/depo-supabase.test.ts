// Supabase gibi davranan sahte bir sunucuyla kayıt deposunun hata ayrımını sınar.
import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { depo } from "@/lib/depo";

function sahteSupabase(durum: number, govde: object) {
  const sunucu = http.createServer((istek, yanit) => {
    yanit.writeHead(durum, { "content-type": "application/json" });
    yanit.end(istek.method === "HEAD" ? undefined : JSON.stringify(govde));
  });
  return new Promise<{ adres: string; kapat: () => void }>((coz) =>
    sunucu.listen(0, () =>
      coz({ adres: `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`, kapat: () => sunucu.close() }),
    ),
  );
}

const eskiOrtam = { ...process.env };
afterEach(() => {
  process.env = { ...eskiOrtam };
  delete (globalThis as { __dilektoDepo?: unknown }).__dilektoDepo;
});

describe("Supabase deposu", () => {
  it.each([
    [401, { message: "Invalid API key" }, "VT-ANAHTAR"],
    [404, { message: "Could not find the table", code: "PGRST205" }, "VT-TABLO"],
  ])("günlük sayımda HTTP %i → %s", async (durum, govde, kod) => {
    const s = await sahteSupabase(durum, govde);
    process.env.SUPABASE_URL = s.adres;
    process.env.SUPABASE_SECRET_KEY = "sb_secret_deneme";
    await expect(depo().bugunOlusturulan()).rejects.toMatchObject({ kod });
    s.kapat();
  });
});
