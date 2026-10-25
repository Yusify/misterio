-- ============================================================
-- MISTERIO — Supabase şeması
-- Supabase → SQL Editor → New query → hamısını yapışdır → RUN
-- ============================================================

-- ---------- 1) İSTİFADƏÇİLƏR ----------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text unique not null,
  phone       text,
  city        text,
  pass_hash   text not null,
  verified    boolean default false,
  code        text,
  sub         jsonb default '{}'::jsonb,
  payments    jsonb default '[]'::jsonb,
  created_at  timestamptz default now()
);
create index if not exists users_email_idx on public.users(lower(email));

-- ---------- 2) ŞİRKƏTLƏR ----------
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text unique not null,
  pass_hash   text not null,
  cat         text,
  disc        int default 10,
  phone       text,
  contract_id text,
  signed_at   timestamptz,
  status      text default 'aktiv',
  created_at  timestamptz default now()
);

-- ---------- 3) KUPONLAR ----------
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  seg_id      text,
  shop        text not null,
  disc        int not null,
  cat         text,
  code        text unique not null,
  status      text default 'active',
  created_at  timestamptz default now(),
  used_at     timestamptz
);
create index if not exists coupons_user_idx on public.coupons(user_id);
create index if not exists coupons_code_idx on public.coupons(code);

-- ---------- 4) SİFARİŞLƏR ----------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references public.companies(id) on delete set null,
  company_email text,
  code          text not null,
  shop          text,
  total         numeric(10,2) not null,
  disc          int not null,
  final         numeric(10,2) not null,
  created_at    timestamptz default now()
);
create index if not exists orders_company_idx on public.orders(company_id);

-- ---------- RLS (MVP: frontend anon açarı ilə işləyir) ----------
alter table public.users     enable row level security;
alter table public.companies enable row level security;
alter table public.coupons   enable row level security;
alter table public.orders    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['users','companies','coupons','orders'] loop
    execute format('drop policy if exists "%s_anon_all" on public.%I', t, t);
    execute format('create policy "%s_anon_all" on public.%I for all to anon, authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ---------- DEMO ŞİRKƏT HESABLARI ----------
-- şifrə SHA-256 hash: admin123 / dolma123 / brew123
insert into public.companies (name,email,pass_hash,cat,disc,phone) values
 ('Misterio Demo Restoran','info@misterio.az','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','restoran',20,'+994705621269'),
 ('Dolma House','dolma@restoran.az','037552dc7edc2b8ba5d78890c7a0a7a995c9236e57cb1f9180e1c3110132f528','restoran',30,'+994501112233'),
 ('Brew Bros Coffeeshop','brew@coffee.az','d3e061dda2c0254c8640b55a62a118ae69b89fd04df39e1502d77d3964f06bb4','coffee',20,'+994552223344')
on conflict (email) do nothing;
