# Ödeme: deneme modu ve Shopier

Site iki ödeme modunda çalışabilir. Mod, Vercel'deki `ODEME_MODU` ayarıyla seçilir:

| `ODEME_MODU` | Ne olur? |
|---|---|
| `deneme` (şu anki) | Ödeme ekranı ve onay kutuları çalışır, **hiçbir karttan para çekilmez**. Sitenin üstünde "Deneme sürümü" şeridi görünür. |
| `shopier` | Gerçek ödeme. Kullanıcı fatura bilgilerini yazar, Shopier'in güvenli ödeme sayfasında kartla öder, ödeme onaylanınca dilekçesi açılır. |

## Shopier ödemesi nasıl çalışır?

1. Kullanıcı önizlemede "149 TL öde ve dilekçemi aç" düğmesine basar.
2. Ödeme sayfasında iki onay kutusunu işaretler, adını, e-postasını, telefonunu ve adresini yazar.
   - Bu bilgiler **sunucumuza gönderilmez**. Sunucu yalnızca sipariş numarası, tutar ve gizli anahtarla üretilen imzayı hazırlar; tarayıcı alıcı bilgilerini ekleyip formu **doğrudan Shopier'e** gönderir.
3. Kullanıcı Shopier'in sayfasında kart bilgilerini girer ve öder.
4. Shopier, kullanıcının tarayıcısı üzerinden `https://<site>/api/odeme/shopier` adresine imzalı bir sonuç gönderir. İmza doğrulanırsa dilekçe açılır ve kullanıcı dilekçe sayfasına döner. Ödeme başarısızsa ödeme sayfasına "ödemeniz tamamlanamadı" mesajıyla döner.

### Bilinen sınırlamalar

- **Durum imzalı değil:** Shopier'in sonuç imzası ödemenin başarılı olup olmadığını kapsamaz (Shopier'in kendi modülünde de böyledir). Bu yüzden her ödeme Shopier'in ödeme numarasıyla kaydedilir. Durum sayfasındaki **"Son ödemeler"** tablosunu ara ara Shopier panelindeki siparişlerle karşılaştır: her satırın Shopier'de karşılığı olmalı.
- **Pencere kapanırsa:** Sonuç kullanıcının tarayıcısı üzerinden geldiği için, kullanıcı ödemeden hemen sonra pencereyi kapatırsa dilekçe açılmayabilir. Böyle bir kullanıcı yazarsa ödeme numarasını Shopier panelinden kontrol edip dilekçesini elle açarız (gerekirse bunun için bir yönetim düğmesi eklerim).

## Shopier'i açmak için yapılacaklar

Bu adımları gerçek satışa hazır olduğunda yap. O zamana kadar `ODEME_MODU=deneme` kalsın.

### Senden

1. **Shopier hesabı:** shopier.com'da şahıs şirketinle satıcı hesabı aç ve onaylanmasını bekle. Satacağın ürünün dijital (indirilebilir/sanal) olduğunu belirt.
2. **API anahtarları:** Shopier panelinde **Entegrasyonlar → Modül Yönetimi** bölümüne gir.
   - **API kullanıcı adı** ve **API şifresi** değerlerini kopyala.
   - **Geri dönüş adresi (callback URL)** olarak `https://dilekto.com/api/odeme/shopier` yaz. Alan adı henüz bağlı değilse `https://dilekto.vercel.app/api/odeme/shopier`.
   - Birden fazla web sitesi tanımlanabiliyorsa bu adresin kaçıncı sırada olduğuna bak (genellikle 1).
3. **Vercel ayarları** (Settings → Environment Variables):

| Ad | Değer |
|---|---|
| `SHOPIER_API_KEY` | Shopier API kullanıcı adı |
| `SHOPIER_API_SECRET` | Shopier API şifresi |
| `SHOPIER_SITE_NO` | Geri dönüş adresinin sırası (genellikle `1`) |
| `ODEME_MODU` | `shopier` (yalnızca her şey hazır olduğunda) |

4. **Yeniden yayınla** ve durum sayfasında "Ödeme ayarları" satırının ✓ olduğunu gör.
5. **Gerçek bir deneme:** Kendi kartınla bir dilekçe satın al. Dilekçenin açıldığını, durum sayfasındaki "Son ödemeler" tablosunda ve Shopier panelinde aynı ödeme numarasının göründüğünü kontrol et. Sonra Shopier panelinden bu ödemeyi iade edebilirsin.

### Gerçek satıştan önce kontrol listesi

- [ ] Vercel Pro plana geçildi ya da site Cloudflare'e taşındı (ücretsiz Hobby planı ticari kullanıma izin vermez)
- [ ] `src/config/site.ts` içindeki satıcı bilgileri dolduruldu (bana iletmen yeterli)
- [ ] Yasal metinler bir uzmana kontrol ettirildi
- [ ] Yapay zekâ ücretli katmana geçirildi
- [ ] e-Arşiv fatura süreci belirlendi (alıcı bilgileri Shopier panelindeki siparişte görünür)
- [ ] Kendi kartınla gerçek deneme yapıldı (yukarıdaki 5. adım)

## Başka bir sağlayıcı eklemek (ör. iyzico, PayTR)

`src/lib/odeme/` klasörüne yeni bir dosya ekleyip `index.ts` içindeki listeye eklemek ve sonuç için bir API ucu yazmak yeterlidir. Ödeme sayfası, onay kutuları ve "kişisel bilgi sunucuya gitmez" yapısı aynen kullanılır.
