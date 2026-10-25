-- ============================================================
-- MISTERIO — TƏHLÜKƏSİZ SXEM (v2)
-- Bütün köhnə məlumat silinir, sxem sıfırdan qurulur.
-- Frontend artıq bazaya BİRBAŞA yazmır — yalnız /api/ vasitəsilə.
-- ============================================================

-- ── 1. TƏMİZLƏMƏ ────────────────────────────────────────────
drop trigger if exists trg_coupon_no_revert on public.coupons;
drop trigger if exists trg_order_immutable on public.orders;
drop function if exists public.coupon_no_revert() cascade;
drop function if exists public.order_immutable() cascade;

drop table if exists public.orders     cascade;
drop table if exists public.coupons    cascade;
drop table if exists public.companies  cascade;
drop table if exists public.users      cascade;
drop table if exists public.rate_limit cascade;

create extension if not exists pgcrypto;

-- ── 2. USERS ────────────────────────────────────────────────
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  phone         text,
  city          text,
  pass_hash     text not null,              -- bcrypt (salt daxildir)
  verified      boolean not null default false,
  verify_code   text,
  verify_expires timestamptz,
  sub           jsonb not null default '{}'::jsonb,
  payments      jsonb not null default '[]'::jsonb,
  failed_logins int not null default 0,
  locked_until  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.users (lower(email));

-- ── 3. COMPANIES ────────────────────────────────────────────
create table public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  pass_hash     text not null,              -- bcrypt
  cat           text not null,
  disc          int  not null check (disc between 1 and 90),
  phone         text,
  address       text,
  contract_id   text,
  signed_at     timestamptz,
  active        boolean not null default true,
  failed_logins int not null default 0,
  locked_until  timestamptz,
  created_at    timestamptz not null default now()
);
create index on public.companies (lower(email));
create index on public.companies (cat) where active;

-- ── 4. COUPONS ──────────────────────────────────────────────
create table public.coupons (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  shop       text not null,
  cat        text,
  disc       int  not null check (disc between 1 and 90),
  code       text not null unique,
  status     text not null default 'active' check (status in ('active','used','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  used_at    timestamptz
);
create index on public.coupons (user_id, status);
create index on public.coupons (code);

-- ── 5. ORDERS ───────────────────────────────────────────────
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  coupon_id  uuid not null references public.coupons(id),
  code       text not null,
  total      numeric(10,2) not null check (total > 0 and total <= 100000),
  disc       int  not null check (disc between 1 and 90),
  final      numeric(10,2) not null check (final >= 0),
  created_at timestamptz not null default now(),
  unique (coupon_id)                     -- bir kupon = bir sifariş, təkrar mümkün deyil
);
create index on public.orders (company_id, created_at desc);

-- ── 6. RATE LIMIT ───────────────────────────────────────────
create table public.rate_limit (
  key        text primary key,
  hits       int not null default 1,
  window_start timestamptz not null default now()
);

-- ── 7. TRIGGER: istifadə olunmuş kupon geri qaytarıla bilməz ──
create or replace function public.coupon_no_revert()
returns trigger language plpgsql as $$
begin
  if old.status = 'used' and new.status <> 'used' then
    raise exception 'İstifadə olunmuş kupon bərpa oluna bilməz';
  end if;
  if old.code <> new.code or old.user_id <> new.user_id or old.disc <> new.disc then
    raise exception 'Kuponun əsas sahələri dəyişdirilə bilməz';
  end if;
  return new;
end $$;
create trigger trg_coupon_no_revert
  before update on public.coupons
  for each row execute function public.coupon_no_revert();

-- ── 8. TRIGGER: sifariş dəyişdirilə/silinə bilməz ───────────
create or replace function public.order_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'Sifariş qeydi dəyişdirilə və ya silinə bilməz';
end $$;
create trigger trg_order_immutable
  before update or delete on public.orders
  for each row execute function public.order_immutable();

-- ── 9. RLS: HAMISI BAĞLI ────────────────────────────────────
-- anon və authenticated açarlar HEÇ NƏ edə bilmir.
-- service_role RLS-i keçir (yalnız serverdə istifadə olunur).
alter table public.users      enable row level security;
alter table public.companies  enable row level security;
alter table public.coupons    enable row level security;
alter table public.orders     enable row level security;
alter table public.rate_limit enable row level security;

alter table public.users      force row level security;
alter table public.companies  force row level security;
alter table public.coupons    force row level security;
alter table public.orders     force row level security;
alter table public.rate_limit force row level security;

-- Heç bir policy yaratmırıq → anon üçün tam qapalı.
-- Yalnız bir istisna: çarx üçün şirkət siyahısı (parolsuz, publik məlumat)
create or replace view public.public_companies as
  select id, name, cat, disc from public.companies where active;

revoke all on public.users, public.companies, public.coupons,
              public.orders, public.rate_limit from anon, authenticated;
grant select on public.public_companies to anon, authenticated;

-- ── 10. DEMO ŞİRKƏTLƏR (parol: API vasitəsilə bcrypt ilə yazılacaq) ──
-- Bu addım /api/seed tərəfindən icra olunur.
