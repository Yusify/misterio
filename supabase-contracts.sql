-- Misterio — contracts cədvəli (imzalı müqavilələrin bizim nüsxəsi)
-- Supabase SQL Editor-də çalışdırın.
create table if not exists public.contracts (
  id            uuid primary key default gen_random_uuid(),
  contract_id   text unique,                       -- brauzerin verdiyi C-<timestamp>
  company_name  text not null,
  email         text not null,
  cat           text,
  disc          int,
  phone         text,
  address       text,
  sign          text,                              -- tərəfdaşın imzası (ad soyad)
  signed_at     timestamptz not null default now(),
  version       text default 'v1.0',
  status        text default 'aktiv',
  created_at    timestamptz not null default now()
);

-- İndekslər
create index if not exists idx_contracts_email on public.contracts (email);
create index if not exists idx_contracts_signed on public.contracts (signed_at desc);

-- Təhlükəsizlik: RLS MVP-də bağlı (yalnız service_role yazır/oxuyur).
-- Ödəniş dövriyyəsindən əvvəl açılacaq.
alter table public.contracts disable row level security;
