# Gerçek ödemeye geçiş (iyzico / PayTR)

Site şu an **deneme modunda** çalışır (`ODEME_MODU=deneme`): ödeme ekranı ve onay kutuları gerçektir, ama para çekilmez.

Ödeme altyapısı "tak-çıkar" şeklinde kuruludur. Gerçek bir sağlayıcı eklemek mevcut sayfaları değiştirmeyi gerektirmez.

## Kodda nerede?

| Dosya | Görevi |
|---|---|
| `src/lib/odeme/index.ts` | Sağlayıcı arayüzü (`OdemeSaglayicisi`) ve sağlayıcı listesi |
| `src/app/api/odeme/baslat/route.ts` | Önizleme sayfasındaki "öde" düğmesi buraya gelir; seçili sağlayıcının ödeme sayfasına yönlendirir |
| `src/app/api/odeme/deneme/route.ts` | Yalnızca deneme modunda çalışan sahte ödeme |
| `src/lib/depo/index.ts` → `odemeIsle` | Ödemeyi kaydeder ve dilekçenin tamamını açar |

## iyzico eklemek için yapılacaklar

1. **Senden:** iyzico üye işyeri başvurusu (şirket belgeleri, vergi levhası, IBAN). Başvuruda site incelenir; o yüzden önce alan adını bağlayıp yasal sayfalara şirket bilgilerini eklemeliyiz.
2. **Senden:** iyzico panelinden **API anahtarı** ve **güvenlik anahtarı** (önce test ortamı, sonra canlı ortam).
3. **Benden:**
   - `src/lib/odeme/iyzico.ts`: `baslat()` iyzico'da ödeme formu oluşturur ve kullanıcıyı iyzico'nun ödeme sayfasına yönlendirir.
   - `src/app/api/odeme/iyzico/route.ts`: iyzico'nun geri dönüşünü alır, ödemeyi iyzico'dan **doğrular**, sonra `odemeIsle` ile dilekçeyi açar.
   - Ön bilgilendirme ve cayma hakkı onayları, iyzico'ya gitmeden önce alınır (deneme ekranındaki iki kutu).
4. **Vercel ayarları:** `ODEME_MODU=iyzico`, `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_ORTAM=test|canli`.
5. Test ortamında test kartlarıyla baştan sona deneme yapılır, sonra canlı ortama geçilir.

PayTR için de aynı yol izlenir (`paytr.ts` + geri dönüş adresi).

## Gerçek ödemeden önce kontrol listesi

- [ ] Vercel Pro plana geçildi ya da site Cloudflare'e taşındı (Hobby planı ticari kullanıma izin vermez)
- [ ] `src/config/site.ts` içindeki satıcı bilgileri dolduruldu
- [ ] Yasal metinler bir uzmana kontrol ettirildi; KVKK metnine ödeme kuruluşu eklendi
- [ ] Yapay zekâ ücretli katmana geçirildi
- [ ] e-Arşiv fatura süreci belirlendi (muhasebeci veya otomatik fatura entegrasyonu)
- [ ] Fatura için gerekecek ad-soyad ve e-posta, ödeme adımında istenecek şekilde eklendi
