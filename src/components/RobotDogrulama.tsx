"use client";

// Cloudflare Turnstile robot doğrulaması. Çoğu kullanıcı hiçbir şey görmez;
// yalnızca şüpheli durumlarda tek tıklık bir kutu çıkar.
// NEXT_PUBLIC_TURNSTILE_SITE_KEY ayarlanmamışsa hiçbir şey göstermez.

import { useCallback, useEffect, useRef, useState } from "react";

type Turnstile = {
  render: (kutu: HTMLElement, ayarlar: Record<string, unknown>) => string;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_ANAHTARI = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
let betikYukleniyor: Promise<void> | null = null;

function betikYukle(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  betikYukleniyor ??= new Promise((coz, reddet) => {
    const b = document.createElement("script");
    b.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    b.async = true;
    b.onload = () => coz();
    b.onerror = () => reddet(new Error("Doğrulama yüklenemedi"));
    document.head.appendChild(b);
  });
  return betikYukleniyor;
}

export function useRobotDogrulama() {
  const kutu = useRef<HTMLDivElement>(null);
  const kimlik = useRef<string | null>(null);
  // Koruma kapalıysa jeton boş metindir ve istekler hemen gönderilebilir.
  const [jeton, setJeton] = useState<string | null>(SITE_ANAHTARI ? null : "");

  useEffect(() => {
    if (!SITE_ANAHTARI) return;
    let iptal = false;
    betikYukle()
      .then(() => {
        if (iptal || !kutu.current || !window.turnstile || kimlik.current) return;
        kimlik.current = window.turnstile.render(kutu.current, {
          sitekey: SITE_ANAHTARI,
          language: "tr",
          appearance: "interaction-only",
          callback: (t: string) => setJeton(t),
          "expired-callback": () => setJeton(null),
          "error-callback": () => setJeton(null),
        });
      })
      .catch(() => setJeton(""));
    return () => {
      iptal = true;
    };
  }, []);

  /** Jeton tek kullanımlıktır; her istekten sonra yenilenir. */
  const yenile = useCallback(() => {
    if (SITE_ANAHTARI && kimlik.current && window.turnstile) {
      setJeton(null);
      window.turnstile.reset(kimlik.current);
    }
  }, []);

  const alan = SITE_ANAHTARI ? <div ref={kutu} className="mt-4 flex justify-center" /> : null;
  return { alan, jeton, hazir: jeton !== null, yenile };
}
