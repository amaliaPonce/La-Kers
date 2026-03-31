create table if not exists public.owner_subscriptions (
  owner_id text primary key,
  plan_id text not null default 'freemium' check (plan_id in ('freemium', 'pro')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  stripe_checkout_session_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists owner_subscriptions_plan_id_idx on public.owner_subscriptions(plan_id);
create index if not exists owner_subscriptions_status_idx on public.owner_subscriptions(subscription_status);
create unique index if not exists owner_subscriptions_stripe_customer_id_idx on public.owner_subscriptions(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists owner_subscriptions_stripe_subscription_id_idx on public.owner_subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;
