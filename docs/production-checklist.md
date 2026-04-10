# Production Checklist

## Release Gate
- Run `npm run build`.
- Run `npm test`.
- Validate owner login, tenant login, apartment CRUD, tenant CRUD, payment marking, receipt download and contract finalization end to end.
- Validate that generated contract PDFs download through `GET /contracts/:contractId/pdf`.

## Runtime
- Set `NODE_ENV=production`.
- Set `APP_BASE_URL` to the public backend URL if your platform does not inject it automatically.
- Set `CORS_ALLOWED_ORIGINS` to the exact frontend origins allowed to call the API.
- Set `CLERK_SECRET_KEY` in the backend runtime.
- Set `VITE_CLERK_PUBLISHABLE_KEY` in the frontend runtime.
- Set `LANDLORD_NAME`, `LANDLORD_IDENTIFICATION` and `LANDLORD_ADDRESS`.
- If you enable automatic billing, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO_MONTHLY` and `STRIPE_PRICE_ID_PRO_YEARLY`.
- Review `TRUST_PROXY=true` when running behind Nginx, Render, Railway, Fly.io, or another reverse proxy.
- Keep `REQUEST_BODY_LIMIT` small unless a larger payload is strictly required.

## Storage and Data
- Run the SQL scripts in this order before opening production:
  - `sql/schema.sql`
  - `sql/20260327_clerk_owner_ids.sql`
  - `sql/20260327_owner_subscriptions.sql`
  - `sql/20260327_tenant_portal_access.sql` only if tenant portal is enabled
- Do not run ad hoc SQL to promote users, toggle plans, or link accounts in production.
- Do not store generated PDFs or logs in Git.
- Rotate Supabase keys if any secret was ever committed or shared insecurely.

## HTTP and Access
- Put the backend behind HTTPS.
- Restrict the frontend to the production API base URL via `VITE_API_BASE`.
- Verify `/health` and `/ready` from the deployment platform.
- If using Stripe, expose and verify `POST /billing/webhook` from the public backend URL.
- Confirm rate limits do not block expected internal traffic.

## Cron Jobs
- Keep `ENABLE_CRON_JOBS=false` on the free deployment target.
- If you later deploy more than one backend replica, enable cron on only one instance.
- Do not scale horizontally until you have a shared strategy for cron and rate limiting.

## Operations
- Ensure your platform captures stdout/stderr logs from the backend process.
- Add database backups in Supabase and confirm recovery steps.
- Add uptime and error monitoring before opening the product to real users.
- Keep a staging validation pass before each production release.
- Use [docs/api-production-runbook.md](/Users/Amalia/Desktop/La-Kers/docs/api-production-runbook.md) as the ordered deployment runbook.
