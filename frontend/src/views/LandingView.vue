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
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Ver demo
          </router-link>
          <router-link
            to="/sign-in"
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/sign-up"
            class="rounded-full bg-[#c96a37] px-4 py-2 text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
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
            Control simple para propietarios
          </div>

          <div class="space-y-4">
            <h1 class="max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl xl:text-6xl">
              Gestiona tus alquileres con una sola herramienta.
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-slate-600">
              Propiedades, pagos, incidencias y contratos en un solo panel.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <router-link
              to="/sign-up"
              class="rounded-full bg-[#c96a37] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
            >
              Crear cuenta gratis
            </router-link>
            <a
              href="#precios"
              class="rounded-full border border-slate-200 bg-white/75 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Ver precios
            </a>
          </div>

          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">
            Sin tarjeta. Sin instalación. Lista en minutos.
          </p>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-[28px] border border-[#e7ddd0] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,241,0.82))] p-4 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Propiedades</p>
                <span class="h-2.5 w-2.5 rounded-full bg-[#c96a37]"></span>
              </div>
              <p class="mt-3 text-xl font-semibold text-slate-900">Inventario claro</p>
              <p class="mt-1 text-sm text-slate-600">Unidades, estado y renta.</p>
            </div>
            <div class="rounded-[28px] border border-[#d9e5df] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,248,245,0.86))] p-4 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1f4f46]">Pagos</p>
                <span class="h-2.5 w-2.5 rounded-full bg-[#1f4f46]"></span>
              </div>
              <p class="mt-3 text-xl font-semibold text-slate-900">Cobros al día</p>
              <p class="mt-1 text-sm text-slate-600">Pendientes, retrasos y cobrados.</p>
            </div>
            <div class="rounded-[28px] border border-[#e7ddd0] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,239,0.9))] p-4 shadow-sm backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Documentos</p>
                <span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              </div>
              <p class="mt-3 text-xl font-semibold text-slate-900">PDF listos</p>
              <p class="mt-1 text-sm text-slate-600">Recibos y contratos.</p>
            </div>
          </div>
        </div>

        <div class="relative h-full min-h-[420px] overflow-hidden rounded-[32px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(201,106,55,0.24),_transparent_28%),radial-gradient(circle_at_85%_0%,_rgba(31,79,70,0.18),_transparent_24%),linear-gradient(160deg,#fefcf8_0%,#efe8dd_34%,#d9e7e1_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div class="absolute left-8 top-8 h-32 w-32 rounded-full bg-white/35 blur-2xl"></div>
          <div class="absolute right-10 top-16 h-24 w-24 rounded-[28px] border border-white/40 bg-white/20 backdrop-blur"></div>
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.12)_34%,rgba(15,23,42,0.48)_100%)]"></div>

          <div class="relative flex h-full flex-col justify-end p-5 sm:p-6">
            <div class="ml-auto max-w-sm rounded-[28px] border border-white/10 bg-[#163d37] p-5 text-white shadow-xl">
              <p class="text-[11px] uppercase tracking-[0.35em] text-white/70">Resumen mensual</p>
              <p class="mt-3 text-3xl font-semibold">6.820 €</p>
              <p class="mt-2 text-sm leading-6 text-white/80">Visualiza ingresos, pendientes e incidencias sin salir del panel.</p>

              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-white/[0.15] bg-black/10 p-4">
                  <p class="text-[11px] uppercase tracking-[0.28em] text-white/60">Pendientes</p>
                  <p class="mt-2 text-xl font-semibold text-[#ffd7b8]">3 pagos</p>
                </div>
                <div class="rounded-2xl border border-white/[0.15] bg-black/10 p-4">
                  <p class="text-[11px] uppercase tracking-[0.28em] text-white/60">Incidencias</p>
                  <p class="mt-2 text-xl font-semibold">2 abiertas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#1f4f46]">
          <span class="h-px w-10 bg-[#c96a37]/30"></span>
          <span>Qué puedes hacer</span>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <article
            v-for="benefit in coreBenefits"
            :key="benefit.title"
            class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
          >
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">{{ benefit.eyebrow }}</p>
            <h3 class="mt-3 text-2xl font-semibold text-slate-900">{{ benefit.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ benefit.body }}</p>
          </article>
        </div>
      </section>

      <section id="precios" class="space-y-6">
        <div class="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#1f4f46]">
          <span class="h-px w-10 bg-[#c96a37]/30"></span>
          <span>Precios</span>
        </div>

        <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <p class="text-lg font-semibold text-slate-900">Gratis</p>
              <span class="rounded-full bg-[#f3ede4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c4d29]">Para empezar</span>
            </div>
            <p class="mt-1 text-3xl font-semibold text-slate-900">0 €</p>
            <p class="text-sm text-slate-500">Hasta 2 inmuebles para validar la herramienta sin compromiso.</p>
            <ul class="mt-5 space-y-2 text-sm text-slate-700">
              <li>Hasta 2 inmuebles activos</li>
              <li>Propiedades, pagos, incidencias y documentos</li>
              <li>Acceso inmediato sin tarjeta</li>
            </ul>
            <router-link
              to="/sign-up"
              class="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
            >
              Crear cuenta
            </router-link>
          </article>

          <article class="rounded-3xl border border-[#d5e4dd] bg-[#1f4f46] p-6 text-white shadow-lg">
            <div class="flex items-center justify-between gap-3">
              <p class="text-lg font-semibold">Pro</p>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-100/80">Para escalar</span>
            </div>
            <p class="mt-3 text-3xl font-semibold">9,90 €/mes</p>
            <p class="text-sm text-emerald-100/80">o 99 €/año para operar con más capacidad.</p>
            <ul class="mt-5 space-y-2 text-sm text-emerald-100/90">
              <li>Hasta 25 inmuebles activos</li>
              <li>Misma operativa diaria, pero sin freno por capacidad</li>
              <li>Upgrade desde billing o alta asistida si la necesitas</li>
            </ul>
            <a
              :href="proActivationLink"
              class="mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1f4f46] transition hover:bg-slate-100"
            >
              Solicitar Pro
            </a>
          </article>
        </div>

        <section class="pricing-compare-panel relative overflow-hidden rounded-[36px] border border-[#dccfc1] px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-6 sm:py-6">
          <div class="relative grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
            <div class="space-y-5">
              <div class="inline-flex items-center gap-2 rounded-full border border-[#e2d5c9] bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29] shadow-sm">
                <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
                Diferencias reales
              </div>

              <div class="space-y-3">
                <h3 class="max-w-md text-3xl font-semibold text-slate-900">Gratis para validar. Pro para crecer sin bloqueo.</h3>
                <p class="max-w-lg text-sm leading-7 text-slate-600">
                  La operativa es la misma, pero cambia la capacidad y el punto en el que conviertes La-Kers en tu herramienta estable.
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <article class="rounded-[28px] border border-[#ead8ca] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,247,241,0.92))] p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Gratis</p>
                  <p class="mt-3 text-3xl font-semibold text-slate-900">2</p>
                  <p class="mt-1 text-sm text-slate-600">inmuebles para probar flujo, cobros e incidencias sin pagar.</p>
                </article>
                <article class="rounded-[28px] border border-[#d5e4dd] bg-[linear-gradient(180deg,rgba(31,79,70,0.96),rgba(22,61,55,0.92))] p-4 text-white shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100/80">Pro</p>
                  <p class="mt-3 text-3xl font-semibold">25</p>
                  <p class="mt-1 text-sm text-emerald-50/80">inmuebles para operar con margen real y seguir dando altas.</p>
                </article>
              </div>
            </div>

            <div class="overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-sm backdrop-blur">
              <div class="hidden border-b border-slate-200/80 bg-[linear-gradient(180deg,#f8f4ee,#f2ece4)] px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(130px,0.42fr)_minmax(130px,0.42fr)] sm:items-end sm:gap-3">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">Diferencia</p>
                  <p class="mt-2 text-sm text-slate-500">Qué cambia entre entrar gratis y activar capacidad Pro.</p>
                </div>
                <div class="rounded-2xl border border-[#ead8ca] bg-white px-3 py-3 text-center shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c4d29]">Gratis</p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">0 €</p>
                </div>
                <div class="rounded-2xl border border-[#d5e4dd] bg-[#1f4f46] px-3 py-3 text-center text-white shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">Pro</p>
                  <p class="mt-1 text-lg font-semibold">9,90 €</p>
                </div>
              </div>

              <div
                v-for="(row, index) in pricingComparisonRows"
                :key="row.label"
                class="grid gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 sm:grid-cols-[minmax(0,1.1fr)_minmax(130px,0.42fr)_minmax(130px,0.42fr)] sm:items-center"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-[#fcfaf7]'"
              >
                <div>
                  <p class="font-semibold text-slate-900">{{ row.label }}</p>
                  <p class="mt-1 text-slate-500">{{ row.description }}</p>
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
        </section>
      </section>

      <section class="overflow-hidden rounded-[40px] border border-[#d5e4dd] bg-[linear-gradient(135deg,#163d37_0%,#1f4f46_48%,#d86f3b_140%)] text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div class="space-y-5 p-8 lg:p-10">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100/90">
            <span class="h-2 w-2 rounded-full bg-[#f8c15c]"></span>
            Empieza cuando quieras
          </div>
          <div class="space-y-3">
            <h2 class="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Empieza gratis y decide después si necesitas más capacidad.
            </h2>
            <p class="max-w-2xl text-sm leading-7 text-emerald-50/85">
              La idea es simple: abrir el panel, ver lo pendiente y actuar rápido. Sin configuración larga y sin pagar
              antes de comprobar que te sirve.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <router-link
              to="/sign-up"
              class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#163d37] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Crear cuenta gratis
            </router-link>
            <a
              :href="proActivationLink"
              class="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.15]"
            >
              Hablar para activar Pro
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

const coreBenefits = [
  {
    eyebrow: 'Cobros',
    title: 'Pagos claros',
    body: 'Consulta pendientes, atrasos y pagos confirmados.'
  },
  {
    eyebrow: 'Seguimiento',
    title: 'Incidencias con estado',
    body: 'Ve qué sigue y qué ya está resuelto.'
  },
  {
    eyebrow: 'Documentos',
    title: 'Contratos localizados',
    body: 'Encuentra contratos y documentos al momento.'
  }
];

const pricingComparisonRows = [
  {
    label: 'Capacidad',
    description: 'Número de inmuebles que puedes gestionar antes de bloquear nuevas altas.',
    free: '2',
    pro: '25'
  },
  {
    label: 'Entrada',
    description: 'Cómo empiezas a usar la plataforma.',
    free: 'Sin tarjeta',
    pro: 'Upgrade'
  },
  {
    label: 'Facturación',
    description: 'Qué relación comercial tiene cada plan.',
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
  border: 1px solid rgba(224, 211, 199, 1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 242, 236, 0.92));
  color: rgb(71 85 105);
}

.compare-pill-pro {
  border: 1px solid rgba(31, 79, 70, 0.12);
  background: linear-gradient(180deg, rgba(31, 79, 70, 0.98), rgba(22, 61, 55, 0.92));
  color: white;
  box-shadow: 0 10px 26px rgba(31, 79, 70, 0.16);
}

@media (min-width: 640px) {
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
