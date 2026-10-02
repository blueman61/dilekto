"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OdemeyeGec({ id, etiket }: { id: string; etiket: string }) {
  const router = useRouter();
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function baslat() {
    setBekliyor(true);
    setHata(null);
    try {
      const yanit = await fetch("/api/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata || "Ödeme başlatılamadı.");
      if (/^https?:\/\//.test(veri.yonlendirme)) window.location.href = veri.yonlendirme;
      else router.push(veri.yonlendirme);
    } catch (e) {
      setHata((e as Error).message);
      setBekliyor(false);
    }
  }

  return (
    <div>
      <button className="dugme w-full text-lg" onClick={baslat} disabled={bekliyor}>
        {bekliyor ? "Yönlendiriliyor…" : etiket}
      </button>
      {hata && (
        <p className="mt-2 text-hata" role="alert">
          {hata}
        </p>
      )}
    </div>
  );
}
