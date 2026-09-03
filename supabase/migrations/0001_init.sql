-- Schéma initial — application de gestion de boutique de téléphones.
-- Voir prompts/03-modele-donnees.md pour le détail des décisions.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────

create type user_role as enum ('owner', 'manager');
create type phone_condition as enum ('neuf', 'quasi_neuf');
create type phone_status as enum ('en_stock', 'reserve', 'vendu');
create type payment_method as enum ('especes', 'orange_money', 'wave', 'carte', 'autre');
create type payment_status as enum ('paye', 'partiel', 'en_attente');

-- ── profiles ─────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'manager',
  phone text,
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── settings (une seule ligne) ──────────────────────────────────────────

create table settings (
  id int primary key default 1,
  shop_name text not null default 'Ma Boutique',
  shop_logo_url text,
  shop_phone text,
  shop_whatsapp text,
  shop_email text,
  shop_address text,
  managers_see_purchase_price boolean not null default false,
  managers_see_profit boolean not null default false,
  invoice_prefix text not null default 'FAC',
  constraint settings_singleton check (id = 1)
);

insert into settings (id) values (1);

-- ── suppliers ────────────────────────────────────────────────────────────

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  whatsapp text,
  city text,
  notes text,
  created_at timestamptz not null default now()
);

-- ── clients ──────────────────────────────────────────────────────────────

create table clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  whatsapp text,
  email text,
  city text,
  created_at timestamptz not null default now()
);

-- ── phones ───────────────────────────────────────────────────────────────

create table phones (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  imei text not null unique,
  condition phone_condition not null,
  ram text,
  storage text not null,
  color text,
  email text,
  status phone_status not null default 'en_stock',
  supplier_id uuid references suppliers (id) on delete set null,
  arrival_date date not null default current_date,
  purchase_price numeric(12, 0) not null,
  extra_fees numeric(12, 0) not null default 0,
  planned_sale_price numeric(12, 0) not null,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint phones_amounts_non_negative check (
    purchase_price >= 0 and extra_fees >= 0 and planned_sale_price >= 0
  )
);

create index phones_imei_idx on phones (imei);
create index phones_status_idx on phones (status);
create index phones_brand_idx on phones (brand);
create index phones_supplier_idx on phones (supplier_id);

-- ── sales ────────────────────────────────────────────────────────────────

create table sales (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid not null unique references phones (id),
  client_id uuid not null references clients (id),
  sale_date date not null default current_date,
  sale_price numeric(12, 0) not null,
  discount numeric(12, 0) not null default 0,
  profit numeric(12, 0) not null default 0,
  payment_method payment_method not null,
  warranty text,
  payment_status payment_status not null default 'paye',
  amount_paid numeric(12, 0) not null default 0,
  amount_due numeric(12, 0) not null default 0,
  sold_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  constraint sales_amount_paid_bounds check (
    amount_paid >= 0 and amount_paid <= sale_price - discount
  ),
  constraint sales_prices_non_negative check (
    sale_price >= 0 and discount >= 0 and discount <= sale_price
  )
);

create index sales_client_idx on sales (client_id);
create index sales_sale_date_idx on sales (sale_date);
create index sales_payment_status_idx on sales (payment_status);

-- ── sale_payments (historique des versements, cf. prompt 08) ──────────────

create table sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales (id) on delete cascade,
  amount numeric(12, 0) not null check (amount > 0),
  method payment_method not null,
  paid_at timestamptz not null default now(),
  recorded_by uuid references profiles (id)
);

create index sale_payments_sale_idx on sale_payments (sale_id);

-- ── invoice_counters + invoices ─────────────────────────────────────────

create table invoice_counters (
  year int primary key,
  last_number int not null default 0
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null unique references sales (id),
  number text not null unique,
  created_at timestamptz not null default now()
);

create index invoices_number_idx on invoices (number);
