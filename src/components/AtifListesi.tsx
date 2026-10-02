import { atifYaz, mevzuatGetir } from "@/lib/mevzuat";

export function AtifListesi({ idler }: { idler: string[] }) {
  const kayitlar = [...new Set(idler)].map(mevzuatGetir);
  return (
    <section className="kart">
      <h2 className="text-xl font-bold">Dilekçede adı geçen kanun maddeleri</h2>
      <p className="mt-1 text-gri">
        Dilekçenizde yalnızca resmî metniyle kontrol edilmiş maddeler yer alır. Ne anlama geldiklerini aşağıda
        görebilirsiniz.
      </p>
      <div className="mt-4 space-y-3">
        {kayitlar.map((k) => (
          <details key={k.id} className="rounded-xl border border-cizgi p-4">
            <summary className="cursor-pointer">
              <strong>
                {k.kisaAd} {atifYaz(k)}
              </strong>{" "}
              – {k.baslik}
              <span className="block text-sm text-gri">{k.ozet}</span>
            </summary>
            <p className="mt-3 border-t border-cizgi pt-3 font-serif text-sm text-gri">{k.metin}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
