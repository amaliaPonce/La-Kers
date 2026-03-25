# Production Checklist

## Runtime
- Set `NODE_ENV=production`.
- Set `APP_BASE_URL` to the public backend URL.
- Set `CORS_ALLOWED_ORIGINS` to the exact frontend origins allowed to call the API.
- Set `LANDLORD_NAME`, `LANDLORD_IDENTIFICATION` and `LANDLORD_ADDRESS`.
- Review `TRUST_PROXY=true` when running behind Nginx, Render, Railway, Fly.io, or another reverse proxy.
- Keep `REQUEST_BODY_LIMIT` small unless a larger payload is strictly required.

## Cron Jobs
- If you deploy more than one backend replica, set `ENABLE_CRON_JOBS=true` on only one instance.
- Set `ENABLE_CRON_JOBS=false` on the rest to avoid duplicated monthly payments and retention jobs.

## Storage and Data
- Persist `backend/documents` or configure `DOCUMENT_STORAGE_PATH` to a durable volume.
- Run `sql/schema.sql` before the first production boot.
- Do not store generated PDFs or logs in Git.
- Rotate Supabase keys if any secret was ever committed or shared insecurely.

## HTTP and Access
- Put the backend behind HTTPS.
- Restrict the frontend to the production API base URL via `VITE_API_BASE`.
- Verify `/health` and `/ready` from the deployment platform.
- Confirm rate limits do not block expected internal traffic.

## Release Checks
- Run `npm run build`.
- Run `npm test`.
- Test register, login, apartment CRUD, tenant CRUD, payment marking, receipt download and contract finalization end to end.
- Validate that generated contract PDFs download through `GET /contracts/:contractId/pdf`.

## Operations
- Ensure logs are collected from `backend/logs` or `logs` according to your process manager working directory.
- Add database backups in Supabase and confirm recovery steps.
- Add uptime and error monitoring before opening the product to real users.
