create table if not exists public.tenant_contract_profiles (
  tenant_person_id uuid primary key references public.tenant_persons(id) on delete cascade,
  company_name text not null,
  trade_name text,
  tax_id text not null,
  company_email text,
  company_phone text,
  fiscal_address_line_1 text not null,
  fiscal_address_line_2 text,
  fiscal_postal_code text not null,
  fiscal_city text not null,
  fiscal_province text,
  fiscal_country text not null,
  legal_representative_name text not null,
  legal_representative_id text not null,
  legal_representative_role text,
  iban text,
  contract_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tenant_contract_profiles_company_name_idx
  on public.tenant_contract_profiles(company_name);

create index if not exists tenant_contract_profiles_tax_id_idx
  on public.tenant_contract_profiles(tax_id);
