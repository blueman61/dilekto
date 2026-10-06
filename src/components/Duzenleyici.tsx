"use client";

import { useEffect, useMemo, useState } from "react";
import { turGetir } from "@/lib/dilekce-turleri";
import { ILLER, tcGecerliMi } from "@/lib/dilekce-turleri/ortak";
import { zorunluEksikler } from "@/lib/dilekce-turleri/hakem-heyeti/kurallar";
import type { Cevaplar, Kisisel, TaslakCiktisi } from "@/lib/dilekce-turleri/tipler";
import { dosyaAdi, dosyaIndir } from "@/lib/belge/bicim";
import { BasvuruRehberi } from "./BasvuruRehberi";
import { KuralKontrolu } from "./KuralKontrolu";

type Props = {
  id: string;
  turId: string;
  test: Cevaplar;
  hikaye: Cevaplar;
  cikti: TaslakCiktisi;
};

// Kişisel bilgiler ve düzenlenen metin yalnızca bu tarayıcıda saklanır.
function yerelOku<T>(anahtar: string): T | null {
  try {
    const v = localStorage.getItem(anahtar);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function yerelYaz(anahtar: string, deger: unknown) {
  try {
    localStorage.setItem(anahtar, JSON.stringify(deger));
  } catch {}
}
function yerelSil(anahtar: string) {
  try {
    localStorage.removeItem(anahtar);
  } catch {}
}

export function Duzenleyici({ id, turId, test, hikaye, cikti }: Props) {
  const tur = turGetir(turId)!;
  const anahtar = `dilekto:${id}`;

  // Bu bileşen yalnızca tarayıcıda çalışır; kayıt ilk açılışta okunur.
  const [kayit] = useState(() =>
    yerelOku<{ kisisel: Kisisel; metin: string; duzenlendi: boolean }>(anahtar),
  );
  const [kisisel, setKisisel] = useState<Kisisel>(kayit?.kisisel ?? {});
  // Kullanıcı metni elle düzenlediyse onun metni, düzenlemediyse otomatik metin gösterilir.
  const [elleMetin, setElleMetin] = useState<string | null>(
    kayit?.duzenlendi && kayit.metin ? kayit.metin : null,
  );
  const [indiriliyor, setIndiriliyor] = useState<"pdf" | "word" | null>(null);
  const [indirmeHatasi, setIndirmeHatasi] = useState<string | null>(null);
  const [silindi, setSilindi] = useState(false);

  const uretilen = useMemo(
    () => tur.metinOlustur({ test, hikaye, cikti, kisisel, tarih: new Date() }),
    [tur, test, hikaye, cikti, kisisel],
  );
  const duzenlendi = elleMetin !== null;
  const metin = elleMetin ?? uretilen;

  useEffect(() => {
    if (!silindi) yerelYaz(anahtar, { kisisel, metin, duzenlendi });
  }, [anahtar, kisisel, metin, duzenlendi, silindi]);

  const kontrol = useMemo(() => tur.metniDenetle(metin), [tur, metin]);
  const eksikZorunlu = zorunluEksikler(kontrol);
  const tcUyari = kisisel.tcKimlik && !tcGecerliMi(kisisel.tcKimlik.trim());

  async function indir(tip: "pdf" | "word") {
    setIndiriliyor(tip);
    setIndirmeHatasi(null);
    try {
      if (tip === "pdf") {
        const { pdfOlustur } = await import("@/lib/belge/pdf");
        dosyaIndir(await pdfOlustur(metin), dosyaAdi(`${tur.id}-dilekcesi`, "pdf"));
      } else {
        const { wordOlustur } = await import("@/lib/belge/word");
        dosyaIndir(await wordOlustur(metin), dosyaAdi(`${tur.id}-dilekcesi`, "docx"));
      }
    } catch (e) {
      console.error(e);
      setIndirmeHatasi("Dosya oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIndiriliyor(null);
    }
  }

  function cihazdanSil() {
    if (!confirm("Bu cihazdaki kişisel bilgileriniz ve düzenlemeleriniz silinsin mi?")) return;
    yerelSil(anahtar);
    setSilindi(true);
    setKisisel({});
    setElleMetin(null);
  }

  const belgeler = tur.belgeListesi(test, hikaye);

  return (
    <div className="space-y-8">
      {/* 1. Kişisel bilgiler */}
      <section className="kart">
        <h2 className="text-xl font-bold">1. Bilgilerinizi yazın</h2>
        <p className="mt-1 text-gri">
          Bu bilgiler sunucumuza gönderilmez; yalnızca bu cihazda dilekçenize eklenir.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {tur.kisiselAlanlar.map((a) => {
            const ortak = {
              id: `alan-${a.id}`,
              className: "kutu-giris",
              value: kisisel[a.id] ?? "",
              placeholder: a.ornek,
              onChange: (e: { target: { value: string } }) => {
                setSilindi(false);
                setKisisel((k) => ({ ...k, [a.id]: e.target.value }));
              },
            };
            return (
              <div key={a.id} className={a.tip === "uzunMetin" ? "sm:col-span-2" : ""}>
                <label htmlFor={`alan-${a.id}`} className="mb-1 block font-semibold">
                  {a.etiket}
                </label>
                {a.tip === "uzunMetin" ? (
                  <textarea {...ortak} rows={2} maxLength={300} autoComplete="street-address" />
                ) : a.tip === "il" ? (
                  <select {...ortak}>
                    <option value="">İl seçin</option>
                    {ILLER.map((il) => (
                      <option key={il} value={il}>
                        {il}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...ortak}
                    maxLength={a.tip === "tc" ? 11 : 150}
                    inputMode={a.tip === "tc" || a.tip === "telefon" ? "numeric" : undefined}
                    type={a.tip === "eposta" ? "email" : a.tip === "telefon" ? "tel" : "text"}
                    autoComplete={
                      a.id === "adSoyad" ? "name" : a.tip === "telefon" ? "tel" : a.tip === "eposta" ? "email" : "off"
                    }
                  />
                )}
                {a.tip === "tc" && tcUyari && (
                  <p className="mt-1 text-sm text-uyari">
                    Bu numara geçerli görünmüyor. Lütfen kontrol edin.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Metin */}
      <section className="kart">
        <h2 className="text-xl font-bold">2. Dilekçenizi okuyun, gerekirse düzeltin</h2>
        <p className="mt-1 text-gri">
          Metnin her yerini değiştirebilirsiniz. Köşeli parantez içindeki [ ] yerleri doldurmayı unutmayın.
        </p>
        {duzenlendi && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-marka-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>Metni elle düzenlediniz. Yukarıdaki bilgileri değiştirirseniz metin kendiliğinden güncellenmez.</span>
            <button
              type="button"
              className="shrink-0 font-semibold text-marka-700 underline"
              onClick={() => {
                if (confirm("Elle yaptığınız düzenlemeler silinecek ve metin baştan oluşturulacak. Emin misiniz?")) {
                  setElleMetin(null);
                }
              }}
            >
              Metni baştan oluştur
            </button>
          </div>
        )}
        <textarea
          aria-label="Dilekçe metni"
          className="kutu-giris mt-4 min-h-[36rem] font-serif text-[0.95rem] leading-relaxed"
          value={metin}
          onChange={(e) => setElleMetin(e.target.value)}
        />
      </section>

      {/* Resmî kurallara göre canlı kontrol */}
      <KuralKontrolu maddeler={kontrol} />

      {/* 3. İndir */}
      <section className="kart">
        <h2 className="text-xl font-bold">3. İndirin ve yazdırın</h2>
        {eksikZorunlu.length > 0 && (
          <p className="mt-3 rounded-xl bg-uyari-zemin p-4 text-sm text-uyari" role="status">
            Eksik zorunlu bilgiler: {eksikZorunlu.map((m) => m.baslik).join(", ")}. Yine de indirebilirsiniz; eksik yerler
            köşeli parantezle görünür.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button className="dugme" disabled={indiriliyor !== null} onClick={() => indir("pdf")}>
            {indiriliyor === "pdf" ? "Hazırlanıyor…" : "PDF olarak indir"}
          </button>
          <button className="dugme-ikincil" disabled={indiriliyor !== null} onClick={() => indir("word")}>
            {indiriliyor === "word" ? "Hazırlanıyor…" : "Word olarak indir"}
          </button>
        </div>
        {indirmeHatasi && (
          <p className="mt-3 text-hata" role="alert">
            {indirmeHatasi}
          </p>
        )}
        <ul className="mt-3 space-y-1 text-sm text-gri">
          <li>• e-Devlet&apos;e yüklemek için PDF&apos;i, bilgisayarda düzenlemeye devam etmek için Word&apos;ü kullanın.</li>
          <li>
            • Elden ya da posta ile vereceksiniz: A4 beyaz kâğıda, tek yüze, en az 2 nüsha çıktı alın ve &quot;İmza&quot; yerini
            mavi ya da siyah tükenmez kalemle imzalayın.
          </li>
        </ul>
      </section>

      {/* Belgeler */}
      <section className="kart">
        <h2 className="text-xl font-bold">Eklemeniz gereken belgeler</h2>
        <ul className="mt-4 space-y-3">
          {belgeler.map((b) => (
            <li key={b.ad} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  b.elinde ? "bg-basari-zemin text-basari" : "bg-uyari-zemin text-uyari"
                }`}
                aria-hidden="true"
              >
                {b.elinde ? "✓" : "!"}
              </span>
              <div>
                <p className="font-semibold">
                  {b.ad}
                  <span className="ml-2 text-sm font-normal text-gri">
                    {b.elinde ? "(elinizde var)" : b.zorunlu ? "(bulmaya çalışın)" : "(varsa ekleyin)"}
                  </span>
                </p>
                {b.ipucu && <p className="text-sm text-gri">{b.ipucu}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Nereye, nasıl verilir */}
      <BasvuruRehberi
        yollar={tur.basvuruYollari(kisisel.il?.trim() || undefined)}
        sonrasi={tur.basvuruSonrasi}
        metin={metin}
        il={kisisel.il?.trim() || undefined}
      />

      <div className="text-sm text-gri">
        <button type="button" onClick={cihazdanSil} className="font-semibold text-marka-700 underline">
          Bilgilerimi bu cihazdan sil
        </button>
        <span className="ml-1">(ortak kullanılan bir cihazdaysanız işiniz bitince basın)</span>
      </div>
    </div>
  );
}
