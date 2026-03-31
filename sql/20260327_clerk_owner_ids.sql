drop table if exists public.owner_billing;

alter table if exists public.units
  drop constraint if exists units_owner_id_fkey;

alter table if exists public.units
  alter column owner_id type text using owner_id::text;
