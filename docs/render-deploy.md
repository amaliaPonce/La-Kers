# Render Deploy

Este repo queda preparado para desplegarse en Render Free con el blueprint de [render.yaml](/Users/Amalia/Desktop/La-Kers/render.yaml).

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
- Modo mínimo activado por defecto
- Sin disco persistente montado
- Sin cron obligatorio en runtime

### Frontend `la-kers-web`

- Build command: `npm ci && npm --workspace frontend run build`
- Publish path: `frontend/dist`
- Rewrite SPA: `/* -> /index.html`

## Variables de entorno

### Backend obligatorias

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
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
- `MINIMAL_MODE=true`
- `TRUST_PROXY=true`
- `ENABLE_CRON_JOBS=false`
- `ENABLE_TENANT_PORTAL=false`
- `ENABLE_DASHBOARD_REALTIME=false`
- `BILLING_MODE=manual`
- `REQUEST_BODY_LIMIT=1mb`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=300`
- `AUTH_RATE_LIMIT_WINDOW_MS=900000`
- `AUTH_RATE_LIMIT_MAX=20`
- `CORS_ALLOWED_ORIGINS` desde la URL pública de `la-kers-web`
- `VITE_API_BASE` desde la URL pública de `la-kers-api`
- `VITE_MINIMAL_MODE=true`
- `VITE_ENABLE_TENANT_PORTAL=false`
- `VITE_ENABLE_DASHBOARD_REALTIME=false`
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
6. Revisa que el frontend quede con estos valores:
   - Build Command: `npm ci && npm --workspace frontend run build`
   - Publish Directory: `frontend/dist`
7. Introduce los secretos obligatorios:
   - backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `LANDLORD_NAME`, `LANDLORD_IDENTIFICATION`, `LANDLORD_ADDRESS`
   - frontend: `VITE_CLERK_PUBLISHABLE_KEY`
8. Si vas a usar Stripe, introduce también: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY`, `BILLING_CONTACT_EMAIL`
9. Lanza el deploy del blueprint.
10. En Supabase SQL Editor ejecuta, en este orden exacto:
    - `sql/schema.sql`
    - `sql/20260327_clerk_owner_ids.sql`
    - `sql/20260327_owner_subscriptions.sql`
    - `sql/20260327_tenant_portal_access.sql` solo si reactivas el portal tenant
11. Cuando el deploy termine, valida estas URLs:
    - `https://TU-API.onrender.com/ready`
    - `https://TU-API.onrender.com/health`
    - landing y login del frontend público
12. Haz la validación funcional mínima:
    - login owner
    - alta de inmueble
    - alta de inquilino
    - generación o marcado de pagos
    - descarga de recibo PDF
    - descarga de contrato PDF

## Notas operativas

- Render Free permite coste 0€, pero no es producción robusta: el servicio puede dormirse, reiniciarse o suspenderse si genera mucho tráfico saliente.
- El backend ya no necesita disco persistente para PDFs de finalización; los documentos se regeneran en memoria desde metadatos en Supabase.
- Si más adelante activas cron o tenant portal, revisa si el free tier sigue siendo suficiente para tu tráfico real.
