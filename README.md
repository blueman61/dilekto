# Dilekto

Tüketicilerin kendi dilekçelerini kolayca hazırlamasını sağlayan web uygulaması. İlk ürün: **Tüketici Hakem Heyeti başvuru dilekçesi**.

- Kurulum ve yayına alma: [docs/KURULUM.md](docs/KURULUM.md)
- Ödeme (deneme modu ve Shopier): [docs/ODEME.md](docs/ODEME.md)
- Pazarlama planı (ilk 100 müşteri): [docs/PAZARLAMA-PLANI.md](docs/PAZARLAMA-PLANI.md)
- Resmî dilekçe yazım kuralları ve kaynakları: [docs/DILEKCE-KURALLARI.md](docs/DILEKCE-KURALLARI.md)

## Nasıl çalışır?

1. Kullanıcı ücretsiz uygunluk testini yapar (kurallar kodda, yapay zekâ kullanılmaz).
2. Olayı birkaç soruyla anlatır. Yapay zekâ (Gemini ya da Claude) yalnızca **konu, açıklamalar ve talep** bölümlerini yazar.
3. Çıktı kullanıcıya gösterilmeden önce denetlenir: madde numarası ya da yasaklı ifade içerirse reddedilip yeniden yazdırılır.
4. "Hukuki nedenler" bölümü **yalnızca** `src/lib/mevzuat.ts` içindeki doğrulanmış maddelerden, kod tarafından yazılır.
5. Önizlemede metnin yalnızca ilk paragrafı tarayıcıya gönderilir; tamamı ödemeden sonra açılır.
6. Ad, TC kimlik no, adres ve telefon **sunucuya hiç gönderilmez**; dilekçeye tarayıcıda eklenir. PDF ve Word dosyaları da tarayıcıda üretilir.
7. Kayıtlar 30 gün sonra her gece çalışan bir görevle silinir.
8. Fatura yüklemek isteğe bağlıdır; dosya saklanmaz, yalnızca ürün/satıcı/tarih/tutar okunur.
9. Ödemeden sonra kullanıcıya **dilekçenin nereye, nasıl verileceği** (e-Devlet, elden, posta) adım adım gösterilir; dilekçe, resmî kurallara göre canlı denetlenir (`hakem-heyeti/kurallar.ts`).
10. Site açık ya da koyu temada görüntülenir; seçim cihazda saklanır (`src/lib/tema.ts`).
11. Hatalar kısa bir hata koduyla gösterilir; site sahibi `/durum?anahtar=<CRON_SECRET>` sayfasından ayarları ve bağlantıları kontrol edebilir.

## Klasörler

| Yol | İçerik |
|---|---|
| `src/config/site.ts` | Site adı, iletişim, satıcı bilgileri, saklama süreleri |
| `src/lib/dilekce-turleri/` | Dilekçe türleri (sorular, uygunluk kuralları, yapay zekâ talimatı, şablon) |
| `src/lib/mevzuat.ts` | Sabit, doğrulanmış mevzuat listesi |
| `src/lib/yasakli-ifadeler.ts` | Sitede ve yapay zekâ çıktısında yasak ifadeler |
| `src/lib/ai/` | Yapay zekâ sağlayıcıları ve çıktı denetimi |
| `src/lib/depo/` | Supabase (canlı) / bellek (yerel geliştirme) kayıt deposu |
| `src/lib/odeme/` | Ödeme sağlayıcıları: deneme ve Shopier (`ODEME_MODU` ile seçilir) |
| `src/lib/hatalar.ts` | Hata kodları ve kullanıcı mesajları |
| `src/lib/robot.ts` | Robot koruması (Cloudflare Turnstile, isteğe bağlı) |
| `src/content/genel.ts` | Tanıtım sayfalarının ortak metinleri (adımlar, SSS) |
| `src/content/rehberler.ts` | Şikâyet türüne özel rehber sayfaları (ör. `/kargo-hasari-dilekcesi`) |
| `src/lib/belge/` | PDF ve Word üretimi |
| `supabase/kurulum.sql` | Veritabanı tablosu |
| `testler/` | Otomatik testler |

## Yeni dilekçe türü eklemek

1. `src/lib/dilekce-turleri/<yeni-tur>/index.ts` içinde `DilekceTuru` tanımla (bkz. `hakem-heyeti`).
2. Kullanılacak kanun maddelerini resmî metinle doğrulayıp `src/lib/mevzuat.ts` listesine ekle.
3. `src/lib/dilekce-turleri/index.ts` listesine ekle. `/olustur/<yeni-tur>` sayfası kendiliğinden oluşur.

## Yeni rehber sayfası eklemek

`src/content/rehberler.ts` listesine yeni bir kayıt ekleyin. Sayfa, site haritası ve "Dilekçe örnekleri" listesi kendiliğinden güncellenir. Testler; atıfların doğrulanmış listede olduğunu, bağlantıların ve başlık uzunluklarının geçerli olduğunu denetler.

## Geliştirme

```bash
npm install
YAPAY_ZEKA=ornek npm run dev   # anahtarsız yerel deneme (yapay zekâ yerine örnek metin)
npm test                       # otomatik testler (uygunluk, metin, doğrulama, yapay zekâ, API uçları)
npm run kontrol                # yasaklı ifade taraması (her derlemede otomatik çalışır)
npm run build
```

Ayarların tam listesi: [.env.example](.env.example). Gizli anahtarlar asla depoya yazılmaz.
