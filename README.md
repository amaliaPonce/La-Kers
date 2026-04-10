# LA-KERS

SaaS inmobiliario con backend Express/TypeScript y frontend Vue 3. El producto incluye gestión de inmuebles, inquilinos, pagos, incidencias, documentos, billing y portal del inquilino autenticado.

Este repositorio está preparado para handoff técnico. Si vas a compartirlo con otra persona, empieza por aquí y luego revisa [docs/handoff-guide.md](docs/handoff-guide.md).

## Stack

- Backend: Express + TypeScript
- Frontend: Vue 3 + Vite + Tailwind
- Auth: Clerk
- Database: Supabase Postgres
- Billing: Stripe

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Proyecto de Supabase accesible
- Proyecto de Clerk
- Opcional: Stripe si quieres probar checkout/webhooks

## Arranque rápido

Desde la raíz:

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Servicios locales por defecto:

- Backend: `http://localhost:4000`
- Frontend: `http://127.0.0.1:4173`

## Variables de entorno

### Backend

Configura `backend/.env` con al menos:

- `PORT=4000`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `CLERK_SECRET_KEY`
- `APP_BASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `TRUST_PROXY`
- `ENABLE_CRON_JOBS`
- `REQUEST_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `LANDLORD_NAME`
- `LANDLORD_IDENTIFICATION`
- `LANDLORD_ADDRESS`

Opcionales:

- `DOCUMENT_STORAGE_PATH`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO_MONTHLY`
- `STRIPE_PRICE_ID_PRO_YEARLY`
- `BILLING_CONTACT_EMAIL`

### Frontend

Configura `frontend/.env` con:

- `VITE_API_BASE=/api`
- `VITE_CLERK_PUBLISHABLE_KEY`

En desarrollo, Vite ya proxifica `/api` hacia `http://localhost:4000`.

## Base de datos

Orden recomendado de ejecución en Supabase:

1. `sql/schema.sql`
2. `sql/20260327_clerk_owner_ids.sql`
3. `sql/20260327_owner_subscriptions.sql`
4. `sql/20260327_tenant_portal_access.sql`

Notas:

- `sql/schema.sql` crea las tablas base como `units`, `tenant_persons`, `payments`, `incidents` y `contract_documents`.
- `20260327_owner_subscriptions.sql` es necesaria para el gating por plan y billing.
- `20260327_tenant_portal_access.sql` habilita acceso al portal de inquilino.

## Rutas importantes

### Owner portal

- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/apartments`
- `/tenants`
- `/payments`
- `/incidents`
- `/documents`
- `/billing`

### Tenant portal

- `/tenant/sign-in`
- `/tenant/sign-up`
- `/tenant`

## Qué incluye ahora mismo

- Gestión de inmuebles
- Gestión de inquilinos
- Pagos y recibos PDF
- Contratos y documentos
- Incidencias
- Billing con plan `Freemium` y `Pro`
- Portal de inquilino autenticado con Clerk

## Flujo tenant portal

El acceso del inquilino funciona así:

1. El usuario se registra o inicia sesión en Clerk por `/tenant/sign-up` o `/tenant/sign-in`.
2. El backend valida que esa cuenta corresponde a un inquilino activo.
3. El enlace se resuelve desde `tenant_portal_access` o por coincidencia automática del email con `tenant_persons.email`.

Para que funcione bien en demo:

- el email de Clerk del inquilino debe coincidir con `tenant_persons.email`
- el inquilino debe estar en estado `ACTIVE`
- debe existir una relación válida con la unidad y el propietario

## Comandos útiles

Desde la raíz:

```bash
npm run dev
npm run build
npm test
```

Validaciones por workspace:

```bash
npm --workspace backend run check
npm --workspace frontend run check
```

## Producción

Antes de desplegar:

- revisa [docs/production-checklist.md](docs/production-checklist.md)
- sigue [docs/api-production-runbook.md](docs/api-production-runbook.md)
- si usas Render, revisa [docs/render-deploy.md](docs/render-deploy.md)

## Limitaciones actuales

- El portal tenant depende de Clerk + correspondencia real de email o linkage manual.
- El árbol de trabajo local puede contener cambios no incluidos en el último commit funcional; para compartir una demo estable, usa commits ya publicados en `main`.

## Referencias de handoff

- [docs/handoff-guide.md](docs/handoff-guide.md)
- [docs/production-checklist.md](docs/production-checklist.md)
