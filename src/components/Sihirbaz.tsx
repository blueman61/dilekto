"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { turGetir } from "@/lib/dilekce-turleri";
import type { Cevaplar, Soru } from "@/lib/dilekce-turleri/tipler";
import { tutarYaz } from "@/lib/dilekce-turleri/ortak";
import { UygunlukKutusu } from "./UygunlukKutusu";

type Asama = "test" | "sonuc" | "hikaye" | "gonderiliyor";

function oturumOku<T>(anahtar: string, varsayilan: T): T {
  try {
    const v = sessionStorage.getItem(anahtar);
    return v ? (JSON.parse(v) as T) : varsayilan;
  } catch {
    return varsayilan;
  }
}

function oturumYaz(anahtar: string, deger: unknown) {
  try {
    sessionStorage.setItem(anahtar, JSON.stringify(deger));
  } catch {
    /* tarayıcı izin vermiyorsa sorun değil */
  }
}

function bugunIso(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** "12.499,90" / "12499.9" / "12.499" → "12499.9" */
function tutarCoz(girdi: string): string {
  let s = girdi.replace(/\s|TL|₺/gi, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  return s;
}

function soruHatasi(s: Soru, d: string | string[] | undefined): string | null {
  const bos = d === undefined || d === "" || (Array.isArray(d) && d.length === 0);
  if (bos) return s.zorunlu ? "Lütfen bu soruyu cevaplayın." : null;
  if ((s.tip === "metin" || s.tip === "uzunMetin") && typeof d === "string") {
    const m = d.trim();
    if (s.enKisa && m.length < s.enKisa) return `Lütfen biraz daha ayrıntı yazın (en az ${s.enKisa} karakter).`;
    if (m.length > s.enUzun) return `En fazla ${s.enUzun} karakter yazabilirsiniz.`;
  }
  if (s.tip === "tutar" && typeof d === "string") {
    const n = Number(d);
    if (!Number.isFinite(n) || n <= 0) return "Lütfen geçerli bir tutar yazın. Örnek: 12499";
  }
  if (s.tip === "tarih" && typeof d === "string" && d > bugunIso()) return "Tarih bugünden sonra olamaz.";
  return null;
}

export function Sihirbaz({ turId }: { turId: string }) {
  const tur = turGetir(turId)!;
  const router = useRouter();
  const anahtar = `dilekto:sihirbaz:${turId}`;

  // Sayfa yenilenirse cevaplar kaybolmasın (yalnızca bu sekmede saklanır).
  // Bu bileşen yalnızca tarayıcıda çalıştığı için kayıt ilk açılışta okunur.
  const [kayit] = useState(() =>
    oturumOku<{ asama: Asama; test: Cevaplar; hikaye: Cevaplar; sira: number } | null>(anahtar, null),
  );
  const [asama, setAsama] = useState<Asama>(
    kayit ? (kayit.asama === "gonderiliyor" ? "hikaye" : kayit.asama) : "test",
  );
  const [test, setTest] = useState<Cevaplar>(kayit?.test ?? {});
  const [hikaye, setHikaye] = useState<Cevaplar>(kayit?.hikaye ?? {});
  const [sira, setSira] = useState(kayit?.sira ?? 0);
  const [hata, setHata] = useState<string | null>(null);
  const [sunucuHatasi, setSunucuHatasi] = useState<string | null>(null);
  const [tutarGirdisi, setTutarGirdisi] = useState(
    typeof kayit?.test.tutar === "string" ? kayit.test.tutar : "",
  );

  useEffect(() => {
    oturumYaz(anahtar, { asama, test, hikaye, sira });
  }, [anahtar, asama, test, hikaye, sira]);

  const sorular = useMemo(
    () => (asama === "test" ? tur.testSorulari(test) : tur.hikayeSorulari(test)),
    [asama, tur, test],
  );
  const cevaplar = asama === "test" ? test : hikaye;
  const setCevaplar = asama === "test" ? setTest : setHikaye;
  const soru = sorular[Math.min(sira, sorular.length - 1)];
  const sonuc = useMemo(() => tur.uygunluk(test), [tur, test]);

  function cevapla(id: string, deger: string | string[]) {
    setHata(null);
    setCevaplar((c) => {
      const yeni = { ...c, [id]: deger };
      // Alış şekli değişince artık geçerli olmayan konu seçimini temizle
      if (asama === "test" && id === "alisSekli") {
        const konular = tur.testSorulari(yeni).find((s) => s.id === "konu");
        if (konular?.tip === "secim" && !konular.secenekler.some((x) => x.deger === yeni.konu)) {
          delete yeni.konu;
        }
      }
      return yeni;
    });
  }

  function ileri(deger?: string | string[]) {
    const d = deger ?? cevaplar[soru.id];
    const h = soruHatasi(soru, d);
    if (h) {
      setHata(h);
      return;
    }
    setHata(null);
    if (sira < sorular.length - 1) {
      setSira(sira + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    if (asama === "test") {
      setAsama("sonuc");
    } else {
      void gonder();
    }
    window.scrollTo({ top: 0 });
  }

  function geri() {
    setHata(null);
    if (sira > 0) setSira(sira - 1);
    else if (asama === "hikaye") {
      setAsama("sonuc");
    }
  }

  async function gonder() {
    setAsama("gonderiliyor");
    setSunucuHatasi(null);
    try {
      const yanit = await fetch("/api/taslak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tur: tur.id, test, hikaye }),
      });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata || "Bir sorun oldu.");
      try {
        sessionStorage.removeItem(anahtar);
      } catch {}
      router.push(`/dilekce/${veri.id}`);
    } catch (e) {
      setSunucuHatasi((e as Error).message);
      setAsama("hikaye");
    }
  }

  // --- Ekranlar -------------------------------------------------------------

  if (asama === "gonderiliyor") {
    return (
      <div className="kart text-center" role="status" aria-live="polite">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-marka-100 border-t-marka-600" />
        <h2 className="mt-5 text-xl font-bold">Dilekçeniz hazırlanıyor…</h2>
        <p className="mt-2 text-gri">Bu işlem 15-40 saniye sürebilir. Lütfen sayfayı kapatmayın.</p>
      </div>
    );
  }

  if (asama === "sonuc") {
    return (
      <div className="space-y-6">
        <UygunlukKutusu sonuc={sonuc} />
        <div className="flex flex-col gap-3 sm:flex-row">
          {sonuc.durum !== "uygun-degil" && (
            <button
              className="dugme"
              onClick={() => {
                setAsama("hikaye");
                setSira(0);
              }}
            >
              Devam et: Olayı anlatın
            </button>
          )}
          <button
            className="dugme-ikincil"
            onClick={() => {
              setAsama("test");
              setSira(0);
            }}
          >
            Cevaplarımı değiştir
          </button>
        </div>
        {sonuc.durum !== "uygun-degil" && (
          <p className="text-sm text-gri">
            Sonraki adımda olayı birkaç soruyla anlatacaksınız. Ardından dilekçenizin önizlemesini ücretsiz
            göreceksiniz.
          </p>
        )}
      </div>
    );
  }

  const toplam = sorular.length;
  const ilerleme = Math.round(((sira + 1) / toplam) * 100);
  const deger = cevaplar[soru.id];

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm text-gri">
          <span>{asama === "test" ? tur.testBasligi : "Olayı anlatın"}</span>
          <span className="shrink-0 whitespace-nowrap">
            Soru {sira + 1} / {toplam}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-marka-100">
          <div className="h-2 rounded-full bg-marka-600 transition-all" style={{ width: `${ilerleme}%` }} />
        </div>
      </div>

      {sunucuHatasi && (
        <p className="mb-4 rounded-xl bg-hata-zemin p-4 text-hata" role="alert">
          {sunucuHatasi}
        </p>
      )}

      <div className="kart">
        <h2 className="text-xl font-bold" id={`soru-${soru.id}`}>
          {soru.soru}
          {!soru.zorunlu && <span className="ml-2 text-base font-normal text-gri">(isteğe bağlı)</span>}
        </h2>
        {soru.aciklama && <p className="mt-2 text-gri">{soru.aciklama}</p>}

        <div className="mt-5">
          {soru.tip === "secim" && (
            <div className="grid gap-3" role="radiogroup" aria-labelledby={`soru-${soru.id}`}>
              {soru.secenekler.map((x) => {
                const secili = deger === x.deger;
                return (
                  <button
                    key={x.deger}
                    type="button"
                    role="radio"
                    aria-checked={secili}
                    onClick={() => {
                      cevapla(soru.id, x.deger);
                      ileri(x.deger);
                    }}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      secili ? "border-marka-600 bg-marka-50" : "border-cizgi hover:border-marka-200"
                    }`}
                  >
                    <span className="font-semibold">{x.etiket}</span>
                    {x.aciklama && <span className="mt-1 block text-sm text-gri">{x.aciklama}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {soru.tip === "coklu" && (
            <div className="grid gap-3">
              {soru.secenekler.map((x) => {
                const liste = Array.isArray(deger) ? deger : [];
                const secili = liste.includes(x.deger);
                return (
                  <label
                    key={x.deger}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                      secili ? "border-marka-600 bg-marka-50" : "border-cizgi"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 accent-marka-600"
                      checked={secili}
                      onChange={() =>
                        cevapla(soru.id, secili ? liste.filter((y) => y !== x.deger) : [...liste, x.deger])
                      }
                    />
                    <span>{x.etiket}</span>
                  </label>
                );
              })}
            </div>
          )}

          {soru.tip === "metin" && (
            <input
              className="kutu-giris"
              aria-labelledby={`soru-${soru.id}`}
              value={typeof deger === "string" ? deger : ""}
              placeholder={soru.ornek}
              maxLength={soru.enUzun}
              onChange={(e) => cevapla(soru.id, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ileri()}
            />
          )}

          {soru.tip === "uzunMetin" && (
            <>
              <textarea
                className="kutu-giris min-h-48"
                aria-labelledby={`soru-${soru.id}`}
                value={typeof deger === "string" ? deger : ""}
                placeholder={soru.ornek}
                maxLength={soru.enUzun}
                onChange={(e) => cevapla(soru.id, e.target.value)}
              />
              <p className="mt-1 text-right text-sm text-gri">
                {(typeof deger === "string" ? deger.length : 0).toLocaleString("tr-TR")} / {soru.enUzun}
              </p>
            </>
          )}

          {soru.tip === "tarih" && (
            <input
              type="date"
              className="kutu-giris max-w-xs"
              aria-labelledby={`soru-${soru.id}`}
              max={bugunIso()}
              value={typeof deger === "string" ? deger : ""}
              onChange={(e) => cevapla(soru.id, e.target.value)}
            />
          )}

          {soru.tip === "tutar" && (
            <div>
              <div className="flex max-w-xs items-center gap-2">
                <input
                  className="kutu-giris"
                  inputMode="decimal"
                  aria-labelledby={`soru-${soru.id}`}
                  placeholder="Örnek: 12499"
                  value={tutarGirdisi}
                  onChange={(e) => {
                    setTutarGirdisi(e.target.value);
                    cevapla(soru.id, tutarCoz(e.target.value));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && ileri()}
                />
                <span className="font-semibold">TL</span>
              </div>
              {typeof deger === "string" && Number(deger) > 0 && (
                <p className="mt-2 text-sm text-gri">Yazdığınız tutar: {tutarYaz(deger)}</p>
              )}
            </div>
          )}
        </div>

        {hata && (
          <p className="mt-4 text-hata" role="alert">
            {hata}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            className="dugme-ikincil"
            onClick={geri}
            disabled={asama === "test" && sira === 0}
          >
            Geri
          </button>
          {soru.tip !== "secim" && (
            <button type="button" className="dugme" onClick={() => ileri()}>
              {asama === "hikaye" && sira === toplam - 1 ? "Önizlemeyi hazırla" : "Devam"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
