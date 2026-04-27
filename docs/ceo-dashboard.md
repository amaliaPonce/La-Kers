# CEO Dashboard

## Setup

- Apply `sql/20260426_ceo_analytics.sql` in Supabase after the base schema/migrations.
- Set `CEO_ADMIN_EMAILS` in the backend runtime to the exact Clerk primary email allowed to access `/ceo`.
- Keep `CLERK_SECRET_KEY` server-side only; the CEO guard verifies the primary email through Clerk in the backend.

## Data Sources

- `owner_profiles`: SaaS tenant/owner lifecycle and activation timestamp.
- `product_events`: product usage, onboarding, invites, portal access, billing and risk events.
- `stripe_webhook_events`: Stripe webhook delivery status, retries and idempotency by `event.id`.
- `stripe_billing_events`: Stripe invoice/subscription/refund events persisted from verified webhooks.
- `api_request_logs`: backend endpoint status and latency for p95/p99/error analysis.

## KPI Definitions

- Tenant means SaaS customer owner (`owner_id`), not the final renter in `tenant_persons`.
- Active owner means an owner with non-passive product events in the selected range.
- Activation means the owner has at least one property, one tenant and one payment.
- DAU/WAU/MAU are unique owners with non-passive product events in 1/7/30 days ending at the selected `to` date.
- MRR uses active Pro subscriptions from `owner_subscriptions`, monthly prices from `plans.ts`, and yearly plans divided by 12.
- ARR is `MRR * 12`; ARPA is MRR divided by active subscriptions.
- Stripe fees are shown as unavailable in v1 unless future webhook payloads persist them.
- Historical Stripe metrics are complete only from the deploy that includes this migration and webhook persistence.

## Verification

- CEO user: sign in with an email listed in `CEO_ADMIN_EMAILS`, open `/ceo`, and verify cards/tables load.
- Non-CEO owner: open `/ceo` and call `/ceo-analytics/summary`; both must return no data and the API must be `403`.
- Tenant portal user: call `/ceo-analytics/summary`; the API must be `403`.
- Stripe webhook duplicate: replay the same verified event; `stripe_webhook_events.attempts` increments and business effects are not duplicated.
- CSV: click the export buttons and verify `summary`, `tenants` and `events` files download.

## Commands

```bash
npm --workspace backend run test
npm --workspace frontend run build
npm run build
```
