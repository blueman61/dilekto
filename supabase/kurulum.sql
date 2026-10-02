-- Dilekto veritabanı kurulumu
-- Supabase > SQL Editor > New query: bu dosyanın tamamını yapıştırıp "Run" deyin.
-- Birden fazla kez çalıştırmak zarar vermez.

create table if not exists public.dilekceler (
  id          uuid primary key default gen_random_uuid(),
  tur         text not null,
  durum       text not null default 'onizleme' check (durum in ('onizleme', 'odendi')),
  test        jsonb not null,          -- uygunluk testi cevapları (kişisel bilgi içermez)
  hikaye      jsonb not null,          -- olay anlatımı (kişisel bilgi istenmez)
  cikti       jsonb not null,          -- yapay zekânın yazdığı bölümler
  saglayici   text not null,           -- hangi yapay zekâ ile üretildiği
  fiyat       integer not null,        -- TL
  odeme       jsonb,                   -- ödeme sağlayıcısı, referans, tarih
  olusturma   timestamptz not null default now(),
  silinecek   timestamptz not null default now() + interval '30 days'
);

create index if not exists dilekceler_olusturma_idx on public.dilekceler (olusturma);
create index if not exists dilekceler_silinecek_idx on public.dilekceler (silinecek);

-- Satır düzeyi güvenlik açık, hiçbir kurala izin verilmiyor:
-- tabloya yalnızca sunucudaki gizli anahtar (secret key) erişebilir.
alter table public.dilekceler enable row level security;
