create table if not exists public.owner_profiles (
  owner_id text primary key,
  created_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  activated_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists owner_profiles_created_at_idx on public.owner_profiles(created_at);
create index if not exists owner_profiles_last_seen_at_idx on public.owner_profiles(last_seen_at);
create index if not exists owner_profiles_activated_at_idx on public.owner_profiles(activated_at);

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  actor_id text,
  actor_type text not null default 'OWNER' check (actor_type in ('OWNER', 'TENANT', 'ADMIN', 'SYSTEM')),
  event_name text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'danger')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists product_events_owner_id_idx on public.product_events(owner_id);
create index if not exists product_events_event_name_idx on public.product_events(event_name);
create index if not exists product_events_severity_idx on public.product_events(severity);
create index if not exists product_events_occurred_at_idx on public.product_events(occurred_at);
create index if not exists product_events_owner_occurred_at_idx on public.product_events(owner_id, occurred_at);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean,
  status text not null default 'received' check (status in ('received', 'processed', 'failed', 'duplicate')),
  attempts integer not null default 1 check (attempts > 0),
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text
);

create index if not exists stripe_webhook_events_event_type_idx on public.stripe_webhook_events(event_type);
create index if not exists stripe_webhook_events_status_idx on public.stripe_webhook_events(status);
create index if not exists stripe_webhook_events_last_received_at_idx on public.stripe_webhook_events(last_received_at);

create table if not exists public.stripe_billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text references public.stripe_webhook_events(stripe_event_id) on delete set null,
  event_type text not null,
  owner_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_invoice_id text,
  amount_cents integer,
  currency text,
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  subscription_status text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists stripe_billing_events_owner_id_idx on public.stripe_billing_events(owner_id);
create index if not exists stripe_billing_events_event_type_idx on public.stripe_billing_events(event_type);
create index if not exists stripe_billing_events_occurred_at_idx on public.stripe_billing_events(occurred_at);
create index if not exists stripe_billing_events_subscription_idx on public.stripe_billing_events(stripe_subscription_id);

create table if not exists public.api_request_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  actor_type text check (actor_type in ('OWNER', 'TENANT', 'ADMIN', 'SYSTEM')),
  method text not null,
  path text not null,
  status_code integer not null,
  duration_ms integer not null check (duration_ms >= 0),
  occurred_at timestamptz not null default now()
);

create index if not exists api_request_logs_owner_id_idx on public.api_request_logs(owner_id);
create index if not exists api_request_logs_path_idx on public.api_request_logs(path);
create index if not exists api_request_logs_status_code_idx on public.api_request_logs(status_code);
create index if not exists api_request_logs_occurred_at_idx on public.api_request_logs(occurred_at);
