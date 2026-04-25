# Release Ready - Alquilio

Fecha: 2026-04-25

## Resumen de blockers originales

1. `npm audit` reportaba una vulnerabilidad crítica en Clerk (`GHSA-vqx2-fgx2-5wq9`).
2. `npm audit` reportaba un high en la cadena Express por `path-to-regexp` (`GHSA-37ch-88jc-xwx2`).
3. El tenant portal seguía permitiendo auto-vinculación por coincidencia de email sin invitación.
4. La separación owner/tenant dependía de `unsafeMetadata.portalRole` enviado desde cliente.

## Qué se corrigió

- Clerk actualizado a versiones seguras:
  - `@clerk/express@^2.1.9`
  - `@clerk/vue@^2.0.18`
- Cadena Express endurecida con `overrides`:
  - `path-to-regexp@0.1.13`
  - `follow-redirects@1.16.0`
- Dependencias productivas actualizadas para dejar `npm audit --omit=dev` limpio:
  - `axios@^1.15.2`
  - `node-cron@^4.2.1`
  - `postcss@^8.5.10`
- Tenant portal endurecido:
  - `ENABLE_TENANT_EMAIL_MATCH=false` por defecto.
  - Sin invitación válida, el backend devuelve `403`.
  - `email_match` solo se permite si el flag se habilita explícitamente.
- Autoridad de roles movida al backend:
  - owner/tenant ya no depende de `unsafeMetadata.portalRole`;
  - tenant se resuelve por `tenant_portal_access` activo;
  - el metadata de alta se eliminó del frontend.
- Compatibilidad de frontend ajustada al SDK actual de Clerk:
  - `SignedIn/SignedOut` sustituidos por `ClerkLoaded + Show`.

## Archivos modificados

- `backend/package.json`
- `frontend/package.json`
- `package.json`
- `package-lock.json`
- `backend/src/config/appConfig.ts`
- `backend/src/middleware/authMiddleware.ts`
- `backend/src/services/tenantPortalService.ts`
- `frontend/src/views/RegisterView.vue`
- `frontend/src/views/TenantRegisterView.vue`
- `frontend/src/App.vue`
- `backend/.env.example`
- `render.yaml`
- `SECURITY_AUDIT.md`

También permanecen las correcciones previas del audit inicial:

- `backend/src/services/paymentsService.ts`
- `backend/src/services/incidentsService.ts`
- `backend/src/services/ownersService.ts`
- `backend/src/services/billingService.ts`
- `backend/src/services/tenantPortalInviteService.ts`
- `backend/src/monitoring/sentry.ts`
- `backend/src/tests/billingService.test.ts`
- `frontend/src/services/tenantPortalInvite.ts`
- `frontend/src/views/TenantLoginView.vue`
- `frontend/src/views/TenantPortalView.vue`

## Riesgos residuales

- La base de datos sigue sin imponer por constraint la relación `payments.unit_id` <-> `payments.tenant_person_id`.
- La descarga legacy de documentos sigue leyendo `storage_path` desde base de datos.
- El backend mantiene configuración `AUTH_RATE_LIMIT_*` no aplicada a rutas concretas.
- El build frontend emite un warning de tamaño de chunk en Vite; no es un riesgo de seguridad.

## Variables nuevas

- `ENABLE_TENANT_EMAIL_MATCH=false`
  - Recomendado en producción.
  - Si se pone `true`, se recupera el comportamiento legacy de auto-enlace por email exacto.

## Estado de validación técnica

- `npm install`: OK
- `npm run build`: OK
- `npm --workspace backend run test`: OK
- `npm audit --omit=dev`: OK, `0 vulnerabilities`

## Checklist manual prelaunch

- Confirmar `CORS_ALLOWED_ORIGINS` con los dominios finales reales.
- Confirmar rotación y presencia segura de:
  - `CLERK_SECRET_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Mantener `ENABLE_TENANT_EMAIL_MATCH=false` en producción salvo excepción aprobada.
- Verificar que `backend/.env` y `frontend/.env` no estén versionados ni expuestos en deploy.
- Validar manualmente accesos PDF/documentos con cuentas y contratos reales.
- Hacer smoke test cruzado:
  - owner A
  - owner B
  - tenant A
  - tenant B

## Cómo validar owner flow

1. Crear o usar una cuenta owner limpia.
2. Iniciar sesión en `/sign-in`.
3. Verificar acceso a `/dashboard`, `/properties`, `/tenants`, `/payments`, `/incidents`, `/documents`, `/billing`.
4. Crear un inmueble, un tenant y un pago.
5. Confirmar que los datos creados no aparecen en una cuenta owner distinta.
6. Confirmar que una cuenta tenant activa recibe `403` si intenta consumir APIs owner.

## Cómo validar tenant flow

1. Con `ENABLE_TENANT_EMAIL_MATCH=false`, abrir `/tenant/sign-up` sin `invite`.
2. Verificar que la autenticación Clerk puede completarse, pero la API tenant devuelve error de invitación requerida hasta recibir invite válido.
3. Generar invitación desde owner y abrir `/tenant/sign-up?invite=...`.
4. Completar registro y verificar acceso a `/tenant`.
5. Confirmar que:
   - el token desaparece de la URL tras capturarse;
   - el tenant solo ve su contrato, pagos e incidencias;
   - no puede ver datos de otro tenant;
   - no puede usar APIs owner.
6. Repetir login en `/tenant/sign-in` sin `invite` una vez enlazada la cuenta y verificar acceso correcto por `tenant_portal_access`.

## Cómo validar billing flow

1. Iniciar checkout desde `/billing`.
2. Confirmar que el backend crea la sesión Stripe con `owner_id` propio del usuario autenticado.
3. Completar checkout en Stripe test mode.
4. Verificar webhook firmado en backend y actualización real de `owner_subscriptions`.
5. Confirmar que features premium dependen del estado backend y no de datos del frontend.
6. Abrir customer portal y comprobar que la vuelta a la app mantiene el mismo owner.
