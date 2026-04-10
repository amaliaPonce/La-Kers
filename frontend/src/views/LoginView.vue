<template>
  <div class="relative min-h-screen bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.14),_transparent_34%),radial-gradient(circle_at_82%_10%,_rgba(15,118,110,0.1),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(248,245,239,0))]"></div>
    <div class="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#c96a37]/10 blur-3xl"></div>
    <div class="pointer-events-none absolute bottom-12 right-0 h-72 w-72 rounded-full bg-[#1f4f46]/10 blur-3xl"></div>

    <header class="relative z-10 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <router-link to="/" class="flex items-center gap-3 text-slate-900">
          <img :src="brandLogo" alt="La-Kers" class="h-12 w-auto object-contain" />
          <span class="hidden text-sm font-semibold uppercase tracking-[0.24em] text-[#1f4f46] sm:inline">Propiedades</span>
        </router-link>

        <div class="flex flex-wrap items-center gap-3 text-sm">
          <router-link
            to="/"
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Volver
          </router-link>
          <router-link
            to="/sign-up"
            class="rounded-full bg-[#c96a37] px-4 py-2 font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
          >
            Crear cuenta
          </router-link>
        </div>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <section class="hidden lg:block">
          <div class="max-w-xl space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full border border-[#d6c7bb] bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46] shadow-sm">
              <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
              Área de propietarios
            </div>

            <div class="space-y-4">
              <h1 class="text-5xl font-semibold leading-[0.95] text-slate-900">
                Accede a tu panel de propietario.
              </h1>
              <p class="max-w-lg text-base leading-8 text-slate-600">
                Consulta cobros, incidencias, contratos y ocupación desde un único lugar.
              </p>
            </div>

            <article class="relative overflow-hidden rounded-[32px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(201,106,55,0.2),_transparent_34%),linear-gradient(135deg,#fffdfa_0%,#f6efe5_42%,#e7efe9_100%)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <div class="absolute -left-12 top-8 h-32 w-32 rounded-full bg-[#c96a37]/15 blur-2xl"></div>
              <div class="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#1f4f46]/12 blur-3xl"></div>
              <div class="relative grid h-[340px] content-end gap-4">
                <div class="max-w-xs rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Acceso rápido</p>
                  <p class="mt-3 text-2xl font-semibold text-slate-900">Panel listo para operar</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    En modo mínimo prioriza cobros, incidencias y contratos sin dependencias visuales externas.
                  </p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-3xl border border-white/70 bg-white/80 p-4">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#1f4f46]">Cobros</p>
                    <p class="mt-2 text-lg font-semibold text-slate-900">Seguimiento diario</p>
                  </div>
                  <div class="rounded-3xl border border-white/70 bg-white/80 p-4">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#1f4f46]">Contratos</p>
                    <p class="mt-2 text-lg font-semibold text-slate-900">Documentos localizados</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="min-w-0 w-full justify-self-stretch lg:justify-self-end">
          <div
            v-if="!hasClerkConfig"
            class="mx-auto max-w-[520px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
          >
            Falta configurar `VITE_CLERK_PUBLISHABLE_KEY` en `frontend/.env`. Sin esa clave Clerk no puede mostrar el login.
          </div>

          <div v-else class="clerk-shell">
            <SignIn
              path="/sign-in"
              routing="path"
              oauth-flow="popup"
              :appearance="clerkAuthAppearance"
              :fallback-redirect-url="returnPath"
              sign-up-url="/sign-up"
              :sign-up-fallback-redirect-url="returnPath"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { SignIn } from '@clerk/vue';
import brandLogo from '../assets/logo.png';
import { clerkAuthAppearance } from '../services/clerkAppearance';

const route = useRoute();
const hasClerkConfig = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const returnPath = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/dashboard'
);
</script>

<style scoped>
.clerk-shell {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: visible;
}

.clerk-shell :deep(.cl-cardBox) {
  width: 100%;
  max-width: 520px;
}

.clerk-shell :deep(.cl-formFieldInput::placeholder),
.clerk-shell :deep(input::placeholder) {
  font-size: 0.875rem;
}
</style>
