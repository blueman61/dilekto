import Link from "next/link";

/** Telefonda ekranın altında sabit duran "başla" düğmesi */
export function MobilCagri() {
  return (
    <>
      <div className="h-20 md:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-cizgi bg-white/95 p-3 backdrop-blur md:hidden">
        <Link href="/olustur/hakem-heyeti" className="dugme w-full">
          Ücretsiz teste başla
        </Link>
      </div>
    </>
  );
}
