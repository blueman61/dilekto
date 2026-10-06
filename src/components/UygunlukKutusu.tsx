import type { UygunlukSonucu } from "@/lib/dilekce-turleri/tipler";

const STIL = {
  uygun: { kutu: "border-basari bg-basari-zemin", ikon: "✓", renk: "text-basari" },
  uyarili: { kutu: "border-uyari bg-uyari-zemin", ikon: "!", renk: "text-uyari" },
  "uygun-degil": { kutu: "border-hata bg-hata-zemin", ikon: "✕", renk: "text-hata" },
};

export function UygunlukKutusu({ sonuc }: { sonuc: UygunlukSonucu }) {
  const s = STIL[sonuc.durum];
  return (
    <div className={`rounded-2xl border-2 p-5 sm:p-6 ${s.kutu}`} role="status">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yuzey text-lg font-bold ${s.renk}`}
          aria-hidden="true"
        >
          {s.ikon}
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide text-gri uppercase">Test sonucu</p>
          <h2 className={`text-lg leading-snug font-bold sm:text-xl ${s.renk}`}>{sonuc.baslik}</h2>
          <ul className="mt-2 space-y-2">
            {sonuc.aciklamalar.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
