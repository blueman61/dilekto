"use client";

// Gerçek ödeme formu. Alıcının bilgileri (ad, e-posta, telefon, adres)
// sunucumuza GÖNDERİLMEZ: sunucudan yalnızca imzalı sipariş bilgileri alınır,
// alıcı bilgileri tarayıcıda eklenir ve form doğrudan ödeme sağlayıcısına gider.

import { useState } from "react";
import { ILLER, ilPostaKodu, telefonSadelestir } from "@/lib/dilekce-turleri/ortak";
import { OdemeOnaylari } from "./OdemeOnaylari";

type OdemeFormu = { adres: string; alanlar: Record<string, string>; aliciAlanlari: string[] };

const ALANLAR = [
  { id: "ad", etiket: "Adınız", tip: "text", otomatik: "given-name" },
  { id: "soyad", etiket: "Soyadınız", tip: "text", otomatik: "family-name" },
  { id: "eposta", etiket: "E-posta adresiniz", tip: "email", otomatik: "email" },
  { id: "telefon", etiket: "Cep telefonunuz", tip: "tel", otomatik: "tel" },
] as const;

export function GercekOdemeFormu({ id, saglayiciAdi }: { id: string; saglayiciAdi: string }) {
  const [bilgi, setBilgi] = useState({ ad: "", soyad: "", eposta: "", telefon: "", il: "", adres: "", postaKodu: "" });
  const [onay, setOnay] = useState({ sozlesme: false, cayma: false });
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  function eksikleriBul(): string | null {
    if (!bilgi.ad.trim() || !bilgi.soyad.trim()) return "Lütfen adınızı ve soyadınızı yazın.";
    if (!/^\S+@\S+\.\S+$/.test(bilgi.eposta.trim())) return "Lütfen geçerli bir e-posta adresi yazın.";
    if (!/^5\d{9}$/.test(telefonSadelestir(bilgi.telefon))) return "Lütfen cep telefonunuzu 05xx xxx xx xx biçiminde yazın.";
    if (!bilgi.il || bilgi.adres.trim().length < 5) return "Lütfen il ve adresinizi yazın.";
    if (bilgi.postaKodu && !/^\d{5}$/.test(bilgi.postaKodu.trim())) return "Posta kodu 5 haneli olmalıdır.";
    return null;
  }

  async function odemeyeGec() {
    const eksik = eksikleriBul();
    if (eksik) {
      setHata(eksik);
      return;
    }
    setBekliyor(true);
    setHata(null);
    try {
      const yanit = await fetch("/api/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, onay: true }), // kişisel bilgi gönderilmez
      });
      const veri = (await yanit.json().catch(() => ({}))) as {
        form?: OdemeFormu;
        yonlendirme?: string;
        hata?: string;
        kod?: string;
      };
      if (veri.yonlendirme) {
        window.location.href = veri.yonlendirme;
        return;
      }
      if (!yanit.ok || !veri.form) {
        throw new Error(`${veri.hata ?? "Ödeme başlatılamadı."}${veri.kod ? ` (Hata kodu: ${veri.kod})` : ""}`);
      }

      const postaKodu = bilgi.postaKodu.trim() || ilPostaKodu(bilgi.il);
      const adres = bilgi.adres.replace(/\s+/g, " ").trim();
      const alici: Record<string, string> = {
        buyer_name: bilgi.ad.trim(),
        buyer_surname: bilgi.soyad.trim(),
        buyer_email: bilgi.eposta.trim(),
        buyer_phone: telefonSadelestir(bilgi.telefon),
        billing_address: adres,
        billing_city: bilgi.il,
        billing_postcode: postaKodu,
        shipping_address: adres,
        shipping_city: bilgi.il,
        shipping_postcode: postaKodu,
      };

      const form = document.createElement("form");
      form.method = "POST";
      form.action = veri.form.adres;
      form.acceptCharset = "UTF-8";
      const alanlar = { ...veri.form.alanlar };
      for (const ad of veri.form.aliciAlanlari) alanlar[ad] = alici[ad] ?? "";
      for (const [ad, deger] of Object.entries(alanlar)) {
        const girdi = document.createElement("input");
        girdi.type = "hidden";
        girdi.name = ad;
        girdi.value = deger;
        form.appendChild(girdi);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      setHata((e as Error).message);
      setBekliyor(false);
    }
  }

  const degistir = (alan: keyof typeof bilgi) => (e: { target: { value: string } }) =>
    setBilgi((b) => ({ ...b, [alan]: e.target.value }));

  return (
    <div className="kart mt-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">Fatura bilgileriniz</h2>
        <p className="mt-1 text-sm text-gri">
          Bu bilgiler fatura için doğrudan {saglayiciAdi}&apos;e iletilir; bizim sunucumuzda saklanmaz. Kart
          bilgilerinizi bir sonraki adımda {saglayiciAdi}&apos;in güvenli ödeme sayfasında gireceksiniz.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ALANLAR.map((a) => (
          <div key={a.id}>
            <label htmlFor={`odeme-${a.id}`} className="mb-1 block font-semibold">
              {a.etiket}
            </label>
            <input
              id={`odeme-${a.id}`}
              className="kutu-giris"
              type={a.tip}
              autoComplete={a.otomatik}
              inputMode={a.tip === "tel" ? "tel" : undefined}
              maxLength={a.tip === "email" ? 120 : 60}
              value={bilgi[a.id]}
              onChange={degistir(a.id)}
            />
          </div>
        ))}
        <div>
          <label htmlFor="odeme-il" className="mb-1 block font-semibold">
            İl
          </label>
          <select id="odeme-il" className="kutu-giris" value={bilgi.il} onChange={degistir("il")}>
            <option value="">İl seçin</option>
            {ILLER.map((il) => (
              <option key={il} value={il}>
                {il}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="odeme-posta" className="mb-1 block font-semibold">
            Posta kodu <span className="font-normal text-gri">(biliyorsanız)</span>
          </label>
          <input
            id="odeme-posta"
            className="kutu-giris"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={bilgi.postaKodu}
            onChange={degistir("postaKodu")}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="odeme-adres" className="mb-1 block font-semibold">
            Adresiniz
          </label>
          <textarea
            id="odeme-adres"
            className="kutu-giris"
            rows={2}
            maxLength={200}
            autoComplete="street-address"
            value={bilgi.adres}
            onChange={degistir("adres")}
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-cizgi pt-5">
        <OdemeOnaylari {...onay} degisti={(alan, deger) => setOnay((o) => ({ ...o, [alan]: deger }))} />
      </div>
      <button
        className="dugme w-full text-lg"
        disabled={!onay.sozlesme || !onay.cayma || bekliyor}
        onClick={odemeyeGec}
      >
        {bekliyor ? "Ödeme sayfasına geçiliyor…" : "Güvenli ödeme sayfasına geç"}
      </button>
      {hata && (
        <p className="text-hata" role="alert">
          {hata}
        </p>
      )}
    </div>
  );
}
