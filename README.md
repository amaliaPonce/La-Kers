# Alquilio

Alquilio es un SaaS inmobiliario con backend Express/TypeScript y frontend Vue 3. El producto incluye gestión de inmuebles, inquilinos, pagos, incidencias, documentos, billing y portal del inquilino autenticado.

Este repositorio está preparado para handoff técnico. Si vas a compartirlo con otra persona, empieza por aquí y luego revisa [docs/handoff-guide.md](docs/handoff-guide.md).

## Stack

- Backend: Express + TypeScript
- Frontend: Vue 3 + Vite + Tailwind
- Auth: Clerk
- Database: Supabase Postgres
- Billing: Stripe Checkout + webhooks

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Proyecto de Supabase accesible
- Proyecto de Clerk
- Stripe para checkout/webhooks automáticos de Pro

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
- `MINIMAL_MODE=true`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`
- `APP_BASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `TRUST_PROXY`
- `ENABLE_CRON_JOBS`
- `ENABLE_TENANT_PORTAL`
- `ENABLE_TENANT_PORTAL_PREMIUM`
- `ENABLE_DASHBOARD_REALTIME`
- `TENANT_CONTRACT_RENEWAL_NOTICE_DAYS`
- `TENANT_PORTAL_INVITE_TTL_DAYS`
- `CLERK_USER_CACHE_TTL_MS`
- `BILLING_MODE`
- `REQUEST_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `LANDLORD_NAME`
- `LANDLORD_IDENTIFICATION`
- `LANDLORD_ADDRESS`

Adicionales si usas el valor por defecto `BILLING_MODE=stripe`:

- `SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO_MONTHLY`
- `STRIPE_PRICE_ID_PRO_YEARLY`
- `BILLING_CONTACT_EMAIL`

### Frontend

Configura `frontend/.env` con:

- `VITE_MINIMAL_MODE=true`
- `VITE_API_BASE=/api`
- `VITE_ENABLE_TENANT_PORTAL=false`
- `VITE_ENABLE_TENANT_PORTAL_PREMIUM=false`
- `VITE_ENABLE_DASHBOARD_REALTIME=false`
- `VITE_CLERK_PUBLISHABLE_KEY`

En desarrollo, Vite ya proxifica `/api` hacia `http://localhost:4000`.

## Base de datos

Orden recomendado de ejecución en Supabase:

1. `sql/schema.sql`
2. `sql/20260327_clerk_owner_ids.sql`
3. `sql/20260327_owner_subscriptions.sql`
4. `sql/20260413_tenant_contract_profiles.sql`
5. `sql/20260327_tenant_portal_access.sql`
6. `sql/20260423_tenant_portal_premium.sql`
7. `sql/20260423_tenant_portal_invites.sql`

Notas:

- `sql/schema.sql` crea las tablas base como `units`, `tenant_persons`, `tenant_contract_profiles`, `payments`, `incidents` y `contract_documents`.
- `20260327_owner_subscriptions.sql` es recomendable si vas a persistir upgrades o control de plan.
- `20260413_tenant_contract_profiles.sql` añade la ficha de datos fiscales/contractuales 1:1 para cada inquilino.
- `20260327_tenant_portal_access.sql` solo es necesaria si activas el portal de inquilino.
- `20260423_tenant_portal_premium.sql` añade trazabilidad mínima de incidencias para el portal tenant premium.
- `20260423_tenant_portal_invites.sql` añade invitaciones personales por enlace para acceso tenant.
- En producción ejecuta solo esas migraciones reproducibles. No ejecutes parches ad hoc, seeds de usuarios ni promociones manuales de plan.

## Modo mínimo

El repositorio queda configurado para arrancar en modo mínimo por defecto:

- `BILLING_MODE=stripe`: activa Stripe como flujo normal de upgrade a Pro.
- `ENABLE_CRON_JOBS=false`: evita trabajos en segundo plano innecesarios en instancias pequeñas.
- `ENABLE_TENANT_PORTAL=false`: desactiva el portal tenant y sus consultas extra a Clerk/Supabase.
- `ENABLE_TENANT_PORTAL_PREMIUM=false`: mantiene el portal tenant en modo básico aunque el owner tenga `Pro`.
- `ENABLE_DASHBOARD_REALTIME=false`: elimina SSE y refrescos en vivo para reducir conexiones y carga.
- `MINIMAL_MODE=true`: hace que esos defaults sean conservadores hasta que los habilites explícitamente.

Si de forma excepcional necesitas desactivar billing automático, cambia `BILLING_MODE=manual`.

En este modo ya no hace falta `DOCUMENT_STORAGE_PATH`: los PDFs de finalización de contrato se regeneran en memoria desde metadatos guardados en base de datos.

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
- Portal de inquilino autenticado con Clerk, opcional en modo mínimo
- Portal tenant premium con pagos, documentos, incidencias y aviso de renovación cuando el owner está en `Pro`

## Flujo tenant portal

El acceso del inquilino funciona así:

1. El owner genera un enlace personal desde la ficha del inquilino en `/tenants`.
2. El inquilino abre `/tenant/sign-up?invite=...` o `/tenant/sign-in?invite=...`.
3. El frontend guarda ese token y lo envía al backend al cargar `/tenant`.
4. El backend reclama la invitación y crea `tenant_portal_access` para ese Clerk user.
5. Si no hay invitación, el flujo legacy por coincidencia de email sigue funcionando.

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

- El portal tenant depende de Clerk + correspondencia real de email o linkage manual cuando está activado.
- El modo mínimo reduce automatizaciones y sincronización en vivo a cambio de menos dependencias y menos tráfico externo.
- El árbol de trabajo local puede contener cambios no incluidos en el último commit funcional; para compartir una demo estable, usa commits ya publicados en `main`.

## Referencias de handoff

- [docs/handoff-guide.md](docs/handoff-guide.md)
- [docs/production-checklist.md](docs/production-checklist.md)
