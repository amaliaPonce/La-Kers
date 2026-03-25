# La-Kers Propiedades

Administración compuesta por backend Express/TypeScript y frontend Vue 3. Ejecuta lo siguiente desde la raíz:

```bash
npm install
npm run dev
```

El script `dev` arranca el backend y el frontend en paralelo usando `concurrently`.

## Variables de entorno del backend
Renombra `backend/.env.example` a `.env` y configura:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `PORT` (opcional, por defecto 4000)
- `APP_BASE_URL` (recomendado en producción para devolver enlaces absolutos)
- `DOCUMENT_STORAGE_PATH` (opcional; por defecto usa `backend/documents`)
- `LANDLORD_NAME`
- `LANDLORD_IDENTIFICATION`
- `LANDLORD_ADDRESS`

En producción, las variables `LANDLORD_*` son obligatorias para evitar contratos con datos placeholder.

## Frontend
- Usa `VITE_API_BASE` para apuntar al backend (por defecto `http://localhost:4000`).
- Navegación por ruta: `/login`, `/register`, `/dashboard`, `/apartments`, `/tenants`, `/payments`, `/incidents`.
- Crea `frontend/.env` a partir de `frontend/.env.example` para fijar la URL de la API en cada entorno.

## Base de datos
Ejecuta `sql/schema.sql` en Supabase (activa `pgcrypto`) para crear las tablas `units`, `tenant_persons`, `payments`, `incidents` y `contract_documents`, junto con sus índices.

## Características clave
- Supabase Auth en `/auth/login` y middleware JWT.
- Cron mensual (`0 4 1 * *`) para crear pagos pendientes y diario (`0 3 * * *`) para marcar atrasos.
- Endpoint `PATCH /payments/:id/pay` para marcar pagos.
- Dashboard `/dashboard/summary` con métricas.
- `/documents/receipt/:paymentId` genera un PDF mediante PDFKit.
- `GET /contracts/:contractId/pdf` descarga el último PDF de finalización con autenticación.
- Frontend consume la API protegida usando Pinia, Tailwind, y Axios.

## Operación
- Los PDFs generados se almacenan fuera de `src` en `backend/documents/contracts` salvo que se configure `DOCUMENT_STORAGE_PATH`.
- No subas PDFs generados ni logs al repositorio; `.gitignore` ya excluye esas rutas.
- En producción, define `CORS_ALLOWED_ORIGINS` y revisa `TRUST_PROXY`, `ENABLE_CRON_JOBS` y los límites `RATE_LIMIT_*`.
- Usa `docs/production-checklist.md` como checklist previo al despliegue.
- Si quieres desplegar en Render, usa `render.yaml` y la guía de `docs/render-deploy.md`.
