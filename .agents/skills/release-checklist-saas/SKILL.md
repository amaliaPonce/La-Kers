---
name: release-checklist-saas
description: Checklist de release para SaaS (Clerk+Stripe+multi-tenant+Vue+API). Usar cuando se pida “release”, “preprod”, “go-live”, “lanzar a producción” o verificación final.
license: MIT
metadata:
  uses_repo_docs:
    - "RELEASE_READY.md"
    - "SECURITY_AUDIT.md"
---

# Release Checklist (SaaS)

## Regla de oro

No “lanzar” solo porque el build compila: validar **seguridad multi-tenant**, **webhooks**, **secretos**, y **CORS/orígenes reales**.

## Preflight técnico (automatizable)

- Working tree limpio.
- Build:
  - `npm run build` (root / workspaces).
- Tests backend:
  - `npm --workspace backend run test` (o equivalente del repo).
- Auditoría dependencias productivas:
  - `npm audit --omit=dev` (cero high/critical).

## Configuración y secretos (manual)

- Confirmar que en producción existen y están rotados/protegidos:
  - `CLERK_SECRET_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (si aplica)
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Confirmar que `.env` no está versionado.

## Seguridad multi-tenant (manual, obligatoria)

Ejecutar smoke test cruzado:

- owner A: crear unidad/tenant/pago/incidencia/documento.
- owner B: confirmar que **no ve** nada de A.
- tenant A: solo ve su contrato/pagos/incidencias; no ve nada de otros tenants ni de owner B.
- tenant intentando APIs owner: **403**.

## Tenant portal (invitaciones)

- Si existe flag tipo `ENABLE_TENANT_EMAIL_MATCH`:
  - mantener **false** por defecto en prod salvo decisión explícita.
- Confirmar que el token de invitación:
  - se captura y se elimina de la URL,
  - se guarda de forma efímera (p.ej. `sessionStorage`),
  - se redacta en observabilidad.

## Billing (Stripe)

- Checkout:
  - sesión creada en backend con `owner_id` correcto.
- Webhooks:
  - verificación de firma + raw body.
  - tolerancia temporal y mitigación replay.
  - idempotencia por `event.id`.
- Customer portal:
  - retorno a la app mantiene el mismo owner (no cross-tenant).

## CORS y dominios

- Verificar `CORS_ALLOWED_ORIGINS` con los dominios reales finales (incluye tenant portal si es otro host/subdominio).
- Confirmar headers de seguridad en API y, si aplica, en estático/CDN.

## Salida requerida

- “Listo / No listo” con motivo.
- Lista corta de blockers (máximo 5) con pasos exactos para resolver.
- Plan de verificación post-deploy:
  - primer login owner, tenant, billing y webhooks.

