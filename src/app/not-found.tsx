import Link from "next/link";

export default function BulunamadiSayfasi() {
  return (
    <div className="kapsayici max-w-xl py-20 text-center">
      <h1 className="text-3xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-3 text-gri">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
      <Link href="/" className="dugme mt-6">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
