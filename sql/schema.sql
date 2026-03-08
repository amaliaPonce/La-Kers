-- Habilitar extension necesaria para gen_random_uuid
create extension if not exists "pgcrypto";

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_rent numeric not null,
  status text not null check (status in ('AVAILABLE','OCCUPIED','RESERVED')),
  address text,
  city text,
  postal_code text,
  created_at timestamp with time zone default now()
);

create table if not exists tenant_persons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  full_name text not null,
  identification text not null,
  email text,
  contract_start date not null,
  contract_end date not null,
  deposit_amount numeric default 0,
  deposit_status text not null default 'pendiente' check (deposit_status in ('pendiente','devuelta','parcial')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','ARCHIVED')),
  archived_at timestamp with time zone,
  is_anonymized boolean not null default false,
  created_at timestamp with time zone default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  tenant_person_id uuid not null references tenant_persons(id) on delete cascade,
  amount numeric not null,
  due_date date not null,
  paid_date timestamp with time zone null,
  status text not null check (status in ('PENDING','PAID','LATE')),
  month int not null,
  year int not null,
  created_at timestamp with time zone default now()
);

create unique index if not exists payments_unit_month_year_unique on payments(unit_id, month, year);

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('OPEN','IN_PROGRESS','CLOSED')),
  cost numeric null,
  created_at timestamp with time zone default now()
);

create table if not exists contract_documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references tenant_persons(id) on delete cascade,
  document_type text not null check (document_type in ('CONTRACT_TERMINATION')),
  name text not null,
  storage_path text not null,
  url text not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);
