# Security Audit - Alquilio

Fecha de auditoría: 2026-04-25

## Resumen Ejecutivo

Se ha realizado una auditoría defensiva del proyecto Alquilio sobre backend, frontend, tenant portal, billing, documentos, migraciones y dependencias, con foco en OWASP Top 10 y ASVS.

Conclusión:

- Se han corregido los bloqueos prioritarios de lanzamiento detectados en dependencias y control de acceso:
  - actualización de Clerk a ramas corregidas y compatibles;
  - fijación de la cadena Express vulnerable a `path-to-regexp`;
  - desactivación por defecto de `email_match` en tenant portal mediante flag;
  - eliminación de la dependencia en `unsafeMetadata.portalRole` como fuente de autorización.
- También se corrigieron varios hallazgos de alto impacto en la capa de aplicación:
  - endurecimiento de ownership `owner/unit/tenant` en pagos e incidencias;
  - mitigación de replay de webhooks de Stripe;
  - mitigación de carrera en el claim de invitaciones tenant;
  - reducción de exposición del token de invitación en frontend y Sentry.
- Permanecen riesgos residuales y revisiones manuales importantes:
  - la base de datos no impone todavía una restricción estructural entre `payments.unit_id` y `payments.tenant_person_id`;
  - la descarga legacy de documentos sigue dependiendo de `storage_path` persistido;
  - conviene validar manualmente la matriz real de accesos owner/tenant con datos de producción.

Decisión recomendada:

- El proyecto queda técnicamente listo para producción desde el punto de vista de los blockers auditados, condicionado a completar las comprobaciones manuales de preproducción marcadas en este documento.

## Alcance y Método

Revisión estática de:

- autenticación/autorización y guards;
- tenant portal e invitaciones;
- Stripe y billing;
- validación de entrada;
- documentos/PDF;
- CORS, headers y logging;
- esquema SQL y migraciones;
- dependencias.

No se realizaron ataques destructivos ni explotación activa.

## Verificaciones Ejecutadas

- `npm --workspace backend run test`: OK
- `npm run build`: OK
- `npm run lint`: no existe script `lint`
- `npm audit --omit=dev`: OK
  - `critical`: 0
  - `high`: 0
  - `moderate`: 0

## Riesgos Críticos

| Hallazgo | Archivo/Línea | Impacto | Recomendación | Estado |
| --- | --- | --- | --- | --- |
| Dependencia Clerk vulnerable a bypass de protección por middleware según `npm audit` (`@clerk/shared`, advisory `GHSA-vqx2-fgx2-5wq9`) | `backend/package.json:14`, `frontend/package.json:12` | Podía invalidar la confianza en la protección de rutas si el vector afectaba al stack desplegado | Corregido actualizando a `@clerk/express@2.1.9` y `@clerk/vue@2.0.18`, y revalidando build/tests/audit | corregido |

## Riesgos Altos

| Hallazgo | Archivo/Línea | Impacto | Recomendación | Estado |
| --- | --- | --- | --- | --- |
| Falta de validación fuerte de relación `owner -> unit -> tenant` al crear pagos; podía permitir mezclar `tenant_person_id` ajeno con una `unit_id` válida del owner, generando exposición cruzada en portal tenant y corrupción lógica | `backend/src/routes/payments.ts:57-77`, `backend/src/services/paymentsService.ts:170-182`, `backend/src/services/ownersService.ts:48-87` | Broken Access Control / IDOR lógico entre propietarios e inquilinos | Corregido endureciendo ownership y filtrado por owner en lecturas y reconciliación de pagos tenant | corregido |
| Falta de validación equivalente en incidencias al aceptar `tenant_person_id` opcional | `backend/src/services/incidentsService.ts:40-60`, `backend/src/services/ownersService.ts:48-87` | Posible asociación inconsistente de incidencias con tenants no pertenecientes a la unidad o propietario | Corregido validando ownership cuando se informa `tenant_person_id` | corregido |
| Verificación de firma de webhooks Stripe sin tolerancia temporal | `backend/src/services/billingService.ts:434-466` | Permite replay de un webhook firmado si el payload y la firma son capturados | Corregido añadiendo tolerancia temporal de 5 minutos y test unitario | corregido |
| Claim de invitaciones tenant no atómico; dos peticiones concurrentes podían competir por la misma invitación | `backend/src/services/tenantPortalInviteService.ts:172-239`, `backend/src/services/tenantPortalService.ts:220-279` | Riesgo de takeover bajo condición de carrera y estado inconsistente de invitaciones | Corregido con transición condicional `PENDING -> CLAIMED` y rollback best-effort si falla el upsert de acceso | corregido |
| Dependencia `path-to-regexp` reportada por `npm audit` como ReDoS high | `package.json:13-16`, `backend/package.json:19` | Riesgo de denegación de servicio a través del árbol Express dependiente | Corregido fijando `path-to-regexp@0.1.13` por `overrides` y revalidando build/tests/audit | corregido |

## Riesgos Medios

| Hallazgo | Archivo/Línea | Impacto | Recomendación | Estado |
| --- | --- | --- | --- | --- |
| El tenant portal podía enlazarse automáticamente por coincidencia exacta de email, sin invitación activa | `backend/src/config/appConfig.ts:57-124`, `backend/src/services/tenantPortalService.ts:167-299`, `backend/.env.example:11-18`, `render.yaml:19-26` | Las garantías de expiración, unicidad y uso único de la invitación quedaban incompletas si el email del tenant bastaba para auto-vincular | Corregido dejando `ENABLE_TENANT_EMAIL_MATCH=false` por defecto; solo se mantiene el comportamiento antiguo si se habilita explícitamente | corregido |
| La separación owner/tenant dependía de `unsafeMetadata.portalRole` de Clerk | `backend/src/middleware/authMiddleware.ts:35-75`, `backend/src/services/tenantPortalService.ts:122-165`, `frontend/src/views/RegisterView.vue:81-89`, `frontend/src/views/TenantRegisterView.vue:40-48` | Un tenant podía intentar forzar la barrera lógica si el metadata era manipulable desde cliente | Corregido moviendo la autoridad al backend: tenant se resuelve por `tenant_portal_access` activo y se elimina el metadata del alta Clerk | corregido |
| Token de invitación tenant persistido y transportado con mayor exposición de la necesaria | `frontend/src/services/tenantPortalInvite.ts:1-39`, `frontend/src/views/TenantLoginView.vue:57-81`, `frontend/src/views/TenantRegisterView.vue:58-82`, `frontend/src/views/TenantPortalView.vue:692-705`, `backend/src/monitoring/sentry.ts:30-40` | Riesgo de exposición por historial, compartición accidental de URL, monitorización o XSS | Corregido migrando a `sessionStorage`, eliminando `?invite=` de la URL tras capturarlo y redactando cabeceras sensibles en Sentry | corregido |
| La base de datos no impone una restricción estructural entre `payments.unit_id` y `payments.tenant_person_id` | `sql/schema.sql:73-94` | Si entra dato por SQL directo, script futuro o bug externo al backend, el modelo sigue permitiendo filas inconsistentes | Añadir en una migración futura un constraint/trigger que garantice que el tenant pertenece a la unidad del pago | pendiente |
| Dependencias moderadas productivas en frontend/backend (`axios`, `follow-redirects`, `postcss`, `node-cron`, `uuid`) | `frontend/package.json:11-27`, `backend/package.json:13-29`, `package.json:13-16` | Añadían superficie adicional en cliente/servidor | Corregido actualizando `axios`, `follow-redirects`, `postcss`, `node-cron` y regenerando lockfile con `npm audit --omit=dev` limpio | corregido |

## Riesgos Bajos

| Hallazgo | Archivo/Línea | Impacto | Recomendación | Estado |
| --- | --- | --- | --- | --- |
| Descarga de contratos legacy usa `storage_path` desde DB y lee con `path.resolve/readFile` | `backend/src/controllers/contractsController.ts:93-118` | Si una fila de `contract_documents` fuese manipulada externamente, podría apuntar a un fichero local arbitrario | En producción, permitir solo almacenamiento virtual o limitar la lectura a un directorio aprobado | requiere revisión manual |
| Existe configuración específica de rate limit para auth pero no se aplica en runtime | `backend/src/config/appConfig.ts:120-121`, `backend/src/app.ts:41-45` | Riesgo bajo en esta app porque el login real lo gestiona Clerk, pero crea falsa sensación de protección local | O eliminar la configuración sobrante, o aplicarla explícitamente a endpoints propios sensibles si aparecen | pendiente |

## Archivos Revisados

- `backend/src/app.ts`
- `backend/src/middleware/authMiddleware.ts`
- `backend/src/middleware/securityHeaders.ts`
- `backend/src/middleware/rateLimit.ts`
- `backend/src/routes/*.ts`
- `backend/src/services/apartmentsService.ts`
- `backend/src/services/billingService.ts`
- `backend/src/services/contractsService.ts`
- `backend/src/services/documentPdfService.ts`
- `backend/src/services/documentService.ts`
- `backend/src/services/incidentsService.ts`
- `backend/src/services/ownersService.ts`
- `backend/src/services/paymentsService.ts`
- `backend/src/services/tenantContractProfilesService.ts`
- `backend/src/services/tenantPortalInviteService.ts`
- `backend/src/services/tenantPortalPremiumService.ts`
- `backend/src/services/tenantPortalService.ts`
- `backend/src/monitoring/sentry.ts`
- `backend/src/config/*.ts`
- `frontend/src/router/index.ts`
- `frontend/src/services/apiClient.ts`
- `frontend/src/services/tenantApiClient.ts`
- `frontend/src/services/tenantPortalInvite.ts`
- `frontend/src/views/TenantLoginView.vue`
- `frontend/src/views/TenantRegisterView.vue`
- `frontend/src/views/TenantPortalView.vue`
- `sql/schema.sql`
- `sql/*.sql`
- `backend/package.json`
- `frontend/package.json`
- `render.yaml`

## Cambios Mínimos Aplicados

- Ownership fuerte para pagos e incidencias:
  - `backend/src/services/ownersService.ts`
  - `backend/src/services/paymentsService.ts`
  - `backend/src/services/incidentsService.ts`
  - `backend/src/services/tenantPortalPremiumService.ts`
  - `backend/src/services/contractsService.ts`
- Hardening Stripe webhook:
  - `backend/src/services/billingService.ts`
  - `backend/src/tests/billingService.test.ts`
- Hardening tenant invite flow:
  - `backend/src/services/tenantPortalInviteService.ts`
  - `backend/src/services/tenantPortalService.ts`
  - `frontend/src/services/tenantPortalInvite.ts`
  - `frontend/src/views/TenantLoginView.vue`
  - `frontend/src/views/TenantRegisterView.vue`
  - `frontend/src/views/TenantPortalView.vue`
- Cierre de blockers de lanzamiento:
  - `backend/package.json`
  - `frontend/package.json`
  - `package.json`
  - `backend/src/config/appConfig.ts`
  - `backend/src/middleware/authMiddleware.ts`
  - `backend/src/services/tenantPortalService.ts`
  - `frontend/src/views/RegisterView.vue`
  - `frontend/src/views/TenantRegisterView.vue`
  - `frontend/src/App.vue`
  - `backend/.env.example`
  - `render.yaml`
- Redacción adicional de secretos/tokens en monitorización:
  - `backend/src/monitoring/sentry.ts`

## Qué Bloquearía el Lanzamiento

1. No quedan blockers automáticos abiertos tras `build`, tests y `npm audit --omit=dev` limpios.
2. Solo bloquearía si la revisión manual de accesos owner/tenant o de descarga de documentos descubre un comportamiento distinto al revisado en código.

## Qué Puede Esperar

- Endurecimiento adicional por constraint SQL para `payments.unit_id` <-> `tenant_person_id`.
- Revisión de `storage_path` legacy en documentos.
- Limpieza de configuración de `authRateLimit*` si se mantiene Clerk como único proveedor de login.
- Optimización de chunks frontend si se quiere reducir el warning de tamaño de Vite.

## Checklist Final de Seguridad Pre-Producción

- Mantener `ENABLE_TENANT_EMAIL_MATCH=false` en producción salvo decisión explícita y documentada.
- Repetir smoke test de owner y tenant separados con cuentas distintas y datos de distintos propietarios.
- Verificar manualmente secretos y rotación en runtime:
  - `CLERK_SECRET_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Confirmar que `backend/.env` y `frontend/.env` no están versionados accidentalmente.
- Validar `CORS_ALLOWED_ORIGINS` real de producción y el dominio final del frontend.
- Revisar Render/CDN para headers del frontend estático, no solo de la API.
- Aplicar revisión manual de accesos PDF/documentos con datos reales.
