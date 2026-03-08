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

## Frontend
- Usa `VITE_API_BASE` para apuntar al backend (por defecto `http://localhost:4000`).
- Navegación por ruta: `/login`, `/register`, `/dashboard`, `/apartments`, `/tenants`, `/payments`, `/incidents`.

## Base de datos
Ejecuta `sql/schema.sql` en Supabase (activa `pgcrypto`) para crear las tablas `units`, `tenant_persons`, `payments`, `incidents`, y el índice único.

## Características clave
- Supabase Auth en `/auth/login` y middleware JWT.
- Cron mensual (`0 4 1 * *`) para crear pagos pendientes y diario (`0 3 * * *`) para marcar atrasos.
- Endpoint `PATCH /payments/:id/pay` para marcar pagos.
- Dashboard `/dashboard/summary` con métricas.
- `/documents/receipt/:paymentId` genera un PDF mediante Puppeteer.
- Frontend consume la API protegida usando Pinia, Tailwind, y Axios.
