// Site sahibi için durum kontrolü: ayarların ve bağlantıların çalışıp
// çalışmadığını tek tek dener. Adres: /durum?anahtar=<CRON_SECRET>

import { ayar } from "@/lib/ayar";
import type { Metadata } from "next";
import { taslakUret } from "@/lib/ai";
import { depo } from "@/lib/depo";
import { hakemHeyeti } from "@/lib/dilekce-turleri/hakem-heyeti";
import { DilektoHatasi, type HataKodu } from "@/lib/hatalar";
import { odemeModu } from "@/lib/odeme";
import { robotKorumasiAcik } from "@/lib/robot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Durum kontrolü", robots: { index: false, follow: false } };

const COZUMLER: Partial<Record<HataKodu, string>> = {
  "YZ-AYAR": "Vercel'de GEMINI_API_KEY (veya Claude kullanıyorsanız ANTHROPIC_API_KEY) ayarını ekleyip yeniden yayınlayın.",
  "YZ-ANAHTAR": "Yapay zekâ anahtarı geçersiz. Google AI Studio'da yeni anahtar oluşturup Vercel'deki GEMINI_API_KEY değerini güncelleyin, sonra yeniden yayınlayın.",
  "YZ-MODEL": "Model adı bulunamadı. Vercel'deki GEMINI_MODEL ayarını silin ya da güncel bir model adı yazın.",
  "YZ-KOTA": "Ücretsiz kullanım sınırı dolmuş. Bir süre bekleyin ya da Google AI Studio'da faturalandırmayı açın.",
  "YZ-BAGLANTI":
    "Yapay zekâ yanıt veremedi. Ücretsiz katmanda Google zaman zaman \"model çok yoğun\" (HTTP 503) yanıtı verir; birkaç dakika sonra sayfayı yenileyin. Sürerse yukarıdaki ayrıntı satırını bana gönderin.",
  "YZ-BOLGE":
    "Gemini, sitenin çalıştığı sunucu bölgesinden kullanılamıyor. Vercel > Settings > Functions > Function Region bölümünde Washington, D.C., USA (iad1) seçip yeniden yayınlayın.",
  "YZ-DENETIM": "Yapay zekâ kurallara uygun metin üretemedi. Tekrar deneyin; sürerse bana yazın.",
  "VT-AYAR": "Vercel'de SUPABASE_URL ve SUPABASE_SECRET_KEY ayarlarını ekleyip yeniden yayınlayın.",
  "VT-ANAHTAR": "Supabase, Vercel'deki SUPABASE_SECRET_KEY anahtarını kabul etmedi. Supabase > Project Settings > API Keys bölümünde \"Secret keys\" altındaki anahtarın (sb_secret_ ile başlar) yanındaki kopyala düğmesine basın; Vercel'deki SUPABASE_SECRET_KEY değerini silip bunu yapıştırın. SUPABASE_URL ile anahtarın aynı projeden olduğundan emin olun. Sonra yeniden yayınlayın.",
  "VT-TABLO": "Tablo oluşturulmamış. Supabase > SQL Editor'da supabase/kurulum.sql dosyasının içeriğini çalıştırın.",
  "VT-BAGLANTI": "Supabase'e ulaşılamadı. Vercel'deki SUPABASE_URL değerinin https://xxxx.supabase.co biçiminde olduğunu kontrol edin; Supabase projeniz uykuya geçtiyse \"Restore project\" deyin.",
};

type Sonuc = { ad: string; tamam: boolean; bilgi: string; kod?: HataKodu };

async function dene(ad: string, is: () => Promise<string>): Promise<Sonuc> {
  try {
    return { ad, tamam: true, bilgi: await is() };
  } catch (e) {
    const kod = e instanceof DilektoHatasi ? e.kod : undefined;
    const ayrinti = e instanceof DilektoHatasi && e.detay ? ` — Ayrıntı: ${JSON.stringify(e.detay).slice(0, 900)}` : "";
    return { ad, tamam: false, kod, bilgi: `${(e as Error).message}${ayrinti}` };
  }
}

async function kontrolleriCalistir(): Promise<Sonuc[]> {
  const sonuclar: Sonuc[] = [];
  sonuclar.push(
    await dene("Veritabanı (Supabase): yazma, okuma, silme", async () => {
      const d = depo();
      const test = { amac: "kisisel", karsiTaraf: "firma", alisSekli: "internet", konu: "ayipli_mal", tutar: "100", tarih: "2026-01-01" };
      const kayit = await d.olustur({
        tur: "durum-testi",
        test,
        hikaye: {},
        cikti: { konuOzeti: "durum testi", olaylar: [], talepMetni: "", ekMevzuat: [] },
        saglayici: "durum",
        fiyat: 0,
      });
      const okunan = await d.getir(kayit.id);
      await d.sil(kayit.id);
      if (!okunan) throw new Error("Yazılan kayıt geri okunamadı.");
      return "Kayıt yazıldı, okundu ve silindi.";
    }),
  );
  sonuclar.push(
    await dene("Yapay zekâ: örnek bir dilekçe taslağı", async () => {
      const bas = Date.now();
      const { saglayici, cikti } = await taslakUret(
        hakemHeyeti,
        { amac: "kisisel", karsiTaraf: "firma", alisSekli: "internet", konu: "ayipli_mal", tutar: "12499", tarih: "2026-08-15" },
        {
          urun: "Cep telefonu",
          satici: "Örnek Elektronik A.Ş.",
          olay: "Telefon üç hafta sonra kendiliğinden kapanmaya başladı. Servis ücretsiz onarımı reddetti.",
          bildirim: "evet",
          talep: "iade",
          belgeler: ["fatura"],
        },
      );
      return `${saglayici} ile ${Math.round((Date.now() - bas) / 1000)} saniyede üretildi. Konu: "${cikti.konuOzeti}"`;
    }),
  );

  return sonuclar;
}

export default async function DurumSayfasi(props: PageProps<"/durum">) {
  const { anahtar } = await props.searchParams;
  const sir = ayar("CRON_SECRET");
  if (!sir || anahtar !== sir) {
    return (
      <div className="kapsayici max-w-2xl py-16">
        <h1 className="text-2xl font-bold">Durum kontrolü</h1>
        <p className="mt-3 text-gri">
          Bu sayfayı açmak için adresin sonuna <code>?anahtar=</code> ve Vercel&apos;deki CRON_SECRET değerini ekleyin.
        </p>
      </div>
    );
  }

  const ayarlar = [
    "YAPAY_ZEKA",
    "GEMINI_API_KEY",
    "ANTHROPIC_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SECRET_KEY",
    "CRON_SECRET",
    "ODEME_MODU",
    "TURNSTILE_SECRET_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  ].map((a) => `${a}: ${ayar(a) ? "girilmiş" : "boş"}`);

  const sonuclar = await kontrolleriCalistir();

  return (
    <div className="kapsayici max-w-3xl py-10">
      <h1 className="text-2xl font-bold">Durum kontrolü</h1>
      <div className="mt-6 space-y-4">
        {sonuclar.map((s) => (
          <div key={s.ad} className={`rounded-2xl border-2 p-5 ${s.tamam ? "border-basari bg-basari-zemin" : "border-hata bg-hata-zemin"}`}>
            <p className="font-bold">
              {s.tamam ? "✓" : "✕"} {s.ad}
              {s.kod && <span className="ml-2 rounded bg-white px-2 py-0.5 text-sm">{s.kod}</span>}
            </p>
            <p className="mt-1 text-sm break-words">{s.bilgi}</p>
            {s.kod && COZUMLER[s.kod] && (
              <p className="mt-3 rounded-xl bg-white p-3 text-sm">
                <strong>Ne yapmalı: </strong>
                {COZUMLER[s.kod]}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="kart mt-6 text-sm">
        <p className="font-semibold">Ayarlar (değerler gösterilmez)</p>
        <ul className="mt-2 space-y-1 text-gri">
          {ayarlar.map((a) => (
            <li key={a}>{a}</li>
          ))}
          <li>Ödeme modu: {odemeModu()}</li>
          <li>Robot koruması: {robotKorumasiAcik() ? "açık" : "kapalı"}</li>
        </ul>
      </div>
    </div>
  );
}
