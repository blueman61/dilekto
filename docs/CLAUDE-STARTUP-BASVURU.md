# Claude for Startups başvurusu: hazır cevaplar

Başvuru adresi: https://platform.claude.com/offers/startups-application (giriş gerekir)

Form İngilizce olacağı için cevaplar İngilizce yazıldı. `[...]` ile işaretli yerleri siz doldurun;
bilmediğim ya da sizin vermeniz gereken bilgileri uydurmadım.

## Temel bilgiler

| Alan | Cevap |
|---|---|
| Company / product name | Dilekto |
| Website | https://dilekto.com (alan adı bağlanana kadar: https://dilekto.vercel.app) |
| Contact email | info@fandora.com.tr |
| Legal entity | Sole proprietorship (şahıs şirketi), Türkiye. Ticari unvan: [...] |
| Founder name / role | [Adınız Soyadınız], Founder |
| Country | Türkiye |
| Stage | Pre-launch (working product in test mode; real payments not yet enabled) |
| Team size | [1] |
| Funding raised | [Yok / bootstrapped] |
| Accelerator / VC affiliation | [Yok] |

## One-line description

Dilekto helps consumers in Türkiye prepare their own consumer-rights complaint petitions (starting with
the Consumer Arbitration Committee, "Tüketici Hakem Heyeti") in minutes, in the correct official format.

## What are you building? (short)

Many people in Türkiye have a valid consumer complaint (a faulty phone, a damaged parcel, a refused refund)
but give up because writing a formal petition is confusing. Dilekto asks a free eligibility test, then a few
plain-language questions about what happened, and produces a ready-to-submit petition (PDF and Word) that
follows the official format and tells the user exactly where and how to file it (e-Devlet, in person, or
by post). Price: 149 TL one-time, preview is free. Designed to be extended with more petition types.

## How do you use (or plan to use) Claude?

- Claude would write the narrative parts of the petition (subject line, statement of facts, request) from the
  user's answers, in formal Turkish.
- Reading uploaded invoices (photo/PDF) to pre-fill product, seller, date and amount. Files are not stored.
- Safety design that fits Claude's structured output: the model never chooses legal citations. Legal
  references come only from a fixed, manually verified list; every model output is validated (unknown article
  numbers and forbidden claims are rejected and regenerated).
- Personal data (name, ID number, address, phone) never reaches the server or the model; it is added in the
  user's browser, and PDF/Word files are generated client-side. Records are deleted after 30 days.
- Today the live test version runs on Gemini's free tier; the provider is switchable by one setting
  (`YAPAY_ZEKA=claude` is already implemented), and we want to move to Claude for quality in formal Turkish.

## Current status (honest summary)

- Working product deployed on Vercel (Next.js, Supabase), test payment mode; Shopier payment integration
  implemented and tested, not yet switched on.
- 389 automated tests plus browser end-to-end tests (mobile and desktop, light and dark theme).
- 10 SEO guide pages for common complaint types; marketing plan for the first 100 customers.
- No paying customers yet. [Update this if it changes before you submit.]

## Why do you need credits / what would you do with them?

Monthly AI cost is the main variable cost of the product (one draft per user, plus optional invoice reading).
Credits would let us run Claude in production from launch, evaluate it against the current provider on
Turkish legal-style writing, and keep the price at 149 TL without a free-tier quota limiting growth.

## Notlar (başvuruyu göndermeden önce)

1. Program koşullarını (kimler başvurabilir, kredi miktarı) formda okuyun; bazı programlar yatırım almış ya da
   belirli bir kurumla bağlantılı şirketleri ister.
2. Ticari unvan, adınız, ekip sayısı ve finansman bilgisini siz girin.
3. Müşteri sayısını ya da gelir bilgisini, gerçek olmadıkça yazmayın.
4. Siteyi tanıtırken "avukat", "hukuki danışmanlık" ve "garanti" gibi ifadeleri kullanmıyoruz; formda da
   "yazı aracı / dilekçe hazırlama aracı" diye tarif edin.
