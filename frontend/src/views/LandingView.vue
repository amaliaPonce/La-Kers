<template>
  <div class="landing-shell relative overflow-hidden bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.18),_transparent_32%),radial-gradient(circle_at_80%_10%,_rgba(15,118,110,0.14),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(248,245,239,0))]"></div>
    <header class="relative z-10 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <span class="rounded-xl bg-[#1f4f46] px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-white shadow-lg shadow-emerald-950/10">La-Kers</span>
          <span>Propiedades</span>
        </div>
        <nav class="flex items-center gap-3 text-sm">
          <router-link
            to="/login"
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/register"
            class="rounded-full bg-[#c96a37] px-4 py-2 text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
          >
            Empieza gratis
          </router-link>
        </nav>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-6xl space-y-20 px-4 py-8 sm:px-6 lg:px-8">
      <!-- 1) Hero -->
      <section class="hero-surface grid items-center gap-10 overflow-hidden rounded-[40px] border border-white/70 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
        <div class="relative space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full border border-[#d6c7bb] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#1f4f46] shadow-sm">
            <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
            Cobros e incidencias claros
          </div>
          <h1 class="max-w-xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl xl:text-6xl">
            En menos de 10 segundos sabes quién pagó, qué falta y qué PDF descargar.
          </h1>
          <p class="max-w-2xl text-lg leading-8 text-slate-600">
            Pensado para propietarios con 3–20 apartamentos: ver qué inquilino todavía no ha pagado este mes, descargar un
            recibo o contrato PDF y marcar una incidencia como resuelta sin perder contexto.
          </p>
          <div class="flex flex-wrap gap-3">
            <router-link
              to="/register"
              class="rounded-full bg-[#c96a37] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
            >
              Empieza gratis
            </router-link>
            <a
              href="#demo"
              class="rounded-full border border-slate-200 bg-white/75 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Ver demo
            </a>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">En foco</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">Todo el alquiler en un mismo sitio</p>
            </div>
            <div class="rounded-3xl border border-white/70 bg-[#1f4f46] p-4 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100/80">Hecho para ti</p>
              <p class="mt-2 text-sm font-semibold text-white">Propietarios particulares en España</p>
            </div>
            <div class="rounded-3xl border border-white/70 bg-[#efe1d4] p-4 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c4d29]">Sin ruido</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">Menos hojas, más claridad</p>
            </div>
          </div>
          <div class="rounded-3xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              <span>Panel de hoy</span>
              <span class="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Actualizado</span>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-100 bg-[#1f4f46] px-4 py-3 text-white shadow">
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
                <p class="text-sm text-slate-500">Marcar como resuelta y seguir el estado</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -top-4 right-4 hidden rounded-full bg-[#efe1d4] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c4d29] shadow-sm lg:block">
            Mediterranean rental flow
          </div>
          <div class="grid gap-4 lg:grid-cols-[0.72fr_1fr]">
            <div class="space-y-4">
              <article class="overflow-hidden rounded-[30px] border border-white/70 bg-white/70 shadow-lg backdrop-blur">
                <img
                  class="h-64 w-full object-cover"
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
                  alt="Apartamento luminoso de estilo mediterráneo"
                />
                <div class="space-y-2 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Pisos y contratos</p>
                  <p class="text-sm font-semibold text-slate-900">Cada unidad con su contrato, estado y renta a mano.</p>
                </div>
              </article>
              <article class="overflow-hidden rounded-[30px] border border-white/70 bg-[#f2ebe1] shadow-lg">
                <img
                  class="h-40 w-full object-cover"
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80"
                  alt="Fachada elegante de apartamentos urbanos"
                />
                <div class="space-y-2 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">Portfolio claro</p>
                  <p class="text-sm font-semibold text-slate-900">Visualiza tu cartera sin perderte entre mensajes y carpetas.</p>
                </div>
              </article>
            </div>
            <div class="relative pt-6 lg:pt-12">
          <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl">
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>Mini dashboard</span>
              <span class="rounded-full bg-[#efe1d4] px-3 py-1 text-[#8c4d29]">Vista rápida</span>
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
                  <p class="text-sm text-slate-500">Contrato PDF disponible para descarga</p>
                </div>
                <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow">
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Incidencias</p>
                  <p class="text-lg font-semibold text-slate-900">"Fuga baño" asignada</p>
                  <p class="text-sm text-slate-500">Proveedor confirmado - cambiar estado</p>
                </div>
              </div>
            </div>
          </div>
              <div class="floating-note absolute -left-4 top-0 hidden max-w-[180px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg lg:block">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Sin Excel</p>
                <p class="mt-2 text-sm text-slate-600">Pagos, incidencias y contratos en una sola vista.</p>
              </div>
            </div>
          </div>
          <div class="pointer-events-none absolute -right-6 top-10 h-12 w-12 rounded-full bg-[#efe1d4]" />
          <div class="pointer-events-none absolute -bottom-8 left-6 h-10 w-10 rounded-full bg-emerald-100/80" />
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
                <p class="text-sm text-slate-700">La-Kers muestra atrasos, pagos pendientes y contratos descargables.</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
                <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Se archiva</p>
                <p class="text-sm text-slate-700">Todo deja trazabilidad y PDF descargable.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article class="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div class="grid lg:grid-cols-[1.1fr_0.9fr]">
            <img
              class="h-full min-h-[280px] w-full object-cover"
              src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
              alt="Edificios mediterráneos con luz cálida"
            />
            <div class="flex flex-col justify-center gap-4 bg-[#f2ebe1] p-8">
              <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8c4d29]">Más calma visual</p>
              <h2 class="text-3xl font-semibold leading-tight text-slate-900">Una herramienta de alquiler no tiene por qué parecer un ERP.</h2>
              <p class="text-sm leading-7 text-slate-600">
                La interfaz está pensada para propietarios que necesitan orden y tranquilidad, no menús eternos ni paneles fríos.
              </p>
            </div>
          </div>
        </article>
        <div class="grid gap-6">
          <article class="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-lg">
            <img
              class="h-44 w-full object-cover"
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
              alt="Mesa con documentos y portátil para gestión de alquileres"
            />
            <div class="space-y-2 p-6">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">Documentos al día</p>
              <p class="text-sm text-slate-600">Recibos y contratos listos para descargar sin buscar plantillas externas.</p>
            </div>
          </article>
          <article class="rounded-[32px] border border-[#e5d5c7] bg-[#fff7f1] p-6 shadow-lg">
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Diseñada para ver rápido</p>
            <p class="mt-3 text-xl font-semibold text-slate-900">Abrir, revisar, actuar. Sin vueltas.</p>
            <p class="mt-3 text-sm leading-7 text-slate-600">
              Lo importante aparece primero: pagos pendientes, contratos, incidencias y el estado real de tus apartamentos.
            </p>
          </article>
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
            Ve pagos pendientes al abrir. Descarga un recibo PDF cuando el cobro ya está marcado como pagado. Marca la
            incidencia del ascensor como resuelta y revisa contratos sin salir del panel.
          </p>
        </article>
        <div class="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-xs uppercase tracking-[0.35em] text-indigo-700">Microacciones de Miguel</p>
          <ul class="space-y-2 text-sm text-slate-700">
            <li>• Ver qué inquilino todavía no ha pagado este mes.</li>
            <li>• Descargar un recibo PDF en un clic para contabilidad.</li>
            <li>• Marcar una incidencia como resuelta y dejar el estado actualizado.</li>
            <li>• Revisar contratos y descargar el PDF cuando hace falta.</li>
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
            Ingresos y pagos: cifras del mes arriba, retrasos filtrados y pagos que cambian de estado cuando los marcas como
            cobrados. Todo queda más claro para cerrar el mes sin repasar varias hojas.
          </p>
          <p>
            Incidencias: cada ticket tiene estado, prioridad, coste y responsable. Cambia a "Resuelta" y mantienes el
            seguimiento sin perder el historial.
          </p>
          <p>
            Documentos: recibos y contratos en PDF disponibles para descarga, sin depender de plantillas externas ni carpetas
            sueltas.
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
                <p class="text-sm text-slate-500">Revisar pagos pendientes</p>
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
                  <span class="rounded-full bg-indigo-50 px-2 py-1 text-[11px] text-indigo-800">Ver contrato</span>
                </div>
              </div>
            </div>
            <div class="rounded-3xl border border-slate-200 bg-slate-900/95 p-5 text-white shadow-lg">
              <p class="text-[11px] uppercase tracking-[0.35em] text-indigo-200">Pagos</p>
              <p class="mt-2 text-lg font-semibold">Pago pendiente identificado</p>
              <p class="text-sm text-indigo-100">Desde aquí puedes revisar el retraso y generar el recibo cuando el cobro se confirme.</p>
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
            <p class="text-lg font-semibold text-slate-900">Freemium</p>
            <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Hasta 25 apartamentos</p>
            <ul class="mt-4 space-y-2 text-sm text-slate-700">
              <li>Dashboard con ingresos, ocupación y mora</li>
              <li>Pagos, incidencias, contratos e inquilinos visibles</li>
              <li>Descarga de recibos y contratos PDF</li>
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
              <p class="text-lg font-semibold">Estado actual</p>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-indigo-100">Transparente</span>
            </div>
            <p class="mt-1 text-3xl font-semibold">Sin plan Pro publicado</p>
            <p class="text-xs uppercase tracking-[0.35em] text-indigo-100">La web muestra sólo funciones reales</p>
            <ul class="mt-4 space-y-2 text-sm text-indigo-100">
              <li>Freemium activo hoy</li>
              <li>Sin precio público de pago todavía</li>
              <li>La landing se alinea con el producto actual</li>
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
      <section class="overflow-hidden rounded-[40px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div class="grid items-center gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div class="space-y-5 p-8 lg:p-10">
            <p class="text-xs uppercase tracking-[0.4em] text-[#1f4f46]">Listo para cerrar el mes</p>
            <h2 class="text-3xl font-semibold text-slate-900 sm:text-4xl">Empieza a gestionar tus alquileres hoy</h2>
            <p class="text-sm leading-7 text-slate-600">
              Enfocado en propietarios con pocas unidades: datos claros, PDFs listos y acciones directas.
            </p>
            <div class="flex flex-wrap gap-3">
              <router-link
                to="/register"
                class="rounded-full bg-[#c96a37] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
              >
                Empieza gratis
              </router-link>
              <a
                href="mailto:contacto@la-kers.com"
                class="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                Hablar con el equipo
              </a>
            </div>
          </div>
          <div class="relative h-full min-h-[320px] overflow-hidden bg-[#efe1d4]">
            <img
              class="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=1400&q=80"
              alt="Propietaria revisando documentos en un apartamento luminoso"
            />
            <div class="absolute inset-0 bg-gradient-to-l from-transparent via-[#1f4f46]/10 to-[#1f4f46]/45"></div>
            <div class="absolute bottom-6 left-6 max-w-[240px] rounded-[28px] border border-white/40 bg-white/85 p-5 shadow-xl backdrop-blur">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Menos estrés</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">Todo listo para tomar decisiones sin perder la tarde.</p>
            </div>
          </div>
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
    action: 'Revisar pagos pendientes',
    accent: ''
  },
  {
    kicker: 'Incidencias',
    title: 'Fuga en 4D - incidencia abierta',
    body: 'Estado cambia a "Resuelta" con seguimiento claro.',
    action: 'Marcar incidencia como resuelta',
    accent: ''
  },
  {
    kicker: 'Contratos',
    title: 'Renovaciones en 30 días',
    body: 'Consulta el contrato y descarga el PDF cuando hace falta.',
    action: 'Descargar contrato PDF',
    accent: 'md:col-span-2'
  }
];

const timeline = [
  {
    time: '08:30',
    label: 'Mañana',
    title: 'Revisas cobros y atrasos',
    detail: 'Ver qué inquilino todavía no ha pagado este mes y dejar claro qué cobros siguen pendientes.'
  },
  {
    time: '11:00',
    label: 'Media mañana',
    title: 'Contratos que vencen',
    detail: 'Revisas contratos cercanos a vencimiento y descargas el PDF si lo necesitas.'
  },
  {
    time: '16:00',
    label: 'Tarde',
    title: 'Incidencias con dueño claro',
    detail: 'Marcar una incidencia como resuelta y dejar constancia del seguimiento.'
  },
  {
    time: '19:00',
    label: 'Cierre',
    title: 'Descargas recibos del día',
    detail: 'PDFs listos para contabilidad y trazabilidad de los cobros marcados como pagados.'
  }
];
</script>

<style scoped>
.landing-shell::before {
  content: "";
  position: absolute;
  inset: 120px auto auto -140px;
  width: 320px;
  height: 320px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(201, 106, 55, 0.22), transparent 70%);
  pointer-events: none;
}

.landing-shell::after {
  content: "";
  position: absolute;
  inset: 820px -110px auto auto;
  width: 280px;
  height: 280px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(31, 79, 70, 0.16), transparent 70%);
  pointer-events: none;
}

.hero-surface {
  position: relative;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), transparent 38%),
    linear-gradient(135deg, rgba(255, 248, 240, 0.94), rgba(255, 255, 255, 0.82) 42%, rgba(242, 235, 225, 0.9));
}

.hero-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image: radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.22) 1px, transparent 0);
  background-size: 16px 16px;
}

.floating-note {
  backdrop-filter: blur(14px);
}

@media (max-width: 1024px) {
  .hero-surface::after {
    opacity: 0.08;
  }
}
</style>
