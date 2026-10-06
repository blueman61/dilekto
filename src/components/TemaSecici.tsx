"use client";

import { useSyncExternalStore } from "react";
import {
  TEMA_ADLARI,
  TEMA_ANAHTARI,
  TEMA_SIRASI,
  etkinTema,
  gecerliSecim,
  type TemaSecimi,
} from "@/lib/tema";

const dinleyiciler = new Set<() => void>();

function oku(): TemaSecimi {
  try {
    return gecerliSecim(localStorage.getItem(TEMA_ANAHTARI));
  } catch {
    return "sistem";
  }
}

function uygula(secim: TemaSecimi) {
  const koyu = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const tema = etkinTema(secim, koyu);
  document.documentElement.dataset.theme = tema;
  document.documentElement.style.colorScheme = tema;
}

function sec(secim: TemaSecimi) {
  try {
    if (secim === "sistem") localStorage.removeItem(TEMA_ANAHTARI);
    else localStorage.setItem(TEMA_ANAHTARI, secim);
  } catch {
    /* depolama kapalıysa bu oturum için yine de uygulanır */
  }
  uygula(secim);
  dinleyiciler.forEach((d) => d());
}

function abone(bildir: () => void) {
  dinleyiciler.add(bildir);
  const cihaz = window.matchMedia("(prefers-color-scheme: dark)");
  // Cihazın teması değişirse ("cihaz ayarı" seçiliyse) site de değişir
  const cihazDegisti = () => {
    uygula(oku());
    bildir();
  };
  // Başka bir sekmede tema değiştirilirse bu sekme de uyar
  const depoDegisti = (e: StorageEvent) => {
    if (e.key === TEMA_ANAHTARI || e.key === null) cihazDegisti();
  };
  cihaz.addEventListener("change", cihazDegisti);
  window.addEventListener("storage", depoDegisti);
  return () => {
    dinleyiciler.delete(bildir);
    cihaz.removeEventListener("change", cihazDegisti);
    window.removeEventListener("storage", depoDegisti);
  };
}

function useTema(): TemaSecimi {
  return useSyncExternalStore(abone, oku, () => "sistem");
}

function Simge({ secim }: { secim: TemaSecimi }) {
  const ortak = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  if (secim === "acik")
    return (
      <svg {...ortak}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  if (secim === "koyu")
    return (
      <svg {...ortak}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  return (
    <svg {...ortak}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Üst çubuktaki küçük düğme: her basışta Cihaz ayarı → Açık → Koyu sırasıyla değişir. */
export function TemaDugmesi() {
  const secim = useTema();
  const sonraki = TEMA_SIRASI[(TEMA_SIRASI.indexOf(secim) + 1) % TEMA_SIRASI.length];
  return (
    <button
      type="button"
      onClick={() => sec(sonraki)}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-cizgi text-gri transition hover:text-murekkep"
      aria-label={`Görünüm: ${TEMA_ADLARI[secim]}. Değiştirmek için basın (sıradaki: ${TEMA_ADLARI[sonraki]}).`}
      title={`Görünüm: ${TEMA_ADLARI[secim]}`}
    >
      <Simge secim={secim} />
    </button>
  );
}

/** Sayfa altındaki üç seçenekli seçici (ne seçildiği açıkça görünür). */
export function TemaSecici() {
  const secim = useTema();
  return (
    <div role="radiogroup" aria-label="Görünüm" className="inline-flex rounded-xl border border-cizgi p-1 text-sm">
      {TEMA_SIRASI.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={secim === t}
          onClick={() => sec(t)}
          className={`flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold transition ${
            secim === t ? "bg-marka-600 text-white" : "text-gri hover:text-murekkep"
          }`}
        >
          <Simge secim={t} />
          {TEMA_ADLARI[t]}
        </button>
      ))}
    </div>
  );
}
