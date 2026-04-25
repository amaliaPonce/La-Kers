---
name: stripe-webhook-validation
description: Validación robusta de webhooks de Stripe (firma, raw body, tolerancia temporal, idempotencia, retries, replay). Usar cuando se implemente o revise un endpoint /webhooks/stripe o haya fallos de verificación.
license: MIT
metadata:
  upstream_sources:
    - "hookdeck/webhook-skills (stripe-webhooks patterns)"
  scope: "Node/Express backend API"
---

# Stripe Webhook Validation

## Objetivo

Implementar o auditar un handler de Stripe que sea **seguro** (no spoofing), **robusto** (retries), e **idempotente** (sin duplicados).

## Reglas críticas

- **Siempre verificar firma** con `STRIPE_WEBHOOK_SECRET`.
- **Raw body obligatorio**: no parsear JSON antes de la verificación.
- **Timing-safe compare** si se implementa verificación manual.
- **Idempotencia por `event.id`**: persistir “procesado” en DB.
- **Replay mitigation**: rechazar eventos fuera de ventana temporal y/o ya vistos.
- **No loggear** payload completo ni headers sensibles.

## Checklist de implementación (Express)

1. Endpoint `POST /webhooks/stripe`.
2. Middleware/body:
   - usar `express.raw({ type: 'application/json' })` en esa ruta.
3. Verificación:
   - extraer `Stripe-Signature` header.
   - construir evento con SDK de Stripe (construct/verify) usando el raw body.
   - aplicar tolerancia temporal (p.ej. 5 minutos) si está disponible en el SDK/implementación.
4. Idempotencia:
   - transacción: “insert event.id si no existe” antes de aplicar efectos.
   - si ya existe: devolver 200 OK (Stripe considera entregado).
5. Routing por tipo:
   - manejar explícitamente: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` (según el producto).
6. Respuesta:
   - **200** si verificado y aceptado (aunque sea no-op por idempotencia).
   - **401/400** si firma inválida o payload corrupto.

## Checklist de seguridad/operación

- **Rotación de secretos**: si hay sospecha de filtración, rotar `whsec_...`.
- **Entornos**: secretos distintos en staging/prod.
- **Observabilidad**:
  - loggear solo `event.id`, `event.type`, `livemode`, `requestId` si existe.
  - no loggear raw body.
- **Retries**:
  - asumir reintentos; nunca hacer side-effects no idempotentes (emails/DB writes) sin guard.

## Señales típicas de bug

- “Signature verification failed” intermitente: body ya parseado o middleware global JSON afectando.
- Duplicados de suscripción/pagos: falta de idempotencia por `event.id`.
- Estado premium inconsistente: confiar en frontend o no persistir la decisión backend.

## Salida requerida al aplicar esta skill

- Confirmar (en texto) que el handler:
  - verifica firma con raw body,
  - tiene idempotencia persistente,
  - maneja retries sin duplicados,
  - no filtra secretos en logs.

