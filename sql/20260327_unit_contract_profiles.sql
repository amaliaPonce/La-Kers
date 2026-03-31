alter table public.units
  add column if not exists contract_landlord_name text,
  add column if not exists contract_landlord_identification text,
  add column if not exists contract_landlord_address text;
