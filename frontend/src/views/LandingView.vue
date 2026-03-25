<template>
  <div class="bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <span class="rounded-md bg-indigo-900 px-2 py-1 text-xs uppercase text-white">La-Kers</span>
          <span>Propiedades</span>
        </div>
        <nav class="flex items-center gap-3 text-sm">
          <router-link
            to="/login"
            class="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/register"
            class="rounded-full bg-indigo-900 px-4 py-2 text-white transition hover:bg-indigo-800"
          >
            Empieza gratis
          </router-link>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      <!-- 1) Hero -->
      <section class="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="space-y-6">
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-700">Cobros e incidencias claros</p>
          <h1 class="text-4xl font-semibold leading-tight text-slate-900">
            En menos de 10 segundos sabes quién pagó, qué falta y qué PDF descargar.
          </h1>
          <p class="text-lg text-slate-600">
            Pensado para propietarios con 3–20 apartamentos: ver qué inquilino todavía no ha pagado este mes, descargar un
            recibo PDF en un clic y marcar una incidencia como resuelta sin perder contexto.
          </p>
          <div class="flex flex-wrap gap-3">
            <router-link
              to="/register"
              class="rounded-full bg-indigo-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
            >
              Empieza gratis
            </router-link>
            <a
              href="#demo"
              class="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
            >
              Ver demo
            </a>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              <span>Panel de hoy</span>
              <span class="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Actualizado</span>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-100 bg-slate-900/90 px-4 py-3 text-white shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-indigo-200">Ingresos</p>
                <p class="text-2xl font-semibold">$6,820</p>
                <p class="text-sm text-indigo-100">Pagos confirmados este mes</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Retrasos</p>
                <p class="text-2xl font-semibold text-amber-600">3</p>
                <p class="text-sm text-slate-500">Ver qué inquilino no pagó</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Incidencias</p>
                <p class="text-2xl font-semibold">2</p>
                <p class="text-sm text-slate-500">Marcar como resuelta y notificar</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl">
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>Mini dashboard</span>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-indigo-800">Vista rápida</span>
            </div>
            <div class="mt-5 space-y-4 text-sm">
              <div class="rounded-2xl border border-slate-100 bg-slate-900/95 p-4 text-white shadow">
                <div class="flex items-center justify-between">
                  <p class="text-xs uppercase tracking-[0.35em] text-indigo-200">Pagos</p>
                  <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">+3 hoy</span>
                </div>
                <p class="mt-2 text-xl font-semibold">$2,140 cobrados</p>
                <p class="text-indigo-100">Descargar recibo PDF en un clic</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-[1fr_0.9fr]">
                <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow">
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Contratos</p>
                  <p class="text-lg font-semibold text-slate-900">2 renovaciones en 30 días</p>
                  <p class="text-sm text-slate-500">Aviso automático + PDF generado</p>
                </div>
                <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow">
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Incidencias</p>
                  <p class="text-lg font-semibold text-slate-900">"Fuga baño" asignada</p>
                  <p class="text-sm text-slate-500">Proveedor confirmado - cambiar estado</p>
                </div>
              </div>
            </div>
          </div>
          <div class="pointer-events-none absolute -right-6 top-10 h-12 w-12 rounded-full bg-indigo-100/50" />
          <div class="pointer-events-none absolute -bottom-8 left-6 h-10 w-10 rounded-full bg-slate-200/60" />
        </div>
      </section>

      <!-- 2) Problema real -->
      <section class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-indigo-700">
          <span class="h-px w-10 bg-indigo-200" />
          <span>Problema real</span>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <div class="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <div class="space-y-3 text-slate-600">
              <p class="text-lg font-semibold text-slate-900">Sin ERP gigante, sólo orden diario.</p>
              <p>Excel caótico con pestañas duplicadas. Pagos sin confirmar hasta fin de mes. Incidencias sin dueño ni fecha.</p>
              <p>Contratos dispersos en correo, WhatsApp y carpetas. Demasiado tiempo avisando a inquilinos.</p>
            </div>
            <div class="grid gap-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-900/90 px-4 py-3 text-white shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-indigo-200">Se ve</p>
                <p class="text-sm text-indigo-100">Pagos sin conciliar, no sabes quién falta.</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Se resuelve</p>
                <p class="text-sm text-slate-700">La-Kers muestra atrasos y genera recordatorio con contrato adjunto.</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Se archiva</p>
                <p class="text-sm text-slate-700">Todo deja trazabilidad y PDF descargable.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3) Dashboard explicado -->
      <section class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-indigo-700">
          <span class="h-px w-10 bg-indigo-200" />
          <span>Dashboard explicado</span>
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <div
            v-for="tile in dashboardTiles"
            :key="tile.title"
            :class="tile.accent"
            class="rounded-3xl border border-slate-200 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">{{ tile.kicker }}</p>
            <p class="mt-2 text-xl font-semibold text-slate-900">{{ tile.title }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ tile.body }}</p>
            <div class="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-800">
              <span class="h-2 w-2 rounded-full bg-indigo-700" />
              <span>{{ tile.action }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4) Flujo de uso -->
      <section class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-indigo-700">
          <span class="h-px w-10 bg-indigo-200" />
          <span>Flujo diario</span>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <ol class="space-y-4">
            <li
              v-for="step in timeline"
              :key="step.time"
              class="flex flex-col gap-1 border-l-2 border-indigo-100 pl-4 transition duration-200 hover:border-indigo-300"
            >
              <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">
                <span>{{ step.time }}</span>
                <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">{{ step.label }}</span>
              </div>
              <p class="text-sm font-semibold text-slate-900">{{ step.title }}</p>
              <p class="text-sm text-slate-600">{{ step.detail }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 5) Ejemplo propietario -->
      <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article class="rounded-3xl border border-slate-200 bg-slate-900/95 p-6 text-white shadow-lg">
          <p class="text-xs uppercase tracking-[0.35em] text-indigo-200">Ejemplo de propietario</p>
          <h3 class="mt-3 text-2xl font-semibold">Miguel - 6 apartamentos en Sevilla</h3>
          <p class="mt-3 text-sm text-indigo-100">
            Ve pagos pendientes al abrir. Envia recordatorio con recibo PDF al inquilino que falta. Marca la incidencia del
            ascensor como resuelta y queda registrada con hora exacta. Los contratos renovados se guardan sin salir del panel.
          </p>
        </article>
        <div class="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-xs uppercase tracking-[0.35em] text-indigo-700">Microacciones de Miguel</p>
          <ul class="space-y-2 text-sm text-slate-700">
            <li>• Ver qué inquilino todavía no ha pagado este mes.</li>
            <li>• Descargar un recibo PDF en un clic para contabilidad.</li>
            <li>• Marcar una incidencia como resuelta y notificar al proveedor.</li>
            <li>• Revisar contratos que vencen en 30 días y enviar renovación.</li>
          </ul>
          <div class="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            "No necesito aprender un ERP; sólo abrir y actuar". - Miguel
          </div>
        </div>
      </section>

      <!-- 6) Funciones en narrativa -->
      <section class="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p class="text-xs uppercase tracking-[0.35em] text-indigo-700">Funciones en relato</p>
        <div class="space-y-3 text-sm text-slate-700">
          <p>
            Ingresos y pagos: cifras del mes arriba, retrasos filtrados y botón "Enviar recordatorio" que adjunta el contrato
            correcto. Los cobros confirmados cambian de estado y registran quién lo validó.
          </p>
          <p>
            Incidencias: cada ticket tiene dueño, proveedor sugerido y fotos. Cambia a "Resuelta" y el sistema guarda el
            comprobante para seguros.
          </p>
          <p>
            Documentos automáticos: recibos y contratos en PDF listos sin descargar plantillas externas. Las firmas o
            renovaciones quedan archivadas por unidad.
          </p>
        </div>
      </section>

      <!-- 7) Demo visual -->
      <section id="demo" class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-indigo-700">
          <span class="h-px w-10 bg-indigo-200" />
          <span>Demo visual</span>
        </div>
        <div class="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Panel financiero</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-100 bg-slate-900/95 p-4 text-white shadow">
                <p class="text-xs uppercase tracking-[0.3em] text-indigo-200">Cobros</p>
                <p class="text-2xl font-semibold">$12,430</p>
                <p class="text-sm text-indigo-100">Mes en curso</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Retrasos</p>
                <p class="text-xl font-semibold text-amber-600">3 unidades</p>
                <p class="text-sm text-slate-500">Enviar recordatorio</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow sm:col-span-2">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Pagos hoy</p>
                <div class="mt-2 space-y-2 text-sm text-slate-700">
                  <div class="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <span>Depto 3B - Ana Ruiz</span>
                    <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Confirmado</span>
                  </div>
                  <div class="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <span>Depto 5A - Iván Soto</span>
                    <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pendiente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid gap-4">
            <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Vista de apartamentos</p>
              <div class="mt-3 space-y-2 text-sm text-slate-700">
                <div class="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                  <span>Apto 1C - contrato hasta 12/2026</span>
                  <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">Estable</span>
                </div>
                <div class="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                  <span>Apto 4D - aviso de renovación</span>
                  <span class="rounded-full bg-indigo-50 px-2 py-1 text-[11px] text-indigo-800">Enviar PDF</span>
                </div>
              </div>
            </div>
            <div class="rounded-3xl border border-slate-200 bg-slate-900/95 p-5 text-white shadow-lg">
              <p class="text-[11px] uppercase tracking-[0.35em] text-indigo-200">Pagos</p>
              <p class="mt-2 text-lg font-semibold">Recordatorio listo con contrato adjunto</p>
              <p class="text-sm text-indigo-100">Se envía al inquilino retrasado y guarda copia en documentos.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 8) Pricing -->
      <section class="space-y-6" aria-label="Pricing">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-indigo-700">
          <span class="h-px w-10 bg-indigo-200" />
          <span>Precio simple</span>
        </div>
        <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-lg font-semibold text-slate-900">Free</p>
            <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Hasta 8 apartamentos</p>
            <ul class="mt-4 space-y-2 text-sm text-slate-700">
              <li>Panel financiero básico</li>
              <li>Pagos, incidencias y contratos visibles</li>
              <li>Descarga de recibos PDF</li>
            </ul>
            <router-link
              to="/register"
              class="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
            >
              Probar ahora
            </router-link>
          </article>
          <article class="rounded-3xl border border-indigo-200 bg-indigo-900/95 p-6 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <p class="text-lg font-semibold">Pro</p>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-indigo-100">Recomendado</span>
            </div>
            <p class="mt-1 text-3xl font-semibold">$49/mes</p>
            <p class="text-xs uppercase tracking-[0.35em] text-indigo-100">Unidades ilimitadas</p>
            <ul class="mt-4 space-y-2 text-sm text-indigo-100">
              <li>Automatizaciones diarias y mensuales</li>
              <li>Documentos avanzados y contratos en lote</li>
              <li>Incidencias con proveedores y trazas completas</li>
            </ul>
            <router-link
              to="/register"
              class="mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-slate-100"
            >
              Empieza gratis
            </router-link>
          </article>
        </div>
      </section>

      <!-- 9) CTA final -->
      <section class="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
        <p class="text-xs uppercase tracking-[0.4em] text-indigo-700">Listo para cerrar el mes</p>
        <h2 class="mt-3 text-3xl font-semibold text-slate-900">Empieza a gestionar tus alquileres hoy</h2>
        <p class="mt-3 text-sm text-slate-600">
          Enfocado en propietarios con pocas unidades: datos claros, PDFs listos y acciones directas.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <router-link
            to="/register"
            class="rounded-full bg-indigo-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Empieza gratis
          </router-link>
          <a
            href="mailto:contacto@la-kers.com"
            class="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
          >
            Hablar con el equipo
          </a>
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-200 bg-white/80">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:px-8">
        <span>La-Kers Propiedades</span>
        <div class="flex gap-4">
          <a class="hover:text-slate-900" href="#demo">Demo</a>
          <router-link class="hover:text-slate-900" to="/login">Login</router-link>
          <router-link class="hover:text-slate-900" to="/register">Empieza gratis</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const dashboardTiles = [
  {
    kicker: 'Ingresos',
    title: '$12,430 en el mes',
    body: 'Pagos confirmados con origen bancario anotado.',
    action: 'Descargar recibos PDF',
    accent: 'md:col-span-2'
  },
  {
    kicker: 'Retrasos',
    title: '3 pendientes con fecha vencida',
    body: 'Lista ordenada por días de atraso y unidad.',
    action: 'Enviar recordatorio + contrato',
    accent: ''
  },
  {
    kicker: 'Incidencias',
    title: 'Fuga en 4D - proveedor asignado',
    body: 'Estado cambia a "Resuelta" con comprobante.',
    action: 'Marcar incidencia como resuelta',
    accent: ''
  },
  {
    kicker: 'Contratos',
    title: 'Renovaciones en 30 días',
    body: 'Genera PDF y envía al inquilino desde la misma vista.',
    action: 'Crear y enviar PDF',
    accent: 'md:col-span-2'
  }
];

const timeline = [
  {
    time: '08:30',
    label: 'Mañana',
    title: 'Revisas cobros y atrasos',
    detail: 'Ver qué inquilino todavía no ha pagado este mes y mandar recordatorio con recibo adjunto.'
  },
  {
    time: '11:00',
    label: 'Media mañana',
    title: 'Contratos que vencen',
    detail: 'Generas PDF de renovación y lo envías sin salir del panel.'
  },
  {
    time: '16:00',
    label: 'Tarde',
    title: 'Incidencias con dueño claro',
    detail: 'Marcar una incidencia como resuelta y notificar al proveedor asignado.'
  },
  {
    time: '19:00',
    label: 'Cierre',
    title: 'Descargas recibos del día',
    detail: 'PDFs listos para contabilidad y traza de quién confirmó cada cobro.'
  }
];
</script>
