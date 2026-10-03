# Dilekto kurulum rehberi

Bu rehber, siteyi **dilekto.vercel.app** gibi ücretsiz bir adreste yayına almak için yapman gerekenleri adım adım anlatır. Kod bilmen gerekmez. Toplam süre yaklaşık **30-45 dakika**.

Açacağın hesaplar (hepsi ücretsiz):

| Hesap | Ne işe yarar | Giriş yöntemi |
|---|---|---|
| Supabase | Dilekçe kayıtlarını saklar | GitHub hesabınla |
| Google AI Studio | Dilekçeyi yazan yapay zekâ (Gemini) | Gmail hesabınla |
| Vercel | Siteyi internette yayınlar | GitHub hesabınla |

> **Gizli anahtar kuralı:** Aşağıda kopyalayacağın anahtarları **yalnızca Vercel'in "Environment Variables" ekranına** yapıştır. Kodun içine, GitHub'a, e-postaya ya da mesajlaşma uygulamalarına yapıştırma. Bir anahtarın başkasının eline geçtiğini düşünürsen, aldığın sitede onu silip yenisini oluştur ve Vercel'de güncelle.

> Ekranlardaki düğme adları zamanla biraz değişebilir. Aradığın düğmeyi bulamazsan, benzer adlı olanı ara ya da bana ekran görüntüsü gönder.

Anahtarları geçici olarak bir yere not etmen gerekecek. Bunun için telefonundaki ya da bilgisayarındaki **kimseyle paylaşılmayan** bir not uygulamasını kullan; işin bitince notu sil.

---

## 1. Supabase (veritabanı)

1. **supabase.com** adresine git, sağ üstteki **Start your project** düğmesine tıkla.
2. **Continue with GitHub** seç ve GitHub hesabınla giriş yap. İzin isterse **Authorize** de.
3. Bir kuruluş (organization) oluşturman istenirse: ad olarak `Dilekto` yaz, plan olarak **Free** seç, **Create organization** de.
4. **New project** ekranında:
   - **Project name:** `dilekto`
   - **Database Password:** **Generate a password** düğmesine bas. Bu şifreyi not al (şimdilik kullanmayacağız ama kaybetme).
   - **Region:** **Central EU (Frankfurt)** seç. Türkiye'ye en yakın ve Avrupa veri kurallarına uygun bölge budur.
   - **Create new project** de. Proje 1-2 dakikada hazırlanır.
5. **Tabloyu oluştur:**
   - Sol menüde **SQL Editor** simgesine tıkla.
   - **New query** (veya **+**) de.
   - GitHub'da bu depodaki `supabase/kurulum.sql` dosyasını aç, **Raw** düğmesine bas, sayfadaki metnin tamamını kopyala.
   - Supabase'deki boş alana yapıştır, sağ alttaki **Run** düğmesine bas.
   - Altta **Success. No rows returned** yazısını görmelisin.
6. **İki bilgiyi kopyala:**
   - Sol alttaki dişli simgesine (**Project Settings**) tıkla.
   - **Data API** bölümünde **Project URL** yazan adresi kopyala (`https://xxxx.supabase.co` gibi). Bunu **SUPABASE_URL** adıyla not al.
   - **API Keys** bölümüne geç. **Secret keys** kısmında `sb_secret_` ile başlayan anahtarı göster ve kopyala. Bunu **SUPABASE_SECRET_KEY** adıyla not al.
     - Ekranında "Secret keys" yerine yalnızca **service_role** anahtarı varsa onu kopyalaman da olur.
     - **Dikkat:** "publishable" ya da "anon" anahtarını değil, **secret / service_role** anahtarını kopyala.

> Ücretsiz Supabase projesi 1 hafta hiç kullanılmazsa uykuya geçer. Böyle olursa Supabase'e girip projede **Restore project** düğmesine basman yeterli.

---

## 2. Google AI Studio (Gemini anahtarı)

1. **aistudio.google.com** adresine git ve Gmail hesabınla giriş yap. Şartları kabul etmeni isterse kabul et.
2. Sol menüde (ya da sol altta) **Get API key** düğmesine tıkla.
3. **Create API key** de. Proje seçmeni isterse var olan bir projeyi seç ya da yeni proje oluşturmasına izin ver.
4. `AIza` ile başlayan anahtarı kopyala. Bunu **GEMINI_API_KEY** adıyla not al.

> Bu anahtar ücretsiz katmanda çalışır; deneme için yeterlidir. Ücretsiz katmanda Google gönderilen metinleri ürünlerini geliştirmek için kullanabilir. Bu yüzden deneme döneminde gerçek kişilerin hassas hikâyelerini değil, kendi denemelerini ve tanıdıklarının denemelerini kullan. Gerçek satışa geçmeden önce ücretli katmana geçeceğiz (bkz. en alttaki bölüm).

---

## 3. Vercel (siteyi yayınlama)

1. **vercel.com/signup** adresine git.
2. Plan olarak **Hobby** seç, adını yaz ve **Continue with GitHub** de. GitHub hesabınla giriş yap.
3. Açılan ekranda **Add New…** → **Project** seç.
4. **Import Git Repository** listesinde `dilekto` deposunu bul ve yanındaki **Import** düğmesine bas.
   - Depo listede yoksa **Configure GitHub App** (veya **Adjust GitHub App Permissions**) bağlantısına tıkla, `dilekto` deposuna erişim ver ve geri dön.
5. **Configure Project** ekranında:
   - **Project Name:** `dilekto` yaz. Bu ad boştaysa siteniz `dilekto.vercel.app` olur. Doluysa Vercel başka bir ad önerir; sorun değil.
   - **Framework Preset:** kendiliğinden **Next.js** seçilir, dokunma.
   - **Environment Variables** bölümünü aç ve aşağıdaki satırları **tek tek** ekle. Her satır için sol kutuya adı (Key), sağ kutuya değeri (Value) yaz ve **Add** de:

| Key (ad) | Value (değer) |
|---|---|
| `YAPAY_ZEKA` | `gemini` |
| `GEMINI_API_KEY` | 2. adımda kopyaladığın `AIza…` anahtarı |
| `SUPABASE_URL` | 1. adımda kopyaladığın `https://…supabase.co` adresi |
| `SUPABASE_SECRET_KEY` | 1. adımda kopyaladığın `sb_secret_…` anahtarı |
| `CRON_SECRET` | Kendin uydurduğun, en az 32 karakterlik rastgele bir metin (harf ve rakam; boşluk ve Türkçe karakter olmadan). Bu, gece çalışan otomatik silme işini korur. |
| `ODEME_MODU` | `deneme` |

6. **Deploy** düğmesine bas. 1-3 dakika sürer. Bittiğinde ekranda tebrik mesajı görürsün.
7. **Continue to Dashboard** de. Üstte görünen adrese (`dilekto.vercel.app` gibi) tıkla: siten yayında!

### Kontrol listesi

Telefonundan siteyi aç ve şunları dene:

- [ ] Ana sayfanın en üstünde turuncu **"Deneme sürümü"** şeridi görünüyor.
- [ ] **Ücretsiz teste başla** → 6 soruyu cevapla → sonuç ekranı geliyor.
- [ ] Olayı anlat → **Önizlemeyi hazırla** → 15-40 saniye içinde önizleme açılıyor.
- [ ] **Devam et (deneme ödemesi)** → iki kutuyu işaretle → **Deneme ödemesini tamamla** → dilekçenin tamamı açılıyor.
- [ ] Bilgilerini yaz → **PDF olarak indir** ve **Word olarak indir** çalışıyor.

Bir adım çalışmazsa, Vercel'de projene gir → **Logs** sekmesine tıkla → kırmızı satırların ekran görüntüsünü bana gönder.

### Sitenin Google'da çıkmadığından emin olmak

Deneme sitesi, her sayfasında arama motorlarına "beni listeleme" (`noindex`) der. Bunun için bir şey yapmana gerek yok. Birkaç gün sonra Google'da `site:dilekto.vercel.app` diye arattığında hiçbir sonuç çıkmaması gerekir.

---

## Durum kontrolü ve hata kodları

Bir şey çalışmazsa önce **durum kontrolü** sayfasını aç:

`https://dilekto.vercel.app/durum?anahtar=CRON_SECRET_DEĞERİN`

(`CRON_SECRET_DEĞERİN` yerine Vercel'de `CRON_SECRET` için yazdığın metni yaz.)

Sayfa veritabanını ve yapay zekâyı tek tek dener. Her satırın yanında ✓ ya da ✕ görürsün; ✕ olan satırda **"Ne yapmalı"** kutusu çözümü yazar. Bu sayfa gerçek bir deneme dilekçesi ürettiği için ücretsiz kullanım hakkından bir istek harcar; gerektikçe aç.

Ziyaretçiler bir hata gördüğünde mesajın sonunda bir **hata kodu** yazar (ör. `Hata kodu: VT-ANAHTAR`). Anlamları:

| Kod | Anlamı | Ne yapmalı |
|---|---|---|
| `YZ-AYAR` | Yapay zekâ anahtarı girilmemiş | Vercel'de `GEMINI_API_KEY` ekle, yeniden yayınla |
| `YZ-ANAHTAR` | Yapay zekâ anahtarı geçersiz | Google AI Studio'da yeni anahtar oluştur, Vercel'de güncelle |
| `YZ-MODEL` | Model adı bulunamadı | Vercel'de `GEMINI_MODEL` ayarı varsa sil |
| `YZ-KOTA` | Ücretsiz kullanım sınırı doldu | Bir süre bekle ya da AI Studio'da faturalandırmayı aç |
| `YZ-BAGLANTI` | Gemini yanıt veremedi (çoğunlukla "model çok yoğun") | Site önce kendisi birkaç kez ve farklı modellerle dener. Birkaç dakika sonra tekrar dene; sürerse durum sayfasındaki "Ayrıntı" satırını bana gönder |
| `YZ-DENETIM` | Yapay zekâ kurallara uygun metin üretemedi | Tekrar dene; sürerse bana yaz |
| `YZ-BOLGE` | Gemini, sitenin çalıştığı sunucu bölgesinden kullanılamıyor | Vercel > **Settings** > **Functions** > **Function Region**: Washington, D.C., USA (iad1) seç, yeniden yayınla |
| `VT-AYAR` | Supabase ayarları girilmemiş | `SUPABASE_URL` ve `SUPABASE_SECRET_KEY` ekle |
| `VT-ANAHTAR` | Supabase anahtarı yanlış türde | **secret** (`sb_secret_…`) ya da **service_role** anahtarını gir; "publishable"/"anon" çalışmaz |
| `VT-TABLO` | Tablo oluşturulmamış | `supabase/kurulum.sql` dosyasını SQL Editor'da çalıştır |
| `VT-BAGLANTI` | Supabase'e ulaşılamıyor | `SUPABASE_URL` değerini kontrol et; proje uyuduysa **Restore project** de |

Ayarları yapıştırırken başa ya da sona karışan boşluklar artık kendiliğinden temizlenir.

---

## Robot koruması (Cloudflare Turnstile)

Yapay zekâ isteklerini otomatik araçların (robotların) sömürmesini engeller; böylece maliyet kontrol altında kalır. Ziyaretçilerin çoğu hiçbir şey görmez; yalnızca şüpheli durumlarda tek tıklık bir kutu çıkar. **İsteğe bağlıdır**: ayarlar girilmezse site korumasız çalışır.

1. **dash.cloudflare.com/sign-up** adresinde e-posta ve şifreyle ücretsiz hesap aç, e-postana gelen bağlantıyla hesabını doğrula.
2. Sol menüde **Turnstile**'a tıkla (menüde göremezsen üstteki arama kutusuna "Turnstile" yaz).
3. **Add widget** de:
   - **Widget name:** `Dilekto`
   - **Hostname management:** **Add Hostnames** de ve `dilekto.vercel.app` ekle (sitenin adresi farklıysa onu yaz). Alan adını bağladığında `dilekto.com` adresini de buraya ekleyeceğiz.
   - **Widget Mode:** **Managed**
   - **Create** de.
4. Açılan ekranda iki anahtar görürsün:
   - **Site Key** → Vercel'de `NEXT_PUBLIC_TURNSTILE_SITE_KEY` adıyla ekle
   - **Secret Key** → Vercel'de `TURNSTILE_SECRET_KEY` adıyla ekle
5. Vercel'de siteyi **yeniden yayınla** (aşağıdaki bölüme bak). Durum sayfasında "Robot koruması: açık" yazmalı.

---

## Bir ayarı sonradan değiştirmek

1. Vercel'de projene gir → **Settings** → **Environment Variables**.
2. Değiştirmek istediğin satırın sağındaki **⋯** → **Edit** de, yeni değeri yaz, **Save** de.
3. Ayarın geçerli olması için siteyi yeniden yayınla: **Deployments** sekmesi → en üstteki yayının sağındaki **⋯** → **Redeploy** → **Redeploy**.

### Yapay zekâyı Claude'a çevirmek (isteğe bağlı)

1. **console.anthropic.com** adresinde hesap aç, **Billing** bölümünden en az 5 $ kredi yükle.
2. **API Keys** → **Create Key** de, `sk-ant-` ile başlayan anahtarı kopyala.
3. Vercel'de `ANTHROPIC_API_KEY` adıyla bu anahtarı ekle, `YAPAY_ZEKA` değerini `claude` yap ve yeniden yayınla.

Kod başka bir değişiklik gerektirmez; ikisini aynı örneklerle deneyip daha iyi yazanı seçebiliriz.

---

## Alan adını bağlamak (sonra)

Deneme sürümünü beğendiğinde:

1. `dilekto.com` alan adını satın al. En kolayı, Vercel'de projen içinde **Settings** → **Domains** → **Buy** ile almaktır; bu durumda ayarlar kendiliğinden yapılır. Başka bir firmadan aldıysan bir sonraki adıma geç.
2. Vercel'de **Settings** → **Domains** → **Add** de, `dilekto.com` yaz, **Add** de. Vercel `www.dilekto.com` adresini de eklemeyi önerirse kabul et.
3. Alan adını başka bir firmadan aldıysan Vercel sana eklemen gereken **DNS kayıtlarını** (genellikle bir **A** ve bir **CNAME** kaydı) gösterir. Alan adını aldığın firmanın panelinde **DNS yönetimi** bölümüne bu kayıtları aynen gir. Kayıtların etkinleşmesi birkaç dakika ile birkaç saat sürebilir; Vercel'de yanında yeşil tik görünce hazırdır.
4. Vercel'de şu ayarı ekle: `SITE_ADRESI` = `https://dilekto.com`, sonra yeniden yayınla.
5. **Siteyi Google'a açmak** için (yalnızca gerçek satışa hazır olduğunda): `SITE_ARAMA_MOTORLARINA_ACIK` = `evet` ekle ve yeniden yayınla. Ardından Google Search Console'a siteyi ekleyeceğiz; bunu birlikte yaparız.

---

## Gerçek satışa geçmeden önce yapılacaklar

Bunları şimdi yapmana gerek yok; yalnızca bilgi için:

- **Vercel planı:** Vercel'in ücretsiz Hobby planı ticari kullanıma izin vermez. Gerçek ödeme almaya başlamadan önce ya Pro plana (aylık 20 $) geçeceğiz ya da siteyi ücretsiz Cloudflare'e taşıyacağız.
- **Yapay zekâ:** Gemini için Google AI Studio'da faturalandırmayı açacağız (ücretli katman) ya da Claude'a geçeceğiz. Ücretli katmanda gönderilen metinler model eğitiminde kullanılmaz.
- **Şirket bilgileri:** `src/config/site.ts` dosyasındaki satıcı bilgilerini (unvan, adres, vergi dairesi ve numarası, telefon) dolduracağız. Bunları bana iletmen yeterli.
- **Yasal metinler:** KVKK aydınlatma metni, kullanım şartları, mesafeli satış sözleşmesi ve iade koşulları taslaktır. Yayından önce bir uzmana okutmalısın.
- **Ödeme:** iyzico veya PayTR başvurusu ve bağlantısı için `docs/ODEME.md` dosyasına bak.
- **Fatura:** Her satış için e-Arşiv fatura kesilmesi gerekir; muhasebecinle konuş.
