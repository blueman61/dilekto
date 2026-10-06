import type { KontrolMaddesi } from "@/lib/dilekce-turleri/tipler";

const SIMGE = {
  tamam: { ikon: "✓", sinif: "bg-basari-zemin text-basari", ad: "tamam" },
  uyari: { ikon: "!", sinif: "bg-uyari-zemin text-uyari", ad: "uyarı" },
  eksik: { ikon: "✕", sinif: "bg-hata-zemin text-hata", ad: "eksik" },
} as const;

function Satir({ m }: { m: KontrolMaddesi }) {
  const s = SIMGE[m.durum];
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.sinif}`}
        aria-label={s.ad}
      >
        {s.ikon}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">
          {m.baslik}
          {m.zorunlu && <span className="ml-2 text-xs font-normal text-gri">zorunlu</span>}
        </p>
        {m.durum !== "tamam" && m.ayrinti && <p className="text-sm text-gri">{m.ayrinti}</p>}
        {m.durum !== "tamam" && m.kaynak && <p className="text-xs text-gri">Dayanak: {m.kaynak}</p>}
      </div>
    </li>
  );
}

/** Dilekçenin resmî kurallara göre canlı denetimi (metin düzenlendikçe güncellenir) */
export function KuralKontrolu({ maddeler }: { maddeler: KontrolMaddesi[] }) {
  const eksik = maddeler.filter((m) => m.durum === "eksik");
  const uyari = maddeler.filter((m) => m.durum === "uyari");
  const tamam = maddeler.filter((m) => m.durum === "tamam");
  const zorunluEksik = eksik.filter((m) => m.zorunlu).length;

  return (
    <section className="kart" aria-live="polite">
      <h2 className="text-xl font-bold">Dilekçe kontrol listesi</h2>
      <p
        className={`mt-2 rounded-xl p-3 text-sm ${
          zorunluEksik > 0
            ? "bg-hata-zemin text-hata"
            : eksik.length + uyari.length > 0
              ? "bg-uyari-zemin text-uyari"
              : "bg-basari-zemin text-basari"
        }`}
        role="status"
      >
        {zorunluEksik > 0
          ? `Kanun ve yönetmeliğin istediği ${zorunluEksik} bilgi eksik. Dilekçeyi vermeden önce tamamlayın.`
          : eksik.length + uyari.length > 0
            ? "Zorunlu bilgiler tamam. Aşağıdaki önerilere bir göz atın."
            : "Dilekçeniz resmî kurallara göre eksiksiz görünüyor. İmzalamayı unutmayın."}
      </p>
      {eksik.length + uyari.length > 0 && (
        <ul className="mt-4 space-y-3">
          {[...eksik, ...uyari].map((m) => (
            <Satir key={m.id} m={m} />
          ))}
        </ul>
      )}
      {tamam.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-marka-700">
            Tamam olanlar ({tamam.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {tamam.map((m) => (
              <Satir key={m.id} m={m} />
            ))}
          </ul>
        </details>
      )}
      <p className="mt-4 text-xs text-gri">
        Bu denetim, dilekçenin biçimini ve zorunlu bilgilerini kontrol eder; başvurunun sonucu hakkında bir şey söylemez.
        Denetim tarayıcınızda yapılır, bilgileriniz sunucuya gönderilmez.
      </p>
    </section>
  );
}
