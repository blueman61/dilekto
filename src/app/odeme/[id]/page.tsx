import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { tlYaz } from "@/config/site";
import { DenemeOdemeFormu } from "@/components/DenemeOdemeFormu";
import { GercekOdemeFormu } from "@/components/GercekOdemeFormu";
import { depo } from "@/lib/depo";
import { turGetir } from "@/lib/dilekce-turleri";
import { odemeSaglayicisi } from "@/lib/odeme";

const SAGLAYICI_ADLARI: Record<string, string> = { shopier: "Shopier" };

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ödeme", robots: { index: false, follow: false } };

export default async function OdemeSayfasi(props: PageProps<"/odeme/[id]">) {
  const { id } = await props.params;
  const { durum } = await props.searchParams;
  const kayit = await depo().getir(id);
  const tur = kayit ? turGetir(kayit.tur) : undefined;
  if (!kayit || !tur) redirect("/");
  if (kayit.durum === "odendi") redirect(`/dilekce/${kayit.id}`);
  const saglayici = odemeSaglayicisi();

  return (
    <div className="kapsayici max-w-xl py-8 sm:py-12">
      <h1 className="text-2xl font-bold">Ödeme</h1>
      <div className="kart mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">{tur.ad}</p>
            <p className="text-sm text-gri">{kayit.cikti.konuOzeti}</p>
          </div>
          <p className="text-xl font-bold whitespace-nowrap">{tlYaz(kayit.fiyat)}</p>
        </div>
        <p className="mt-1 text-sm text-gri">KDV dahil, tek seferlik</p>
      </div>

      {(durum === "basarisiz" || durum === "hata") && (
        <p className="mt-6 rounded-2xl border-2 border-hata bg-hata-zemin p-5 text-hata" role="alert">
          {durum === "basarisiz"
            ? "Ödemeniz tamamlanamadı; kartınızdan para çekilmedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin."
            : "Ödemenizin sonucu doğrulanamadı. Kartınızdan para çekildiyse dilekçe sayfanızın adresiyle birlikte bize yazın."}
        </p>
      )}

      {saglayici.gercek ? (
        <GercekOdemeFormu id={kayit.id} saglayiciAdi={SAGLAYICI_ADLARI[saglayici.ad] ?? saglayici.ad} />
      ) : (
        <>
          <div className="mt-6 rounded-2xl border-2 border-uyari bg-uyari-zemin p-5 text-uyari">
            <p className="font-bold">Deneme modu</p>
            <p className="mt-1">
              Site şu an deneme sürümündedir. Kart bilgisi istenmez ve hiçbir ücret alınmaz. Aşağıdaki düğmeye
              basınca dilekçenizin tamamı açılır.
            </p>
          </div>
          <DenemeOdemeFormu id={kayit.id} />
        </>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href={`/dilekce/${kayit.id}`} className="text-marka-700 underline">
          Önizlemeye geri dön
        </Link>
      </p>
    </div>
  );
}
