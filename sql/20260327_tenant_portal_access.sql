create table if not exists public.tenant_portal_access (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  tenant_person_id uuid not null references public.tenant_persons(id) on delete cascade,
  owner_id text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'REVOKED')),
  linked_via text not null default 'email_match' check (linked_via in ('manual', 'email_match')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create unique index if not exists tenant_portal_access_tenant_person_id_idx
  on public.tenant_portal_access(tenant_person_id);

create index if not exists tenant_portal_access_owner_id_idx
  on public.tenant_portal_access(owner_id);

create index if not exists tenant_portal_access_status_idx
  on public.tenant_portal_access(status);
