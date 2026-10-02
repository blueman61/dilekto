"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DenemeOdemeFormu({ id }: { id: string }) {
  const router = useRouter();
  const [sozlesme, setSozlesme] = useState(false);
  const [cayma, setCayma] = useState(false);
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function tamamla() {
    setBekliyor(true);
    setHata(null);
    try {
      const yanit = await fetch("/api/odeme/deneme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, onay: sozlesme && cayma }),
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
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-marka-600"
          checked={sozlesme}
          onChange={(e) => setSozlesme(e.target.checked)}
        />
        <span>
          <Link href="/yasal/mesafeli-satis" target="_blank" className="text-marka-700 underline">
            Ön bilgilendirme metnini ve mesafeli satış sözleşmesini
          </Link>{" "}
          okudum, kabul ediyorum.
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-marka-600"
          checked={cayma}
          onChange={(e) => setCayma(e.target.checked)}
        />
        <span>
          Dilekçemin ödemeden hemen sonra elektronik ortamda teslim edileceğini ve bu nedenle cayma hakkımın
          bulunmadığını biliyorum.{" "}
          <Link href="/yasal/iade" target="_blank" className="text-marka-700 underline">
            İade koşulları
          </Link>
        </span>
      </label>
      <button className="dugme w-full text-lg" disabled={!sozlesme || !cayma || bekliyor} onClick={tamamla}>
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
