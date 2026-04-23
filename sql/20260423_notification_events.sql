create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete cascade,
  owner_id text,
  tenant_person_id uuid references public.tenant_persons(id) on delete set null,
  notification_type text not null,
  recipient text,
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'SKIPPED', 'FAILED')),
  sent_at timestamptz,
  dedupe_key text not null,
  metadata jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists notification_events_dedupe_key_idx
  on public.notification_events(dedupe_key);

create index if not exists notification_events_payment_id_idx
  on public.notification_events(payment_id);

create index if not exists notification_events_owner_id_idx
  on public.notification_events(owner_id);

create index if not exists notification_events_tenant_person_id_idx
  on public.notification_events(tenant_person_id);

create index if not exists notification_events_type_idx
  on public.notification_events(notification_type);

create index if not exists notification_events_status_idx
  on public.notification_events(status);
