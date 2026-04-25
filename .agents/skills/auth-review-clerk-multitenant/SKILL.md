---
name: auth-review-clerk-multitenant
description: Revisión de autenticación y, sobre todo, autorización para SaaS multi-tenant con Clerk. Usar cuando se pida auth review, RBAC, separación owner/tenant, organizations, guards, o “evitar bypass”.
license: MIT
metadata:
  upstream_sources:
    - "clerk/skills (patterns, orgs, webhooks)"
  focus: "backend-authoritative authz"
---

# Auth Review (Clerk + Multi-tenant)

## Objetivo

Detectar bypass de autorización, errores de aislamiento entre tenants, y dependencias indebidas del frontend/metadata en decisiones de acceso.

## Reglas de seguridad

- **Backend como autoridad**: decidir acceso en el backend (no en router guards).
- **No confiar en metadata del cliente**: `unsafeMetadata`, flags UI, roles en localStorage, etc.
- **Principio de mínimo privilegio**: rutas y acciones denegadas por defecto.

## Flujo de revisión

### 1) Inventariar superficies de acceso

- **Owner app**: dashboard, unidades, tenants, pagos, incidencias, documentos, billing.
- **Tenant portal**: invitación/claim, contratos, pagos, incidencias, documentos.
- **APIs**: endpoints owner vs tenant, middlewares, resolución de actor.

### 2) Validar modelo de actor (quién eres)

- Extraer en backend:
  - `userId`/session desde Clerk.
  - `owner_id` (mapeo DB) y/o `tenant_person_id` vía acceso activo.
- Confirmar que **no existe** un camino donde un usuario “elige” ser owner/tenant desde el cliente.

### 3) Validar autorización (qué puedes hacer)

Para cada endpoint sensible:

- **Precondición**: autenticado.
- **Scope**: filtrar por `owner_id` o por `tenant_portal_access` activo.
- **Relaciones**: validar relación estructural \(owner → unit → tenant\) antes de escribir/leer.
- **Errores**: devolver 403/404 consistente; no filtrar existencia.

### 4) Multi-tenant: checks específicos

- **IDOR lógico**:
  - `tenant_person_id` provisto por el cliente debe validarse contra la `unit_id`/`owner_id`.
  - nunca mezclar IDs de distintos owners.
- **Invitaciones**:
  - tokens: minimización en URL, almacenamiento efímero, redacción en observabilidad.
  - claim atómico: transición condicional `PENDING -> CLAIMED`, dedupe, rollback seguro.
- **Email-match**:
  - deshabilitado por defecto; si se habilita, exigir decisión explícita y auditoría extra.

### 5) Checklist de Clerk (práctico)

- Variables de entorno:
  - `CLERK_SECRET_KEY` solo en backend.
  - publishable key solo en frontend.
- Verificar que rutas de API que requieren auth no quedan fuera de middleware/protecciones.
- Si se usan **Organizations**:
  - mapear org → tenant/owner en DB.
  - verificar que `orgId` no es el único check (si hay recursos por unidad/propiedad).

## Salida requerida

- Tabla de “rutas/acciones” vs “actor” vs “check aplicado”.
- Top hallazgos (CRITICAL/HIGH/MED/LOW) con remediación concreta.
- Plan de smoke test:
  - owner A vs owner B (no ver datos cruzados)
  - tenant A vs tenant B
  - tenant intentando APIs owner (403)

