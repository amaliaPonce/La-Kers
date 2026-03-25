# Render Deploy

This repo is configured for a two-service Render deployment:

- `la-kers-api`: Node web service for the Express backend
- `la-kers-web`: static site for the Vite frontend

The setup is defined in [render.yaml](/Users/Amalia/Desktop/La-Kers/render.yaml).

## What Render will create

- A Node web service that runs `npm --workspace backend run start`
- A persistent disk mounted at `/opt/render/project/src/backend/documents`
- A static site that builds the frontend and rewrites all routes to `index.html`
- Frontend `VITE_API_BASE` wired to the backend public URL
- Backend `CORS_ALLOWED_ORIGINS` wired to the frontend public URL

## Secrets you must provide in Render

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `LANDLORD_NAME`
- `LANDLORD_IDENTIFICATION`
- `LANDLORD_ADDRESS`

Render will prompt for these because they are marked with `sync: false`.

## Deploy steps

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Review the two services in `render.yaml`.
4. Enter the required secret values when prompted.
5. Run `sql/schema.sql` in Supabase before the first real use of the app.
6. After the first deploy, open:
   - backend `/health`
   - backend `/ready`
   - frontend landing/login
7. Test login, tenants, payments, receipts and contract PDF download end to end.

## Notes

- Keep only one backend instance with `ENABLE_CRON_JOBS=true`.
- If you scale horizontally later, move rate limiting to a shared store or edge provider.
- The backend can derive its public base URL from Render's `RENDER_EXTERNAL_URL`, so `APP_BASE_URL` is optional on Render.
