// Sitenin her yerinde görünen açıklama notu.

export const SORUMLULUK_METNI =
  "Dilekto, dilekçenizi kendiniz hazırlamanız için bir yazı aracıdır. Kişiye özel görüş vermez, sizi hiçbir kurum önünde temsil etmez ve başvurunuzun sonucu hakkında söz vermez. Dilekçenizi göndermeden önce okuyup kontrol etmek size aittir.";

export function SorumlulukNotu({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-xl border border-cizgi bg-zemin p-4 text-sm text-gri ${className}`}>
      <strong className="text-murekkep">Önemli not: </strong>
      {SORUMLULUK_METNI}
    </p>
  );
}
