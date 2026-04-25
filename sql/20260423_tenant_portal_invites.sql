alter table public.tenant_portal_access
  drop constraint if exists tenant_portal_access_linked_via_check;

alter table public.tenant_portal_access
  add constraint tenant_portal_access_linked_via_check
  check (linked_via in ('manual', 'email_match', 'invite_link'));

create table if not exists public.tenant_portal_invites (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  tenant_person_id uuid not null references public.tenant_persons(id) on delete cascade,
  token_hash text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING', 'CLAIMED', 'REVOKED', 'EXPIRED')),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  claimed_by_clerk_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tenant_portal_invites_owner_id_idx on public.tenant_portal_invites(owner_id);
create index if not exists tenant_portal_invites_tenant_person_id_idx on public.tenant_portal_invites(tenant_person_id);
create index if not exists tenant_portal_invites_status_idx on public.tenant_portal_invites(status);
