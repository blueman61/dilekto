import Link from "next/link";
import { site } from "@/config/site";
import { Logo } from "./Logo";
import { SORUMLULUK_METNI } from "./Sorumluluk";

export function SiteAlt() {
  return (
    <footer className="mt-16 border-t border-cizgi bg-zemin">
      <div className="kapsayici grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-gri">{site.slogan}.</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Site">
          <Link href="/olustur/hakem-heyeti" className="text-gri hover:text-murekkep">
            Hakem heyeti dilekçesi
          </Link>
          <Link href="/nasil-calisir" className="text-gri hover:text-murekkep">
            Nasıl çalışır
          </Link>
          <Link href="/fiyat" className="text-gri hover:text-murekkep">
            Fiyat
          </Link>
          <Link href="/sss" className="text-gri hover:text-murekkep">
            Sık sorulan sorular
          </Link>
          <Link href="/iletisim" className="text-gri hover:text-murekkep">
            İletişim
          </Link>
        </nav>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Yasal">
          <Link href="/yasal/kvkk" className="text-gri hover:text-murekkep">
            KVKK aydınlatma metni
          </Link>
          <Link href="/yasal/kullanim-sartlari" className="text-gri hover:text-murekkep">
            Kullanım şartları
          </Link>
          <Link href="/yasal/mesafeli-satis" className="text-gri hover:text-murekkep">
            Mesafeli satış sözleşmesi
          </Link>
          <Link href="/yasal/iade" className="text-gri hover:text-murekkep">
            İade koşulları
          </Link>
          <a href={`mailto:${site.eposta}`} className="text-gri hover:text-murekkep">
            {site.eposta}
          </a>
        </nav>
      </div>
      <div className="border-t border-cizgi">
        <p className="kapsayici py-5 text-xs leading-relaxed text-gri">
          {SORUMLULUK_METNI} © {new Date().getFullYear()} {site.ad}
        </p>
      </div>
    </footer>
  );
}
