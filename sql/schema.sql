create extension if not exists "pgcrypto";

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_rent numeric(12,2) not null check (monthly_rent >= 0),
  status text not null check (status in ('AVAILABLE', 'OCCUPIED', 'RESERVED')),
  address text,
  city text,
  postal_code text,
  contract_landlord_name text,
  contract_landlord_identification text,
  contract_landlord_address text,
  owner_id text not null,
  created_at timestamptz not null default now()
);

alter table public.units
  add column if not exists contract_landlord_name text,
  add column if not exists contract_landlord_identification text,
  add column if not exists contract_landlord_address text;

create index if not exists units_owner_id_idx on public.units(owner_id);
create index if not exists units_status_idx on public.units(status);

create table if not exists public.tenant_persons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  full_name text not null,
  identification text not null,
  email text,
  contract_start date not null,
  contract_end date not null,
  deposit_amount numeric(12,2) not null default 0 check (deposit_amount >= 0),
  deposit_status text not null default 'pendiente' check (deposit_status in ('pendiente', 'devuelta', 'parcial')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'ARCHIVED')),
  archived_at timestamptz,
  is_anonymized boolean not null default false,
  created_at timestamptz not null default now(),
  constraint tenant_contract_dates_check check (contract_end >= contract_start)
);

create index if not exists tenant_persons_unit_id_idx on public.tenant_persons(unit_id);
create index if not exists tenant_persons_status_idx on public.tenant_persons(status);
create index if not exists tenant_persons_archived_at_idx on public.tenant_persons(archived_at);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  tenant_person_id uuid not null references public.tenant_persons(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  due_date date not null,
  paid_date timestamptz,
  payment_method text check (payment_method in ('CASH', 'BANK')),
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'LATE')),
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2000),
  created_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists payment_method text check (payment_method in ('CASH', 'BANK'));

create unique index if not exists payments_unit_month_year_unique on public.payments(unit_id, month, year);
create index if not exists payments_tenant_person_id_idx on public.payments(tenant_person_id);
create index if not exists payments_due_date_idx on public.payments(due_date);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_payment_method_idx on public.payments(payment_method);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('OPEN', 'IN_PROGRESS', 'CLOSED')),
  cost numeric(12,2) check (cost is null or cost >= 0),
  created_at timestamptz not null default now()
);

create index if not exists incidents_unit_id_idx on public.incidents(unit_id);
create index if not exists incidents_status_idx on public.incidents(status);

create table if not exists public.contract_documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.tenant_persons(id) on delete cascade,
  document_type text not null check (document_type in ('CONTRACT_TERMINATION')),
  name text not null,
  storage_path text not null,
  url text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contract_documents_contract_id_idx on public.contract_documents(contract_id);
create index if not exists contract_documents_document_type_idx on public.contract_documents(document_type);

create table if not exists public.owner_subscriptions (
  owner_id text primary key,
  plan_id text not null default 'freemium' check (plan_id in ('freemium', 'pro')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  stripe_checkout_session_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists owner_subscriptions_plan_id_idx on public.owner_subscriptions(plan_id);
create index if not exists owner_subscriptions_status_idx on public.owner_subscriptions(subscription_status);
create unique index if not exists owner_subscriptions_stripe_customer_id_idx on public.owner_subscriptions(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists owner_subscriptions_stripe_subscription_id_idx on public.owner_subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;
