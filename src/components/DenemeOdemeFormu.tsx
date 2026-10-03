"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OdemeOnaylari } from "./OdemeOnaylari";

export function DenemeOdemeFormu({ id }: { id: string }) {
  const router = useRouter();
  const [onay, setOnay] = useState({ sozlesme: false, cayma: false });
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function tamamla() {
    setBekliyor(true);
    setHata(null);
    try {
      const yanit = await fetch("/api/odeme/deneme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, onay: onay.sozlesme && onay.cayma }),
      });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata || "Bir sorun oldu.");
      router.push(veri.yonlendirme);
      router.refresh();
    } catch (e) {
      setHata((e as Error).message);
      setBekliyor(false);
    }
  }

  return (
    <div className="kart mt-6 space-y-4">
      <OdemeOnaylari {...onay} degisti={(alan, deger) => setOnay((o) => ({ ...o, [alan]: deger }))} />
      <button className="dugme w-full text-lg" disabled={!onay.sozlesme || !onay.cayma || bekliyor} onClick={tamamla}>
        {bekliyor ? "Tamamlanıyor…" : "Deneme ödemesini tamamla"}
      </button>
      {hata && (
        <p className="text-hata" role="alert">
          {hata}
        </p>
      )}
    </div>
  );
}
