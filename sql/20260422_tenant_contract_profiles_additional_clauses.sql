alter table public.tenant_contract_profiles
  add column if not exists additional_clauses text;
