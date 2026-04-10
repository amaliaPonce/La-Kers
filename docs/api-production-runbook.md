# API Production Runbook

Checklist operativa para sacar la API a producción en Render sin dejar pasos implícitos.

## 1. Prepara la release

Antes de desplegar:

1. Confirma que `main` compila y pasa tests:
   - `npm run build`
   - `npm test`
2. Confirma que el flujo mínimo del producto está estable en local:
   - login owner
   - alta de inmueble
   - alta de inquilino
   - alta o generación de pagos
   - marcar pago como abonado
   - descarga de recibo PDF
   - finalización de contrato y descarga de PDF
3. Si vas a abrir billing automático, confirma también:
   - checkout de Stripe
   - retorno a `/billing`
   - webhook `POST /billing/webhook`
   - actualización de plan en `owner_subscriptions`

## 2. Crea los servicios en Render

Usa el blueprint definido en [render.yaml](/Users/Amalia/Desktop/La-Kers/render.yaml).

Se crean dos servicios:

- `la-kers-api`: backend Express
- `la-kers-web`: frontend estático

## 3. Carga secretos y variables

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

### Backend opcionales pero necesarias si activas billing automático

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO_MONTHLY`
- `STRIPE_PRICE_ID_PRO_YEARLY`
- `BILLING_CONTACT_EMAIL`

### Variables ya resueltas por el blueprint

- `NODE_ENV=production`
- `PORT=10000`
- `TRUST_PROXY=true`
- `ENABLE_CRON_JOBS=true`
- `DOCUMENT_STORAGE_PATH=/opt/render/project/src/backend/documents`
- `CORS_ALLOWED_ORIGINS` apuntando al frontend público
- `VITE_API_BASE` apuntando a la API pública

## 4. Aplica SQL en Supabase

Ejecuta los scripts en este orden exacto:

1. `sql/schema.sql`
2. `sql/20260327_clerk_owner_ids.sql`
3. `sql/20260327_owner_subscriptions.sql`
4. `sql/20260327_tenant_portal_access.sql`

No dejes solo `schema.sql`. El producto actual depende también de billing y tenant portal.
No ejecutes SQL fuera de esa lista en producción. Quedan explícitamente fuera parches manuales de usuarios, activaciones directas de plan y scripts locales no versionados como migraciones.

## 5. Haz el primer deploy

Después del primer deploy valida:

1. `GET /health`
2. `GET /ready`
3. carga de landing
4. login owner
5. login tenant

## 6. Ejecuta validación funcional en staging

Checklist mínima:

1. Crear owner en Clerk y entrar al panel.
2. Crear un inmueble.
3. Crear un inquilino activo con email real.
4. Entrar al portal tenant con ese mismo email.
5. Crear o generar pagos y marcar uno como abonado.
6. Descargar recibo PDF.
7. Finalizar contrato y descargar PDF.
8. Entrar al portal tenant y validar la ficha del contrato.
9. Si Stripe está activo, completar compra PRO y verificar webhook.

## 7. Revisa operación antes de abrir

1. Mantén una sola réplica del backend con `ENABLE_CRON_JOBS=true`.
2. No escales horizontalmente sin rediseñar:
   - cron jobs
   - rate limiting
3. Activa backups en Supabase.
4. Activa monitorización de uptime y errores.
5. Revisa rotación de claves si alguna credencial fue compartida fuera de un canal seguro.

## 8. Limitaciones que debes aceptar antes de abrir

- La API está preparada para Render; no es una buena candidata para serverless puro porque usa cron en proceso y disco persistente.
- El tenant portal depende de relación correcta entre Clerk y `tenant_persons.email` o del linkage en `tenant_portal_access`.
- El rate limit actual es en memoria de proceso; sirve para una única instancia, no para varias réplicas.

## 9. Criterio de salida a producción

Considera la API lista para abrir solo si todo esto está hecho:

- build y tests en verde
- secretos completos en Render
- SQL completo aplicado
- healthchecks accesibles
- storage persistente montado
- flujo owner validado
- flujo tenant validado
- PDFs validados
- Stripe validado o explícitamente desactivado
- backups y monitoring activos
