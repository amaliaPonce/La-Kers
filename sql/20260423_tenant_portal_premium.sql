alter table public.incidents
  add column if not exists tenant_person_id uuid references public.tenant_persons(id) on delete set null,
  add column if not exists reported_by text not null default 'OWNER' check (reported_by in ('OWNER', 'TENANT', 'SYSTEM')),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists status_updated_at timestamptz not null default now(),
  add column if not exists closed_at timestamptz;

update public.incidents
set
  reported_by = coalesce(reported_by, 'OWNER'),
  updated_at = coalesce(updated_at, created_at, now()),
  status_updated_at = coalesce(status_updated_at, created_at, now()),
  closed_at = case
    when status = 'CLOSED' then coalesce(closed_at, updated_at, created_at, now())
    else closed_at
  end;

create index if not exists incidents_tenant_person_id_idx on public.incidents(tenant_person_id);
