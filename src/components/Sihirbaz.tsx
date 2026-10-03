"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { turGetir } from "@/lib/dilekce-turleri";
import type { Cevaplar, Soru } from "@/lib/dilekce-turleri/tipler";
import { tarihYaz, tutarYaz } from "@/lib/dilekce-turleri/ortak";
import { dosyaHazirla } from "@/lib/belge/gorsel";
import { useRobotDogrulama } from "./RobotDogrulama";
import { UygunlukKutusu } from "./UygunlukKutusu";

type Asama = "test" | "sonuc" | "fatura" | "hikaye" | "gonderiliyor";

type FaturaBilgisi = { urun: string; satici: string; saticiAdres: string; tarih: string; tutar: number };

/** Sunucu yanıtını okur; hata varsa hata koduyla birlikte anlaşılır bir mesaj fırlatır. */
async function yanitiOku<T>(yanit: Response): Promise<T> {
  const veri = (await yanit.json().catch(() => null)) as (T & { hata?: string; kod?: string }) | null;
  if (yanit.ok && veri) return veri;
  if (!veri) {
    throw new Error(
      yanit.status === 504
        ? "İşlem çok uzun sürdü. Lütfen tekrar deneyin."
        : `Sunucuya ulaşılamadı. Lütfen tekrar deneyin. (Hata kodu: HTTP-${yanit.status})`,
    );
  }
  throw new Error(`${veri.hata ?? "Bir sorun oldu."}${veri.kod ? ` (Hata kodu: ${veri.kod})` : ""}`);
}

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

/** Adresteki ?konu= ve ?alis= değerlerini, geçerliyse test cevaplarına çevirir. */
function adrestenOnDolum(tur: NonNullable<ReturnType<typeof turGetir>>): Cevaplar {
  try {
    const p = new URLSearchParams(window.location.search);
    const sonuc: Cevaplar = {};
    const alis = p.get("alis");
    if (alis === "internet" || alis === "magaza") sonuc.alisSekli = alis;
    const konu = p.get("konu");
    const konuSorusu = tur.testSorulari(sonuc).find((s) => s.id === "konu");
    if (konu && konuSorusu?.tip === "secim" && konuSorusu.secenekler.some((x) => x.deger === konu)) {
      sonuc.konu = konu;
    }
    return sonuc;
  } catch {
    return {};
  }
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
  // Rehber sayfalarından gelen bağlantılar konuyu önceden seçebilir (?konu=...&alis=...)
  const [test, setTest] = useState<Cevaplar>(() => kayit?.test ?? adrestenOnDolum(tur));
  const [hikaye, setHikaye] = useState<Cevaplar>(kayit?.hikaye ?? {});
  const [sira, setSira] = useState(kayit?.sira ?? 0);
  const [hata, setHata] = useState<string | null>(null);
  const [sunucuHatasi, setSunucuHatasi] = useState<string | null>(null);
  const [fatura, setFatura] = useState<{ okunuyor: boolean; hata: string | null; okunan: FaturaBilgisi | null }>({
    okunuyor: false,
    hata: null,
    okunan: null,
  });
  const robot = useRobotDogrulama();
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
      setAsama(tur.faturaYukleme ? "fatura" : "sonuc");
    }
  }

  async function gonder() {
    setAsama("gonderiliyor");
    setSunucuHatasi(null);
    try {
      const yanit = await fetch("/api/taslak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tur: tur.id, test, hikaye, robotJetonu: robot.jeton }),
      });
      robot.yenile();
      const veri = await yanitiOku<{ id: string }>(yanit);
      try {
        sessionStorage.removeItem(anahtar);
      } catch {}
      router.push(`/dilekce/${veri.id}`);
    } catch (e) {
      setSunucuHatasi((e as Error).message);
      setAsama("hikaye");
      robot.yenile();
    }
  }

  async function faturaYukle(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;
    setFatura({ okunuyor: true, hata: null, okunan: null });
    try {
      const hazir = await dosyaHazirla(dosya);
      const yanit = await fetch("/api/fatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dosya: hazir, robotJetonu: robot.jeton }),
      });
      robot.yenile();
      const { bilgi } = await yanitiOku<{ bilgi: FaturaBilgisi }>(yanit);
      // Okunan bilgileri, kullanıcının daha önce yazdıklarını ezmeden doldur
      setHikaye((h) => {
        const yeni: Cevaplar = { ...h };
        for (const alan of ["urun", "satici", "saticiAdres"] as const) {
          if (bilgi[alan] && !(typeof h[alan] === "string" && h[alan])) yeni[alan] = bilgi[alan];
        }
        const belgeler = Array.isArray(h.belgeler) ? h.belgeler : [];
        if (!belgeler.includes("fatura")) yeni.belgeler = [...belgeler, "fatura"];
        return yeni;
      });
      setFatura({ okunuyor: false, hata: null, okunan: bilgi });
    } catch (hataNesnesi) {
      robot.yenile();
      setFatura({ okunuyor: false, hata: (hataNesnesi as Error).message, okunan: null });
    }
  }

  // --- Ekranlar -------------------------------------------------------------

  function ekraniCiz() {

  if (asama === "gonderiliyor") {
    return (
      <div className="kart text-center" role="status" aria-live="polite">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-marka-100 border-t-marka-600" />
        <h2 className="mt-5 text-xl font-bold">Dilekçeniz hazırlanıyor…</h2>
        <p className="mt-2 text-gri">Bu işlem 15-40 saniye sürebilir. Lütfen sayfayı kapatmayın.</p>
      </div>
    );
  }

  if (asama === "fatura") {
    const okunan = fatura.okunan;
    const farklar: string[] = [];
    if (okunan?.tarih && okunan.tarih !== test.tarih)
      farklar.push(`Faturadaki tarih ${tarihYaz(okunan.tarih)}, testte ${tarihYaz(String(test.tarih))} yazmıştınız.`);
    if (okunan?.tutar && Math.abs(okunan.tutar - Number(test.tutar)) >= 1)
      farklar.push(`Faturadaki tutar ${tutarYaz(okunan.tutar)}, testte ${tutarYaz(String(test.tutar))} yazmıştınız.`);
    return (
      <div className="kart">
        <h2 className="text-xl font-bold">Faturanız elinizde mi?</h2>
        <p className="mt-2 text-gri">
          Faturanızın ya da sipariş özetinizin fotoğrafını yüklerseniz ürün ve satıcı bilgilerini sizin için
          doldururuz. Bu adım isteğe bağlıdır.
        </p>
        <p className="mt-3 rounded-xl bg-zemin p-3 text-sm text-gri">
          Dosyanız <strong>kaydedilmez</strong>. Yalnızca bilgileri okumak için yapay zekâ servisine gönderilir ve
          hemen silinir.
        </p>

        {okunan ? (
          <div className="mt-5 rounded-xl border-2 border-basari bg-basari-zemin p-4">
            <p className="font-semibold text-basari">Faturanız okundu</p>
            <ul className="mt-2 space-y-1 text-sm">
              {okunan.urun && <li>Ürün / hizmet: {okunan.urun}</li>}
              {okunan.satici && <li>Satıcı: {okunan.satici}</li>}
              {okunan.saticiAdres && <li>Satıcı adresi: {okunan.saticiAdres}</li>}
              {okunan.tarih && <li>Tarih: {tarihYaz(okunan.tarih)}</li>}
              {okunan.tutar > 0 && <li>Tutar: {tutarYaz(okunan.tutar)}</li>}
            </ul>
            <p className="mt-2 text-sm">Sonraki ekranlarda bu bilgileri kontrol edip düzeltebilirsiniz.</p>
            {farklar.length > 0 && (
              <div className="mt-3 rounded-lg bg-uyari-zemin p-3 text-sm text-uyari">
                {farklar.map((f) => (
                  <p key={f}>{f}</p>
                ))}
                <button
                  type="button"
                  className="mt-2 font-semibold underline"
                  onClick={() => {
                    const yeniTest = {
                      ...test,
                      ...(okunan.tarih ? { tarih: okunan.tarih } : {}),
                      ...(okunan.tutar ? { tutar: String(okunan.tutar) } : {}),
                    };
                    setTest(yeniTest);
                    // Yeni bilgilerle uygunluk değiştiyse sonucu yeniden göster
                    if (tur.uygunluk(yeniTest).durum !== sonuc.durum) setAsama("sonuc");
                    if (okunan.tutar) setTutarGirdisi(String(okunan.tutar));
                    setFatura((f) => ({ ...f, okunan: { ...okunan, tarih: "", tutar: 0 } }));
                  }}
                >
                  Faturadaki bilgileri kullan
                </button>
              </div>
            )}
          </div>
        ) : (
          <label
            className={`mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-marka-200 bg-marka-50 p-6 text-center ${
              fatura.okunuyor || !robot.hazir ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <span className="text-3xl" aria-hidden="true">📄</span>
            <span className="font-semibold text-marka-700">
              {fatura.okunuyor ? "Faturanız okunuyor…" : !robot.hazir ? "Güvenlik kontrolü yapılıyor…" : "Fotoğraf çek ya da dosya seç"}
            </span>
            <span className="text-sm text-gri">Fotoğraf (JPG, PNG) ya da PDF</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              disabled={fatura.okunuyor || !robot.hazir}
              onChange={faturaYukle}
            />
          </label>
        )}

        {fatura.hata && (
          <p className="mt-4 text-hata" role="alert">
            {fatura.hata}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" className="dugme-ikincil" onClick={() => setAsama("sonuc")}>
            Geri
          </button>
          <button
            type="button"
            className="dugme"
            disabled={fatura.okunuyor}
            onClick={() => {
              setAsama("hikaye");
              setSira(0);
              window.scrollTo({ top: 0 });
            }}
          >
            {okunan ? "Devam et" : "Faturasız devam et"}
          </button>
        </div>
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
                setAsama(tur.faturaYukleme ? "fatura" : "hikaye");
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
            <button
              type="button"
              className="dugme"
              onClick={() => ileri()}
              disabled={asama === "hikaye" && sira === toplam - 1 && !robot.hazir}
            >
              {asama === "hikaye" && sira === toplam - 1
                ? robot.hazir
                  ? "Önizlemeyi hazırla"
                  : "Güvenlik kontrolü…"
                : "Devam"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
  }

  return (
    <div>
      {ekraniCiz()}
      {/* Robot doğrulama kutusu, fatura ve olay adımlarında hazır bekler */}
      <div hidden={asama !== "fatura" && asama !== "hikaye"}>{robot.alan}</div>
    </div>
  );
}
