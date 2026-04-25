---
name: security-audit-saas
description: Auditoría de seguridad defensiva para un SaaS multi-tenant con Clerk + Stripe + portal de tenants + frontend Vue + backend API. Usar cuando se pida security audit, hardening, OWASP, revisión preproducción o “¿listo para lanzar?”.
license: MIT
metadata:
  scope: "SaaS multi-tenant (Clerk+Stripe+Vue+API)"
  safety: "read-only por defecto; no ejecutar acciones destructivas"
---

# Security Audit (SaaS Clerk + Stripe + Multi-tenant)

## Principios no negociables

- **No exponer secretos**: nunca imprimir tokens/keys; nunca pegarlos en el chat; si aparecen en logs, pedir rotación.
- **No asumir authz por metadata cliente**: tratar cualquier `unsafeMetadata`, claims en cliente o flags de UI como no confiables.
- **Separación tenant estricta**: revisar siempre “quién puede ver qué” en cada endpoint y consulta.
- **Verificar webhooks**: firma + tolerancia temporal + idempotencia + replay protection.
- **Cambios mínimos**: priorizar fixes de alto impacto y bajo riesgo.

## Entrada esperada (para auditoría del repo actual)

1. Identificar rutas y componentes clave:
   - backend: middlewares de auth, rutas tenant/owner, billing, documentos.
   - frontend: router guards, llamadas a API owner/tenant, storage de tokens de invitación.
2. Usar como fuente de verdad los documentos del repo si existen:
   - `SECURITY_AUDIT.md`
   - `RELEASE_READY.md`

## Checklist de hallazgos (en orden de prioridad)

### 1) Broken Access Control / IDOR (multi-tenant)

- Confirmar que **cada lectura/escritura** filtra por el actor correcto:
  - owner: `owner_id` desde backend auth (Clerk) y filtrado en DB/queries.
  - tenant: resolución por acceso activo (tabla de accesos / invitación reclamada), no por email suelto.
- Buscar mezclas peligrosas:
  - aceptar `tenant_person_id` opcional sin validar pertenencia a la `unit_id`/`owner_id`.
  - endpoints que confían en IDs desde el cliente sin verificación cruzada.
- Comprobar que el backend devuelve **403/404 coherentes** (evitar enumeración) y no filtra por “lo que venga”.

### 2) Webhooks (Stripe/Clerk)

- Stripe:
  - raw body (no JSON parse previo) para verificación.
  - `constructEvent`/equivalente con secreto `STRIPE_WEBHOOK_SECRET`.
  - **tolerancia temporal** (p.ej. 5 min) y mitigación de replay.
  - idempotencia por `event.id` (almacenado) + manejo de retries.
- Clerk webhooks:
  - verificación de firma (según SDK/headers reales).
  - mapear eventos (user/session/org) a sincronización DB sin confiar en payload no verificado.

### 3) Autenticación vs autorización (Clerk)

- Validar que:
  - “estar logueado” no implica permisos.
  - roles/planes/premium se deciden en backend y se persisten en DB.
  - rutas públicas/privadas están bien delimitadas; no hay bypass por rutas olvidadas.

### 4) Input validation + injection

- Validación fuerte en:
  - query params/ids, body schemas, uploads.
  - rutas de documentos/descargas: evitar path traversal; limitar a directorio permitido o storage virtual.
- Errores: no devolver trazas/valores internos ni IDs sensibles en mensajes.

### 5) Secret hygiene / logging / observabilidad

- Revisar:
  - redacción de headers, tokens, query params sensibles (Sentry, logs).
  - `.env` no versionado.

### 6) Dependencias y supply-chain

- Revisar auditoría de dependencias productivas:
  - `npm audit --omit=dev`
  - overrides/pins para transitivas vulnerables cuando aplique.

## Salida requerida

Generar un informe breve con:

- **Top 10 riesgos** (severidad, impacto, explotación, fix recomendado).
- **Quick wins** (cambios mínimos, bajo riesgo).
- **Bloqueadores de release** vs “puede esperar”.
- **Plan de verificación manual** (smoke tests owner/tenant + billing + documentos).

## Anti-patterns a marcar como HIGH/CRITICAL

- Authz basada en `unsafeMetadata`/front-end.
- Endpoints multi-tenant sin filtrado por actor.
- Webhook handler sin verificación de firma o sin idempotencia.
- Descargas de archivos basadas en rutas arbitrarias desde DB sin whitelisting.

