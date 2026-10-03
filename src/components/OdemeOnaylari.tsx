"use client";

import Link from "next/link";

/** Ödemeden önce alınması gereken iki onay (deneme ve gerçek ödemede aynı) */
export function OdemeOnaylari({
  sozlesme,
  cayma,
  degisti,
}: {
  sozlesme: boolean;
  cayma: boolean;
  degisti: (alan: "sozlesme" | "cayma", deger: boolean) => void;
}) {
  return (
    <>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-marka-600"
          checked={sozlesme}
          onChange={(e) => degisti("sozlesme", e.target.checked)}
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
          onChange={(e) => degisti("cayma", e.target.checked)}
        />
        <span>
          Dilekçemin ödemeden hemen sonra elektronik ortamda teslim edileceğini ve bu nedenle cayma hakkımın
          bulunmadığını biliyorum.{" "}
          <Link href="/yasal/iade" target="_blank" className="text-marka-700 underline">
            İade koşulları
          </Link>
        </span>
      </label>
    </>
  );
}
