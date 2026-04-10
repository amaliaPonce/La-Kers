# Handoff Guide

## Objetivo

Esta guía está pensada para que otra persona pueda clonar LA-KERS, levantarlo en local y entender qué partes están listas y qué dependencias externas necesita.

## Estado actual del proyecto

La base estable del proyecto incluye:

- backend Express con Clerk y Supabase
- frontend Vue 3 con panel owner
- billing con plan `Freemium` y `Pro`
- portal de inquilino con autenticación separada

## Qué tiene que preparar la persona que recibe el proyecto

### 1. Crear variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Debe rellenar:

- Supabase
- Clerk
- landlord identity
- opcionalmente Stripe

### 2. Aplicar SQL

Ejecutar en Supabase:

```sql
\i sql/schema.sql
\i sql/20260327_clerk_owner_ids.sql
\i sql/20260327_owner_subscriptions.sql
\i sql/20260327_tenant_portal_access.sql
```

Si no usa `psql`, puede copiar y ejecutar los scripts manualmente en el SQL editor de Supabase en ese orden.

### 3. Instalar y arrancar

```bash
npm install
npm run dev
```

URLs locales:

- frontend: `http://127.0.0.1:4173`
- backend: `http://localhost:4000`

## Flujo recomendado de demo

### Owner

1. Registrarse en `/sign-up`
2. Crear unidad/inmueble
3. Crear inquilino con email realista
4. Asegurar que el owner tiene plan `pro`
5. Revisar panel, documentos y billing

### Tenant

1. Registrarse en `/tenant/sign-up`
2. Usar el mismo email que existe en `tenant_persons.email`
3. Entrar en `/tenant`
4. Verificar la ficha del contrato y la vivienda

## Requisito importante para el tenant portal

El portal tenant se vincula por una de estas dos vías:

- registro previo en `tenant_portal_access`
- autolink por email entre Clerk y `tenant_persons.email`

Si el email no coincide o hay más de una coincidencia, el tenant portal no podrá entrar.

## Feature flags y gating funcional

- `Freemium`: base del producto
- `Pro`: más capacidad operativa asociada al plan

## Verificaciones mínimas antes de enseñar el proyecto

```bash
npm --workspace backend run check
npm --workspace frontend run check
```

Si quieres una validación más completa:

```bash
npm run build
npm test
```

## Limitaciones conocidas

- Los adjuntos binarios completos no están aún cerrados como flujo principal end-to-end.
- El tenant portal depende mucho de datos consistentes en Supabase.
- El repositorio local puede tener trabajo adicional no publicado; para una demo limpia conviene usar `main` y no ramas o cambios locales sin commit.

## Ficheros clave

- `README.md`
- `backend/src/services/tenantPortalService.ts`
- `frontend/src/views/TenantPortalView.vue`
- `sql/20260327_tenant_portal_access.sql`
