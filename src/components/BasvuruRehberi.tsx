"use client";

import { useState } from "react";
import { RESMI_ADRESLER, eDevletAciklamasi } from "@/lib/dilekce-turleri/hakem-heyeti/basvuru";
import type { BasvuruYolu } from "@/lib/dilekce-turleri/tipler";

type Props = {
  yollar: BasvuruYolu[];
  sonrasi: string[];
  /** Dilekçenin güncel metni (e-Devlet açıklaması için) */
  metin: string;
  il?: string;
};

function Liste({ ogeler, numarali = false }: { ogeler: string[]; numarali?: boolean }) {
  const Etiket = numarali ? "ol" : "ul";
  return (
    <Etiket className="space-y-2">
      {ogeler.map((o, i) => (
        <li key={o} className="flex gap-3">
          {numarali ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marka-600 text-sm font-bold text-white">
              {i + 1}
            </span>
          ) : (
            <span className="mt-0.5 text-marka-600" aria-hidden="true">
              •
            </span>
          )}
          <span>{o}</span>
        </li>
      ))}
    </Etiket>
  );
}

/** Ödemeden sonra: dilekçeyi nereye ve nasıl vereceğiniz (e-Devlet, elden, posta) */
export function BasvuruRehberi({ yollar, sonrasi, metin, il }: Props) {
  const [secili, setSecili] = useState<BasvuruYolu["id"]>("edevlet");
  const [kopyalandi, setKopyalandi] = useState<"evet" | "hata" | null>(null);
  const yol = yollar.find((y) => y.id === secili) ?? yollar[0];

  async function kopyala() {
    const aciklama = eDevletAciklamasi(metin);
    try {
      await navigator.clipboard.writeText(aciklama);
      setKopyalandi("evet");
    } catch {
      setKopyalandi("hata");
    }
    setTimeout(() => setKopyalandi(null), 4000);
  }

  return (
    <section className="kart" aria-labelledby="basvuru-baslik">
      <h2 id="basvuru-baslik" className="text-xl font-bold">
        Dilekçeyi nereye, nasıl vereceksiniz?
      </h2>
      <p className="mt-1 text-gri">
        Üç yol var. Size uygun olanı seçin; hepsi ücretsizdir.
        {il ? ` Başvuru yeriniz: ${il} Tüketici Hakem Heyeti.` : ""}
      </p>

      <div role="tablist" aria-label="Başvuru yolları" className="mt-4 grid gap-2 sm:grid-cols-3">
        {yollar.map((y) => (
          <button
            key={y.id}
            role="tab"
            id={`sekme-${y.id}`}
            aria-selected={secili === y.id}
            aria-controls={`panel-${y.id}`}
            onClick={() => setSecili(y.id)}
            className={`rounded-xl border-2 px-3 py-3 text-left font-semibold transition ${
              secili === y.id ? "border-marka-600 bg-marka-50 text-marka-700" : "border-cizgi hover:border-marka-200"
            }`}
          >
            {y.baslik}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${yol.id}`} aria-labelledby={`sekme-${yol.id}`} className="mt-5 space-y-5">
        <p className="text-gri">{yol.ozet}</p>

        <div>
          <h3 className="font-semibold">Önce hazırlayın</h3>
          <div className="mt-2">
            <Liste ogeler={yol.hazirlik} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Adım adım</h3>
          <div className="mt-2">
            <Liste ogeler={yol.adimlar} numarali />
          </div>
          {yol.id === "edevlet" && (
            <div className="mt-4">
              <button type="button" className="dugme-ikincil" onClick={kopyala}>
                Açıklama metnini kopyala
              </button>
              <span className="ml-3 text-sm" role="status">
                {kopyalandi === "evet" && <span className="text-basari">Kopyalandı. e-Devlet formuna yapıştırın.</span>}
                {kopyalandi === "hata" && (
                  <span className="text-hata">Kopyalanamadı. Dilekçe metninden &quot;AÇIKLAMALAR&quot; bölümünü elle seçin.</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Başvurduktan sonra</h3>
          <div className="mt-2">
            <Liste ogeler={yol.sonra} />
          </div>
        </div>

        {yol.notlar.length > 0 && (
          <ul className="space-y-1 border-t border-cizgi pt-4 text-sm text-gri">
            {yol.notlar.map((n) => (
              <li key={n}>• {n}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-zemin p-4 text-sm">
        <p className="font-semibold">Heyetin adresini bulamıyor musunuz?</p>
        <ul className="mt-2 space-y-1 text-gri">
          <li>
            • Ticaret Bakanlığı il müdürlükleri listesi:{" "}
            <a className="text-marka-700 underline" href="https://ticaret.gov.tr/iletisim/il-mudurlukleri" target="_blank" rel="noopener noreferrer">
              {RESMI_ADRESLER.ilMudurlukleri}
            </a>
          </li>
          <li>
            • Tüketici Danışma Hattı:{" "}
            <a className="text-marka-700 underline" href="tel:175">
              {RESMI_ADRESLER.aloHatti} (175)
            </a>
          </li>
          <li>
            • e-Devlet:{" "}
            <a className="text-marka-700 underline" href="https://www.turkiye.gov.tr" target="_blank" rel="noopener noreferrer">
              turkiye.gov.tr
            </a>
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Başvurudan sonra ne olur?</h3>
        <ul className="mt-2 space-y-2 text-gri">
          {sonrasi.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-marka-600" aria-hidden="true">
                •
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
