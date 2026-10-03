// Ana sayfa ve tanıtım sayfalarında ortak bölümler.

import Link from "next/link";
import { ADIMLAR, ALACAKLARINIZ, FIYAT, SSS } from "@/content/genel";

export function AdimListesi() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ADIMLAR.map((a, i) => (
        <li key={a.baslik} className="kart">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marka-600 font-bold text-white">
            {i + 1}
          </span>
          <h3 className="mt-3 font-semibold">{a.baslik}</h3>
          <p className="mt-1 text-gri">{a.metin}</p>
        </li>
      ))}
    </ol>
  );
}

export function FiyatKarti() {
  return (
    <div className="kart border-2 border-marka-600">
      <p className="font-semibold text-marka-700">{FIYAT.ad}</p>
      <p className="mt-2 text-4xl font-bold">
        {FIYAT.metin}
        <span className="ml-2 text-base font-normal text-gri">tek seferlik, KDV dahil</span>
      </p>
      <ul className="mt-5 space-y-2">
        {ALACAKLARINIZ.map((m) => (
          <li key={m} className="flex gap-2">
            <span className="text-basari" aria-hidden="true">
              ✓
            </span>
            {m}
          </li>
        ))}
      </ul>
      <Link href="/olustur/hakem-heyeti" className="dugme mt-6 w-full">
        Ücretsiz teste başla
      </Link>
    </div>
  );
}

export function SssListesi({ adet }: { adet?: number }) {
  return (
    <div className="space-y-3">
      {SSS.slice(0, adet).map((x) => (
        <details key={x.s} className="kart group p-0 sm:p-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
            {x.s}
            <span className="text-xl text-marka-600 transition group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="px-5 pb-5 text-gri">{x.c}</p>
        </details>
      ))}
    </div>
  );
}

/** Sayfa sonunda tekrar eden çağrı kutusu */
export function BaslaKutusu() {
  return (
    <div className="kart mt-10 flex flex-col items-start gap-4 bg-marka-50 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-bold">Başvurabilir misiniz? Hemen öğrenin.</p>
        <p className="text-gri">Test ücretsizdir ve 1 dakika sürer.</p>
      </div>
      <Link href="/olustur/hakem-heyeti" className="dugme shrink-0">
        Ücretsiz teste başla
      </Link>
    </div>
  );
}
