# Render Deploy

Este repo queda preparado para desplegarse en Render con el blueprint de [render.yaml](/Users/Amalia/Desktop/La-Kers/render.yaml).

## Servicios que debes crear

- `la-kers-api`: `Web Service` con runtime `node`
- `la-kers-web`: `Static Site` definido en el blueprint como `type: web` + `runtime: static`

## Configuración que ya queda definida

### Backend `la-kers-api`

- Build command: `npm ci && npm --workspace backend run build`
- Start command: `npm --workspace backend run start`
- Puerto de runtime: `PORT=10000`
- Bind explícito en servidor: `0.0.0.0`
- Health check: `/ready`
- Disco persistente:
  - mount path: `/opt/render/project/src/backend/documents`
  - variable: `DOCUMENT_STORAGE_PATH=/opt/render/project/src/backend/documents`

### Frontend `la-kers-web`

- Build command: `npm ci && npm --workspace frontend run build`
- Publish path: `frontend/dist`
- Rewrite SPA: `/* -> /index.html`

## Variables de entorno

### Backend obligatorias

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `CLERK_SECRET_KEY`
- `LANDLORD_NAME`
- `LANDLORD_IDENTIFICATION`
- `LANDLORD_ADDRESS`

### Frontend obligatorias

- `VITE_CLERK_PUBLISHABLE_KEY`

### Opcionales si activas billing con Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO_MONTHLY`
- `STRIPE_PRICE_ID_PRO_YEARLY`
- `BILLING_CONTACT_EMAIL`

### Variables que no tienes que meter a mano porque ya las resuelve Render o el blueprint

- `NODE_ENV=production`
- `NODE_VERSION=20`
- `PORT=10000`
- `TRUST_PROXY=true`
- `ENABLE_CRON_JOBS=true`
- `REQUEST_BODY_LIMIT=1mb`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=300`
- `AUTH_RATE_LIMIT_WINDOW_MS=900000`
- `AUTH_RATE_LIMIT_MAX=20`
- `DOCUMENT_STORAGE_PATH=/opt/render/project/src/backend/documents`
- `CORS_ALLOWED_ORIGINS` desde la URL pública de `la-kers-web`
- `VITE_API_BASE` desde la URL pública de `la-kers-api`
- `RENDER_EXTERNAL_URL` la inyecta Render automáticamente

`APP_BASE_URL` no hace falta en Render porque el backend ya cae a `RENDER_EXTERNAL_URL`.

## Pasos exactos para desplegar

1. Sube el repositorio a GitHub con [render.yaml](/Users/Amalia/Desktop/La-Kers/render.yaml) incluido.
2. En Render, entra en `New` > `Blueprint`.
3. Conecta el repositorio y selecciona la rama que vas a desplegar.
4. Render detectará dos servicios:
   - `la-kers-api` como `Web Service`
   - `la-kers-web` como `Static Site`
5. Revisa que el backend quede con estos valores:
   - Build Command: `npm ci && npm --workspace backend run build`
   - Start Command: `npm --workspace backend run start`
   - Health Check Path: `/ready`
   - Disk mount path: `/opt/render/project/src/backend/documents`
6. Revisa que el frontend quede con estos valores:
   - Build Command: `npm ci && npm --workspace frontend run build`
   - Publish Directory: `frontend/dist`
7. Introduce los secretos obligatorios:
   - backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `CLERK_SECRET_KEY`, `LANDLORD_NAME`, `LANDLORD_IDENTIFICATION`, `LANDLORD_ADDRESS`
   - frontend: `VITE_CLERK_PUBLISHABLE_KEY`
8. Si vas a usar Stripe, introduce también: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY`, `BILLING_CONTACT_EMAIL`
9. Lanza el deploy del blueprint.
10. En Supabase SQL Editor ejecuta, en este orden exacto:
    - `sql/schema.sql`
    - `sql/20260327_clerk_owner_ids.sql`
    - `sql/20260327_owner_subscriptions.sql`
    - `sql/20260327_tenant_portal_access.sql`
11. Cuando el deploy termine, valida estas URLs:
    - `https://TU-API.onrender.com/ready`
    - `https://TU-API.onrender.com/health`
    - landing y login del frontend público
12. Haz la validación funcional mínima:
    - login owner
    - login tenant
    - alta de inmueble
    - alta de inquilino
    - generación o marcado de pagos
    - descarga de recibo PDF
    - descarga de contrato PDF

## Notas operativas

- Mantén una sola instancia del backend con `ENABLE_CRON_JOBS=true`.
- Si escalas a varias réplicas, desactiva cron en las secundarias.
- El backend está mejor en Render que en serverless puro porque usa cron en proceso y disco persistente.
