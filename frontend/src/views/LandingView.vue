<template>
  <div class="landing-shell relative overflow-hidden bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.14),_transparent_32%),radial-gradient(circle_at_80%_10%,_rgba(15,118,110,0.1),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(248,245,239,0))]"></div>

    <header class="relative z-10 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <router-link to="/" class="landing-brand flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
          <img :src="brandLogo" alt="La-Kers" class="h-20 w-auto origin-left scale-125 object-contain drop-shadow-[0_10px_24px_rgba(31,79,70,0.12)]" />
        </router-link>

        <nav class="flex flex-wrap items-center gap-3 text-sm sm:justify-end">
          <router-link
            to="/demo"
            class="font-display rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Ver demo
          </router-link>
          <router-link
            to="/sign-in"
            class="font-display rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/sign-up"
            class="font-display rounded-full bg-[#c96a37] px-4 py-2 text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
          >
            Empieza gratis
          </router-link>
        </nav>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-6xl space-y-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section class="hero-surface grid gap-8 overflow-hidden rounded-[40px] border border-white/70 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_0.92fr] lg:px-10 lg:py-10">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full border border-[#d6c7bb] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#1f4f46] shadow-sm">
            <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
            Controla tus alquileres sin caos
          </div>

          <div class="space-y-4">
            <h1 class="max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl xl:text-6xl">
              Cobra a tiempo, resuelve incidencias y encuentra contratos en segundos.
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-slate-600">
              Todo lo importante de tus alquileres, ordenado y siempre a mano.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <router-link
              to="/sign-up"
              class="font-display rounded-full bg-[#c96a37] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
            >
              Empieza gratis
            </router-link>
            <a
              href="#precios"
              class="font-display rounded-full border border-slate-200 bg-white/75 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Ver precios
            </a>
          </div>

          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">
            Sin tarjeta. Sin complicaciones. Empieza en minutos.
          </p>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-[28px] border border-[#e7ddd0] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,241,0.82))] p-4 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Propiedades</p>
                <span class="h-2.5 w-2.5 rounded-full bg-[#c96a37]"></span>
              </div>
              <p class="mt-3 text-xl font-semibold text-slate-900">Todo bajo control</p>
              <p class="mt-1 text-sm text-slate-600">Inmuebles, estado y rentas al instante.</p>
            </div>
            <div class="rounded-[28px] border border-[#d9e5df] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,248,245,0.86))] p-4 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1f4f46]">Pagos</p>
                <span class="h-2.5 w-2.5 rounded-full bg-[#1f4f46]"></span>
              </div>
              <p class="mt-3 text-xl font-semibold text-slate-900">Cobros controlados</p>
              <p class="mt-1 text-sm text-slate-600">Consulta pagos pendientes, atrasados y cobrados.</p>
            </div>
            <div class="rounded-[28px] border border-[#e7ddd0] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,239,0.9))] p-4 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Documentos</p>
                <span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              </div>
              <p class="mt-3 text-xl font-semibold text-slate-900">Documentos listos</p>
              <p class="mt-1 text-sm text-slate-600">Recibos y contratos en segundos.</p>
            </div>
          </div>
        </div>

        <div class="hero-selling-panel relative min-h-[420px] overflow-hidden rounded-[34px] shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,193,92,0.18),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(155deg,#163d37_0%,#1f4f46_46%,#112e2a_100%)]"></div>
          <div class="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_0)] bg-[length:18px_18px]"></div>
          <div class="absolute -left-10 top-8 h-36 w-36 rounded-full bg-[#d97706]/20 blur-3xl"></div>
          <div class="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

          <div class="relative flex h-full flex-col justify-between gap-6 p-5 sm:p-6">
            <div class="max-w-sm space-y-3 text-white">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-50/80 backdrop-blur">
                <span class="h-2 w-2 rounded-full bg-[#f8c15c]"></span>
                Hecho para propietarios
              </div>
              <h3 class="font-display text-3xl font-semibold leading-[1.02] text-white sm:text-[2.15rem]">
                Menos gestión. Más control sobre cada alquiler.
              </h3>
              <p class="max-w-xs text-sm leading-7 text-emerald-50/78">
                Controla cobros, incidencias y documentos desde una herramienta simple y clara.
              </p>
            </div>

            <div class="relative grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
              <div class="relative overflow-hidden rounded-[30px] bg-white/10 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
                <img
                  :src="heroVisualPrimary"
                  alt="Interior elegante de una vivienda en alquiler"
                  class="h-[320px] w-full object-cover"
                />
                <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.12)_42%,rgba(15,23,42,0.58)_100%)]"></div>
                <div class="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.62))]"></div>
              </div>

              <div class="flex flex-col justify-end gap-4">
                <div class="relative overflow-hidden rounded-[28px] bg-white/10 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                  <img
                    :src="heroVisualSecondary"
                    alt="Fachada cálida de edificio residencial"
                    class="h-[220px] w-full object-cover"
                  />
                  <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.42)_100%)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="precios" class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#1f4f46]">
          <span class="h-px w-10 bg-[#c96a37]/30"></span>
          <span>Precios</span>
        </div>

        <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article class="pricing-card pricing-card-free rounded-[32px] border p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <div class="inline-flex items-center gap-2 rounded-full border border-[#ead8ca] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c4d29] shadow-sm">
                  <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
                  Empieza gratis
                </div>
              </div>

              <div class="text-right">
                <p class="font-display text-2xl font-semibold text-slate-900">Gratis</p>
              </div>
            </div>

            <div class="mt-6 space-y-2">
              <p class="font-display text-4xl font-semibold text-slate-900 sm:text-5xl">0 €</p>
              <p class="pricing-price-note text-sm text-slate-600">
                Hasta 2 inmuebles para probar la plataforma sin compromiso.
              </p>
            </div>

            <ul class="pricing-feature-list mt-6 text-sm text-slate-700">
              <li class="pricing-feature pricing-feature-free">
                <span class="pricing-feature-icon" aria-hidden="true">
                  ✓
                </span>
                <span class="pricing-feature-copy">Hasta 2 inmuebles activos</span>
              </li>
              <li class="pricing-feature pricing-feature-free">
                <span class="pricing-feature-icon" aria-hidden="true">
                  ✓
                </span>
                <span class="pricing-feature-copy">Propiedades, pagos, incidencias y documentos</span>
              </li>
              <li class="pricing-feature pricing-feature-free">
                <span class="pricing-feature-icon" aria-hidden="true">
                  ✓
                </span>
                <span class="pricing-feature-copy">Acceso inmediato sin tarjeta</span>
              </li>
            </ul>

            <router-link
              to="/sign-up"
              class="font-display mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Empieza gratis
            </router-link>
          </article>

          <article class="pricing-card pricing-card-pro rounded-[32px] border border-[#d5e4dd] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100/80">
                  <span class="h-2 w-2 rounded-full bg-[#f8c15c]"></span>
                  Más capacidad
                </div>
              </div>

              <div class="flex flex-col items-end gap-2 text-right">
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <p class="font-display text-2xl font-semibold">Pro</p>
                  <span class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-50/80">
                    Más capacidad
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-2">
              <div class="flex flex-wrap items-end gap-3">
                <p class="font-display text-4xl font-semibold sm:text-5xl">9,90 €</p>
                <span class="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-emerald-50/90">/ mes</span>
              </div>
              <p class="pricing-price-note text-sm text-emerald-100/80">
                o 99 €/año para gestionar más inmuebles con total control.
              </p>
            </div>

            <ul class="pricing-feature-list mt-6 text-sm text-emerald-50/90">
              <li class="pricing-feature pricing-feature-pro">
                <span class="pricing-feature-icon" aria-hidden="true">
                  ✓
                </span>
                <span class="pricing-feature-copy">Hasta 25 inmuebles activos</span>
              </li>
              <li class="pricing-feature pricing-feature-pro">
                <span class="pricing-feature-icon" aria-hidden="true">
                  ✓
                </span>
                <span class="pricing-feature-copy">Toda la operativa diaria con más capacidad para crecer.</span>
              </li>
              <li class="pricing-feature pricing-feature-pro">
                <span class="pricing-feature-icon" aria-hidden="true">
                  ✓
                </span>
                <span class="pricing-feature-copy">Activa Pro en un clic cuando lo necesites.</span>
              </li>
            </ul>

            <a
              :href="proActivationLink"
              class="font-display mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1f4f46] transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Activar Pro
            </a>
          </article>
        </div>

        <section class="pricing-compare-panel relative overflow-hidden rounded-[38px] border border-[#dccfc1] px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <div class="relative grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
            <div class="space-y-5 lg:space-y-6">
              <div class="inline-flex items-center gap-2 rounded-full border border-[#e2d5c9] bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29] shadow-sm">
                <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
                Elige cuándo crecer
              </div>

              <div class="space-y-3">
                <h3 class="max-w-md text-3xl font-semibold text-slate-900">Empieza gratis. Activa Pro cuando necesites más capacidad.</h3>
                <p class="max-w-md text-sm leading-7 text-slate-600">Usas la misma herramienta desde el primer día. Solo cambia la capacidad cuando creces.</p>
              </div>

            </div>

            <div class="pricing-compare-table">
              <div class="pricing-compare-table-head">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Mismo sistema, más capacidad</p>
                  <p class="mt-2 text-sm leading-6 text-slate-500">Empieza gratis para probar. Activa Pro cuando necesites gestionar más inmuebles.</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="pricing-table-plan pricing-table-plan-free">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c4d29]">Gratis</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">0 €</p>
                  </div>
                  <div class="pricing-table-plan pricing-table-plan-pro">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">Pro</p>
                    <p class="mt-1 text-lg font-semibold">9,90 €</p>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(row, index) in pricingComparisonRows"
                  :key="row.label"
                  class="pricing-compare-row"
                  :class="index % 2 === 0 ? 'pricing-compare-row-even' : 'pricing-compare-row-odd'"
                >
                  <div>
                    <p class="font-semibold text-slate-900">{{ row.label }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-3 sm:contents">
                    <div class="compare-cell compare-cell-free">
                      <p class="compare-cell-label sm:hidden">Gratis</p>
                      <span class="compare-pill compare-pill-free">{{ row.free }}</span>
                    </div>
                    <div class="compare-cell compare-cell-pro">
                      <p class="compare-cell-label sm:hidden">Pro</p>
                      <span class="compare-pill compare-pill-pro">{{ row.pro }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section class="overflow-hidden rounded-[40px] border border-[#d5e4dd] bg-[linear-gradient(135deg,#163d37_0%,#1f4f46_48%,#d86f3b_140%)] text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div class="space-y-5 p-8 lg:p-10">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100/90">
            <span class="h-2 w-2 rounded-full bg-[#f8c15c]"></span>
            Empieza hoy
          </div>
          <div class="space-y-3">
            <h2 class="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Empieza gratis hoy y decide después si necesitas ampliar capacidad.
            </h2>
            <p class="max-w-2xl text-sm leading-7 text-emerald-50/85">
              Abre el panel, revisa lo pendiente y actúa rápido. Sin configuraciones largas ni pagos por adelantado.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <router-link
              to="/sign-up"
              class="font-display rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#163d37] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Empieza gratis
            </router-link>
            <a
              :href="proActivationLink"
              class="font-display rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.15]"
            >
              Activar Pro
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-200 bg-white/80">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <img :src="brandLogo" alt="La-Kers" class="h-11 w-auto object-contain drop-shadow-[0_8px_18px_rgba(31,79,70,0.08)]" />
          <span class="text-sm font-medium text-slate-600">Propiedades</span>
        </div>
        <div class="flex gap-4">
          <router-link class="hover:text-slate-900" to="/demo">Demo</router-link>
          <a class="hover:text-slate-900" href="#precios">Precios</a>
          <router-link class="hover:text-slate-900" to="/sign-in">Login</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import brandLogo from '../assets/logo.png';

const proActivationLink = 'mailto:contacto@la-kers.com?subject=Activar%20plan%20Pro%20La-Kers';
const heroVisualPrimary =
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const heroVisualSecondary =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&fm=jpg&q=80&w=1200';

const pricingComparisonRows = [
  {
    label: 'Capacidad',
    free: '2',
    pro: '25'
  },
  {
    label: 'Entrada',
    free: 'Sin tarjeta',
    pro: 'Upgrade'
  },
  {
    label: 'Facturación',
    free: 'Sin cobro',
    pro: 'Mensual o anual'
  }
];
</script>

<style scoped>
.landing-shell {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.landing-brand {
  font-size: 1.28rem;
  letter-spacing: -0.05em;
  font-weight: 700;
}

.landing-shell h1,
.landing-shell h2,
.landing-shell h3 {
  letter-spacing: -0.06em;
  font-weight: 700;
}

.landing-shell h1 {
  line-height: 0.9;
}

.landing-shell h2 {
  line-height: 0.94;
}

.landing-shell p,
.landing-shell li,
.landing-shell a,
.landing-shell span,
.landing-shell button {
  font-family: inherit;
}

.landing-shell .font-display {
  font-family: 'Syne', sans-serif;
  letter-spacing: -0.05em;
}

.hero-selling-panel .font-display {
  letter-spacing: -0.035em;
}

.landing-shell::before {
  content: "";
  position: absolute;
  inset: 120px auto auto -140px;
  width: 280px;
  height: 280px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(201, 106, 55, 0.18), transparent 70%);
  pointer-events: none;
}

.landing-shell::after {
  content: "";
  position: absolute;
  inset: 820px -110px auto auto;
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(31, 79, 70, 0.12), transparent 70%);
  pointer-events: none;
}

.hero-surface {
  position: relative;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 34%),
    linear-gradient(135deg, rgba(255, 249, 242, 0.96), rgba(255, 255, 255, 0.9) 48%, rgba(244, 237, 228, 0.92));
}

.hero-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.06;
  background-image: radial-gradient(circle at 1px 1px, rgba(31, 79, 70, 0.18) 1px, transparent 0);
  background-size: 18px 18px;
}

.pricing-compare-panel {
  background:
    radial-gradient(circle at top left, rgba(201, 106, 55, 0.16), transparent 30%),
    radial-gradient(circle at bottom right, rgba(31, 79, 70, 0.12), transparent 28%),
    linear-gradient(135deg, rgba(250, 246, 240, 0.96), rgba(255, 255, 255, 0.94) 52%, rgba(245, 239, 231, 0.92));
}

.pricing-card {
  position: relative;
  overflow: hidden;
}

.pricing-card::before {
  content: "";
  position: absolute;
  inset: -20% auto auto -10%;
  width: 190px;
  height: 190px;
  border-radius: 9999px;
  pointer-events: none;
  opacity: 0.55;
}

.pricing-card-free {
  border-color: rgb(226 214 199 / 0.9);
  background:
    radial-gradient(circle at top left, rgba(201, 106, 55, 0.12), transparent 33%),
    linear-gradient(165deg, rgba(255, 255, 255, 0.98), rgba(250, 246, 239, 0.98) 52%, rgba(247, 239, 229, 0.96));
}

.pricing-card-free::before {
  background: radial-gradient(circle, rgba(201, 106, 55, 0.13), transparent 72%);
}

.pricing-card-pro {
  background:
    radial-gradient(circle at top left, rgba(248, 193, 92, 0.18), transparent 28%),
    radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.08), transparent 24%),
    linear-gradient(155deg, rgba(31, 79, 70, 0.98), rgba(22, 61, 55, 0.98) 56%, rgba(17, 46, 42, 0.98));
}

.pricing-card-pro::before {
  background: radial-gradient(circle, rgba(248, 193, 92, 0.18), transparent 72%);
}

.pricing-price-note {
  max-width: 34ch;
  line-height: 1.75;
}

.pricing-feature-list {
  display: grid;
  gap: 0.8rem;
}

.pricing-feature {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.85rem;
  border-radius: 0.9rem;
  padding: 0.8rem 0.9rem;
  line-height: 1.55;
  border: 1px solid transparent;
}

.pricing-feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 9999px;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}

.pricing-feature-copy {
  display: block;
  padding-top: 0.05rem;
  font-weight: 600;
}

.pricing-feature-free::before {
  content: none;
}

.pricing-feature-free {
  border-color: rgba(224, 210, 198, 0.9);
  background: #fffaf6;
}

.pricing-feature-pro::before {
  content: none;
}

.pricing-feature-free .pricing-feature-icon {
  color: #b85d2d;
  border: 1px solid rgba(201, 106, 55, 0.18);
  background: #f7e9de;
}

.pricing-feature-pro {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.pricing-feature-pro .pricing-feature-icon {
  color: #f8c15c;
  border: 1px solid rgba(248, 193, 92, 0.18);
  background: rgba(248, 193, 92, 0.12);
}

.pricing-summary-card {
  border-radius: 1.75rem;
  padding: 1.15rem;
  border: 1px solid transparent;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.pricing-summary-card-free {
  border-color: rgba(234, 216, 202, 0.95);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 247, 241, 0.92));
}

.pricing-summary-card-pro {
  border-color: rgba(213, 228, 221, 0.9);
  background:
    radial-gradient(circle at top right, rgba(248, 193, 92, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(31, 79, 70, 0.96), rgba(22, 61, 55, 0.92));
  color: white;
}

.pricing-summary-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.pricing-summary-tag-free {
  border: 1px solid rgba(201, 106, 55, 0.16);
  background: rgba(255, 255, 255, 0.88);
  color: #8c4d29;
}

.pricing-summary-tag-pro {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(236, 253, 245, 0.88);
}

.pricing-compare-panel {
  background:
    radial-gradient(circle at top left, rgba(201, 106, 55, 0.12), transparent 28%),
    radial-gradient(circle at 90% 12%, rgba(31, 79, 70, 0.08), transparent 20%),
    linear-gradient(145deg, rgba(252, 248, 243, 0.98), rgba(255, 255, 255, 0.96) 58%, rgba(246, 241, 234, 0.94));
}

.pricing-compare-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.22), transparent 38%),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.36), transparent 62%);
  pointer-events: none;
}

.pricing-delta-card {
  border-radius: 1.85rem;
  border: 1px solid rgba(229, 219, 209, 0.95);
  padding: 1.35rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 245, 239, 0.94));
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
}

.pricing-delta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.3rem;
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.pricing-delta-chip-free {
  border: 1px solid rgba(221, 210, 199, 0.95);
  background: rgba(255, 255, 255, 0.96);
  color: #8c4d29;
}

.pricing-delta-chip-pro {
  border: 1px solid rgba(31, 79, 70, 0.12);
  background: linear-gradient(180deg, rgba(31, 79, 70, 0.96), rgba(22, 61, 55, 0.92));
  color: white;
}

.pricing-compare-table {
  border-radius: 2rem;
  border: 1px solid rgba(228, 220, 211, 0.98);
  padding: 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 247, 243, 0.96));
  box-shadow: 0 22px 56px rgba(15, 23, 42, 0.08);
}

.pricing-compare-table-head {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(232, 225, 216, 0.95);
}

.pricing-table-plan {
  border-radius: 1.2rem;
  padding: 0.9rem 0.95rem;
  text-align: center;
}

.pricing-table-plan-free {
  border: 1px solid rgba(234, 216, 202, 0.96);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 242, 236, 0.94));
  box-shadow: 0 10px 24px rgba(201, 106, 55, 0.08);
}

.pricing-table-plan-pro {
  border: 1px solid rgba(213, 228, 221, 0.96);
  background: linear-gradient(180deg, rgba(31, 79, 70, 0.96), rgba(22, 61, 55, 0.92));
  color: white;
  box-shadow: 0 14px 28px rgba(31, 79, 70, 0.14);
}

.pricing-compare-row {
  display: grid;
  gap: 0.9rem;
  border: 1px solid rgba(236, 229, 221, 0.95);
  border-radius: 1.4rem;
  padding: 1rem;
  font-size: 0.92rem;
}

.pricing-compare-row-even {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(251, 249, 245, 0.94));
}

.pricing-compare-row-odd {
  background: linear-gradient(180deg, rgba(252, 249, 245, 0.96), rgba(255, 255, 255, 0.96));
}

.compare-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.compare-cell-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgb(148 163 184);
}

.compare-pill {
  display: inline-flex;
  min-height: 2.75rem;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  padding: 0.7rem 0.9rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
}

.compare-pill-free {
  border: 1px solid rgba(224, 211, 199, 0.95);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 242, 236, 0.94));
  color: rgb(71 85 105);
}

.compare-pill-pro {
  border: 1px solid rgba(31, 79, 70, 0.12);
  background: linear-gradient(180deg, rgba(31, 79, 70, 0.96), rgba(22, 61, 55, 0.92));
  color: white;
  box-shadow: 0 10px 26px rgba(31, 79, 70, 0.16);
}

.pricing-compare-note {
  margin-top: 1rem;
  border-top: 1px solid rgba(232, 225, 216, 0.95);
  padding-top: 1rem;
}

@media (min-width: 640px) {
  .pricing-compare-table-head {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.72fr);
    align-items: end;
  }

  .pricing-compare-row {
    grid-template-columns: minmax(0, 1.1fr) minmax(130px, 0.42fr) minmax(130px, 0.42fr);
    align-items: center;
  }

  .compare-cell {
    align-items: stretch;
  }
}

@media (max-width: 1024px) {
  .hero-surface::after {
    opacity: 0.03;
  }
}
</style>
