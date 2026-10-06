# Resmî dilekçe kuralları ve Dilekto'daki karşılıkları

Bu belge, dilekçe şablonunun ve kural denetiminin dayandığı kuralları, kaynaklarıyla ve **ne kadar kesin olduklarıyla** birlikte listeler. Kod bu belgeye göre yazılmıştır (`src/lib/dilekce-turleri/hakem-heyeti/`).

Üç güven düzeyi kullanıyoruz:

- **Bağlayıcı:** Kanun ya da yönetmelik hükmü. Eksikse başvuru işlem görmeyebilir.
- **Uygulama:** Kurumların ve yaygın kılavuzların tavsiye ettiği, ama tek bir metne bağlı olmayan düzen.
- **Öneri:** Bizim kullanıcıya önerimiz; kural değildir.

> Biz hukuki görüş vermeyiz. Bu kurallar, dilekçenin eksiksiz ve düzenli olmasına yardım eder; başvurunun sonucuna dair bir söz içermez.

## 1. Bağlayıcı kurallar

| Kural | Kaynak | Dilekto'da |
|---|---|---|
| Yetkili makamlara verilen dilekçede dilekçe sahibinin **adı-soyadı, imzası ve iş ya da ikametgâh adresi** bulunmalıdır. Bu şartları taşımayan dilekçe incelenmeyebilir. | 3071 sayılı Dilekçe Hakkının Kullanılmasına Dair Kanun m. 4 ve m. 6 | Ad soyad, adres ve imza satırı zorunlu alan sayılır; kural denetimi eksikse uyarır. |
| Dilekçe **belli bir konuyu** içermelidir. | 3071 s. K. m. 6 | "KONU:" satırı zorunludur. |
| Tüketici hakem heyeti başvurusunda şunlar **zorunludur**: başvuru sahibinin adı-soyadı, **T.C. kimlik numarası**, adresi ve varsa diğer iletişim bilgileri; **uyuşmazlık konusu**; **talep**; **TL cinsinden uyuşmazlık değeri**; **şikâyet edilene ilişkin bilgiler**. Başvuru ilgili belgelerle birlikte yapılır. | Tüketici Hakem Heyetleri Yönetmeliği m. 11 | Şablondaki "BAŞVURU SAHİBİ", "KARŞI TARAF", "UYUŞMAZLIK KONUSU", "UYUŞMAZLIK DEĞERİ" ve "SONUÇ VE İSTEM" bölümleri bunu karşılar. TC kimlik numarası algoritma ile denetlenir. |
| Başvuru, tüketicinin **yerleşim yerindeki** ya da **tüketici işleminin yapıldığı yerdeki** hakem heyetine yapılır. Heyetin bulunmadığı yerlerde **ilçe kaymakamlığına** da yapılabilir; kaymakamlık başvuruyu yetkili heyete iletir. | 6502 s. Kanun m. 68/3 (resmî metinle doğrulandı) | Rehberde "nereye verilir" bölümü ve il seçimine göre açıklama. |
| Parasal sınırın altındaki uyuşmazlıklarda başvuru zorunludur; 2026 sınırı 186.000 TL. | 6502 s. K. m. 68/1 ve 4; Ticaret Bakanlığı duyurusu | Ücretsiz uygunluk testi. |
| Heyet tebligatlarını **elektronik ortamda** yapar; yapılamazsa Tebligat Kanunu uygulanır. Taraflar karara **tebliğ tarihinden itibaren 2 hafta içinde** heyete ya da tüketicinin yerleşim yerindeki tüketici mahkemesine itiraz edebilir; itiraz kararın icrasını kendiliğinden durdurmaz. | 6502 s. K. m. 70/2-3 (resmî metinle doğrulandı) | "Başvurudan sonra ne olur?" bölümü. |
| Tüketici aleyhine karar verilmesi hâlinde tebligat ve bilirkişi ücretleri Bakanlıkça karşılanır. | 6502 s. K. m. 70/7 | Sitede "başvuru ücretsizdir" ifadesinin dayanağı. |
| Elektronik başvuru e-Devlet üzerinden **Tüketici Bilgi Sistemi (TÜBİS)** ile yapılır; başvuru formu eksiksiz doldurulmalı, belgeler sisteme yüklenmelidir. | Tüketici Hakem Heyetleri Yönetmeliği | e-Devlet adımları. |

## 2. Uygulama kuralları (yaygın düzen)

Aşağıdakiler kanunda sayılmamıştır; kurum kılavuzlarında ve yaygın örneklerde bu düzen izlenir.

| Kural | Dilekto'da |
|---|---|
| **Makam adı** sayfanın en üstünde, **ortalanmış ve büyük harflerle** yazılır ("… TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA"). | Birinci satır; PDF ve Word'de ortalı ve kalın. |
| Gövde: **kimlik/adres bilgileri → konu → açıklamalar → hukuki nedenler → deliller → sonuç ve istem** sırası. | Şablon bu sırayı izler. |
| Açıklamalar **tarih sırasıyla**, kısa, numaralı paragraflarla yazılır; resmî ve sade üslup kullanılır. | Yapay zekâ talimatı ve numaralı paragraflar. |
| Vatandaş devlete yazarken kapanışta **"arz ederim"** kalıbı kullanılır. | "… saygılarımla arz ve talep ederim." |
| **Tarih, ad-soyad ve imza** metnin bitiminden sonra **sağ alta** yazılır; ad ilk harfi büyük, soyad tamamı büyük harfle (**Ayşe YILMAZ**), imza adın üstüne atılır. | İmza bloğu sağa yaslı; ad soyad otomatik bu biçime çevrilir. |
| **Ekler**, imzadan sonra, sol kenardan başlayarak **"EKLER:"** başlığı altında numaralı sıralanır (Resmî Yazışma Yönetmeliği'ndeki "Ek:" düzeni). | İmza bloğundan sonra "EKLER:" listesi. |
| Dilekçe **A4 beyaz kâğıda**, tek yüze yazılır; sığmazsa ikinci sayfaya geçilir. İmza **mavi/siyah tükenmez kalemle** atılır. | Çıktı A4'tür; yazdırma önerileri rehberde. |
| Yazı karakteri **Times New Roman 12 punto** (ya da Arial 11), kenar boşlukları **2,5 cm**, satır aralığı **1,5**, metin **iki yana yaslı**. | PDF'te Times New Roman ile ölçü uyumlu Liberation Serif 12 punto; Word'de Times New Roman 12. |

**Not:** Yazı karakteri, kenar boşluğu ve satır aralığı kuralları Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik'in **kamu kurumları arasındaki yazışmalar** için koyduğu düzendir; vatandaş dilekçeleri için bağlayıcı değildir. Kaynaklarda küçük farklar vardır (ör. bazıları 1,5 cm, bazıları 2,5 cm kenar boşluğu der); biz en yaygın olanı, yani 2,5 cm'yi kullanıyoruz.

## 3. Öneriler (kural değil)

- Dilekçeyi **iki nüsha** hazırlayın: biri heyete, biri kendinize (kayıt tarihi/numarası bastırmak için). Kaynaklar "birer örnek" ya da "2 nüsha" der; kesin bir sayı yoktur.
- Belgelerin **fotokopisini** ekleyin, asıllarını saklayın.
- Kimlik fotokopisi elden başvuruda istenebilir (kaynaklar "kimlik fotokopisi gereklidir" der).
- Posta ile gönderiyorsanız **iadeli taahhütlü** gönderin ve teslim belgesini saklayın.
- Ticaret Bakanlığı'nın hazır **başvuru formu** vardır (ticaret.gov.tr > Tüketici > Tüketici Hakem Heyetleri > Başvuru Formları); dilekçe yerine ya da dilekçeyle birlikte kullanılabilir.
- Hangi heyete gideceğinizi bilmiyorsanız **Alo 175 Tüketici Danışma Hattı**'nı arayabilir ya da ticaret.gov.tr'deki il müdürlükleri listesine bakabilirsiniz.

## 4. Doğrulayamadığımız konular (sitede söz vermiyoruz)

- Heyetin **karar verme süresi**: kanun metninde yok, yönetmelikte olduğunu ayrıca doğrulayamadık. Sitede kesin süre yazmıyoruz; "yoğunluğa göre değişir" diyoruz.
- Heyet bazında **adres ve çalışma saatleri**: sürekli değiştiği için sitede tek tek adres vermiyoruz; kullanıcıyı resmî listeye yönlendiriyoruz.
- e-Devlet ekranlarındaki **düğme adları** zaman zaman değişir; rehberde "ekran adları değişebilir" uyarısı var.

## 5. Kaynaklar

- 6502 sayılı Tüketicinin Korunması Hakkında Kanun, m. 68 ve m. 70: Adalet Bakanlığı UYAP mevzuat sistemi ve mevzuat.gov.tr metinleriyle karşılaştırıldı (bkz. `src/lib/mevzuat.ts`).
- [3071 sayılı Dilekçe Hakkının Kullanılmasına Dair Kanun](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3071.pdf) (m. 4 ve m. 6 arama sonuçlarındaki özetlerle; ağ kısıtı nedeniyle tam metin doğrudan okunamadı).
- [Tüketici Hakem Heyetleri Yönetmeliği](https://www.lexpera.com.tr/mevzuat/yonetmelikler/tuketici-hakem-heyetleri-yonetmeligi-1) (m. 11; arama sonucundaki özetle).
- [Ticaret Bakanlığı: Tüketici Hakem Heyetlerine İlişkin Bilgilendirme Metni](https://ticaret.gov.tr/tuketici/tuketici-hakem-heyetleri/tuketici-hakem-heyetlerine-iliskin-bilgilendirme-metni)
- [Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik](https://www.mevzuat.gov.tr/mevzuatmetin/21.5.2646.pdf)
- [Ticaret Bakanlığı il müdürlükleri](https://ticaret.gov.tr/iletisim/il-mudurlukleri) ve [Alo 175](https://ticaret.gov.tr/tuketici/alo-175)

Bu dosyayı güncellerken: yeni bir kural eklemeden önce kaynağını ve güven düzeyini yazın; doğrulayamadığınız şeyi 4. bölüme koyun.
