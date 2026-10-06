import type { Metadata } from "next";
import Link from "next/link";
import { tlYaz } from "@/config/site";
import { AtifListesi } from "@/components/AtifListesi";
import { DuzenleyiciIstemci as Duzenleyici } from "@/components/Istemci";
import { SorumlulukNotu } from "@/components/Sorumluluk";
import { UygunlukKutusu } from "@/components/UygunlukKutusu";
import { depo } from "@/lib/depo";
import { turGetir } from "@/lib/dilekce-turleri";
import { denemeModundaMi } from "@/lib/odeme";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dilekçeniz", robots: { index: false, follow: false } };

function BulunamadiKutusu() {
  return (
    <div className="kapsayici max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold">Dilekçe bulunamadı</h1>
      <p className="mt-3 text-gri">
        Adres yanlış olabilir ya da dilekçenin saklama süresi dolduğu için silinmiş olabilir.
      </p>
      <Link href="/olustur/hakem-heyeti" className="dugme mt-6">
        Yeni dilekçe hazırla
      </Link>
    </div>
  );
}

export default async function DilekceSayfasi(props: PageProps<"/dilekce/[id]">) {
  const { id } = await props.params;
  const kayit = await depo().getir(id);
  const tur = kayit ? turGetir(kayit.tur) : undefined;
  if (!kayit || !tur) return <BulunamadiKutusu />;

  const silinme = new Date(kayit.silinecek).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const izinli = new Set(tur.yapayZeka.secilebilirMevzuat(kayit.test, kayit.hikaye));
  const atiflar = [
    ...tur.yapayZeka.zorunluMevzuat(kayit.test, kayit.hikaye),
    ...kayit.cikti.ekMevzuat.filter((x) => izinli.has(x)),
  ];

  // ---- Ödeme yapıldı: dilekçenin tamamı ----
  if (kayit.durum === "odendi") {
    return (
      <div className="kapsayici max-w-3xl py-8 sm:py-12">
        <p className="mb-4 rounded-xl bg-basari-zemin p-4 text-basari" role="status">
          <strong>Dilekçeniz hazır.</strong>{" "}
          {kayit.odeme?.saglayici === "deneme" ? "(Deneme ödemesi: kartınızdan para çekilmedi.) " : ""}
          Bu sayfanın adresini kaydedin; {silinme} tarihine kadar buradan yeniden indirebilirsiniz.
        </p>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{tur.ad}</h1>
        <Duzenleyici id={kayit.id} turId={tur.id} test={kayit.test} hikaye={kayit.hikaye} cikti={kayit.cikti} />
        <div className="mt-8 space-y-8">
          <AtifListesi idler={atiflar} />
          <SorumlulukNotu />
        </div>
      </div>
    );
  }

  // ---- Ödeme öncesi: ücretsiz önizleme ----
  // Güvenlik: Metnin tamamı ödeme yapılmadan tarayıcıya hiç gönderilmez.
  const ilkParagraf = kayit.cikti.olaylar[0] ?? "";
  const gizliParagraf = Math.max(kayit.cikti.olaylar.length - 1, 0);
  const belgeSayisi = tur.belgeListesi(kayit.test, kayit.hikaye).length;

  return (
    <div className="kapsayici max-w-3xl py-8 sm:py-12">
      <UygunlukKutusu sonuc={tur.uygunluk(kayit.test, new Date(kayit.olusturma))} />

      <h1 className="mt-8 text-2xl font-bold">Dilekçenizin önizlemesi</h1>
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-cizgi bg-kagit p-6 font-serif text-kagit-yazi shadow-sm sm:p-10">
        <p className="text-center font-bold">[İL / İLÇE] TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA</p>
        <p className="mt-6">
          <strong>KONU:</strong> {kayit.cikti.konuOzeti}
        </p>
        <p className="mt-4 font-bold">AÇIKLAMALAR:</p>
        <p className="mt-2">1. {ilkParagraf}</p>
        <div className="mt-4 space-y-3 blur-[4px] select-none" aria-hidden="true">
          {Array.from({ length: Math.max(gizliParagraf, 2) * 3 + 6 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-kagit-yazi/15" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-2/3 items-end justify-center bg-gradient-to-t from-kagit via-kagit/90 to-transparent p-6">
          <p className="rounded-full bg-kagit-yazi px-4 py-2 text-sm font-semibold text-kagit">
            Dilekçenin devamı ödemeden sonra açılır
          </p>
        </div>
      </div>

      <div className="kart mt-8 border-2 border-marka-600">
        <h2 className="text-xl font-bold">Dilekçenin tamamını açın</h2>
        <ul className="mt-4 space-y-2">
          {[
            `Size özel dilekçenin tamamı (${gizliParagraf + 1} paragraf açıklama, kanun maddeleri ve talebiniz)`,
            "Metni düzenleme, PDF ve Word olarak indirme",
            `Eklemeniz gereken ${belgeSayisi} belgenin listesi ve ipuçları`,
            "e-Devlet'ten başvuru için adım adım anlatım",
          ].map((m) => (
            <li key={m} className="flex gap-2">
              <span className="text-basari" aria-hidden="true">✓</span>
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-3xl font-bold">
          {tlYaz(kayit.fiyat)} <span className="text-base font-normal text-gri">tek seferlik, KDV dahil</span>
        </p>
        <div className="mt-5">
          <Link href={`/odeme/${kayit.id}`} className="dugme w-full text-lg">
            {denemeModundaMi() ? "Devam et (deneme ödemesi)" : `${tlYaz(kayit.fiyat)} öde ve dilekçemi aç`}
          </Link>
        </div>
        <p className="mt-3 text-sm text-gri">
          Bu sayfanın adresini kaydederseniz {silinme} tarihine kadar dilekçenize buradan ulaşabilirsiniz.
        </p>
      </div>

      <SorumlulukNotu className="mt-8" />
    </div>
  );
}
