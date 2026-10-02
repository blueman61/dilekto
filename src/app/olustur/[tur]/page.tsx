import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tlYaz } from "@/config/site";
import { SihirbazIstemci as Sihirbaz } from "@/components/Istemci";
import { DILEKCE_TURLERI, turGetir } from "@/lib/dilekce-turleri";

export function generateStaticParams() {
  return DILEKCE_TURLERI.map((t) => ({ tur: t.id }));
}

export async function generateMetadata(props: PageProps<"/olustur/[tur]">): Promise<Metadata> {
  const tur = turGetir((await props.params).tur);
  return tur ? { title: tur.testBasligi, description: tur.aciklama } : {};
}

export default async function OlusturSayfasi(props: PageProps<"/olustur/[tur]">) {
  const tur = turGetir((await props.params).tur);
  if (!tur) notFound();
  return (
    <div className="kapsayici max-w-2xl py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">{tur.ad}</h1>
      <p className="mt-2 mb-8 text-gri">
        Önce ücretsiz testle başvurabileceğinizi kontrol edelim. Sonra olayı anlatın, önizlemeyi ücretsiz
        görün. Dilekçenin tamamı {tlYaz(tur.fiyat)}.
      </p>
      <Sihirbaz turId={tur.id} />
    </div>
  );
}
