import Link from "next/link";
import { Logo } from "./Logo";

export function SiteBaslik({ denemeModu }: { denemeModu: boolean }) {
  return (
    <header className="border-b border-cizgi bg-white">
      {denemeModu && (
        <div className="bg-uyari-zemin px-4 py-2 text-center text-sm text-uyari">
          <strong>Deneme sürümü:</strong> Ödeme adımında kartınızdan para çekilmez.
        </div>
      )}
      <div className="kapsayici flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" aria-label="Dilekto ana sayfa">
          <Logo />
        </Link>
        <nav className="flex items-center gap-5 text-[0.95rem]">
          <Link href="/nasil-calisir" className="hidden text-gri hover:text-murekkep md:inline">
            Nasıl çalışır
          </Link>
          <Link href="/fiyat" className="hidden text-gri hover:text-murekkep md:inline">
            Fiyat
          </Link>
          <Link href="/sss" className="hidden text-gri hover:text-murekkep md:inline">
            Sık sorulanlar
          </Link>
          <Link href="/olustur/hakem-heyeti" className="dugme min-h-10 px-4 py-2 text-[0.95rem]">
            Dilekçe hazırla
          </Link>
        </nav>
      </div>
    </header>
  );
}
