## Skills de proyecto (Alquilio)

Estas skills se cargan desde `.agents/skills/` (descubrimiento automático por Cursor).

Diseñadas para este stack:

- **Frontend**: Vue
- **Auth**: Clerk
- **Billing**: Stripe (Checkout + Customer Portal + Webhooks)
- **Multi-tenant**: tenant portal + separación owner/tenant
- **Backend**: API Node/Express (según el repo)

### Catálogo

- `security-audit-saas`: auditoría de seguridad enfocada en OWASP + multi-tenant + Clerk + Stripe.
- `auth-review-clerk-multitenant`: revisión de authn/authz y aislamiento tenant (Clerk + backend).
- `stripe-webhook-validation`: validación robusta de webhooks Stripe (raw body, tolerancia temporal, idempotencia, replay).
- `release-checklist-saas`: checklist de release pre-prod orientado a SaaS (build/tests/audit, secretos, CORS, tenant).
- `design-system-review-vue`: revisión de consistencia UI/design system en Vue (a11y, tokens, componentes, estados).

