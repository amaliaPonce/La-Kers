<template>
  <div class="relative min-h-screen bg-[#f6f3ee] text-slate-900">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(31,79,70,0.14),_transparent_34%),radial-gradient(circle_at_82%_10%,_rgba(201,106,55,0.1),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(246,243,238,0))]"></div>

    <main class="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <section class="hidden lg:block">
          <div class="max-w-xl space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full border border-[#d6c7bb] bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46] shadow-sm">
              <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
              Registro de inquilino
            </div>
            <div class="space-y-4">
              <h1 class="text-5xl font-semibold leading-[0.95] text-slate-900">Crea tu acceso al portal.</h1>
              <p class="max-w-lg text-base leading-8 text-slate-600">
                Usa el mismo correo que aparece en tu contrato para enlazar tu expediente automáticamente.
              </p>
            </div>
          </div>
        </section>

        <section class="min-w-0 w-full justify-self-stretch lg:justify-self-end">
          <div v-if="!hasClerkConfig" class="mx-auto max-w-[520px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            Falta configurar `VITE_CLERK_PUBLISHABLE_KEY` en `frontend/.env`.
          </div>
          <div v-else class="clerk-shell">
            <SignUp
              path="/tenant/sign-up"
              routing="path"
              oauth-flow="popup"
              :appearance="clerkAuthAppearance"
              :unsafe-metadata="{ portalRole: 'tenant' }"
              fallback-redirect-url="/tenant"
              sign-in-url="/tenant/sign-in"
              sign-in-fallback-redirect-url="/tenant"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { SignUp } from '@clerk/vue';
import { clerkAuthAppearance } from '../services/clerkAppearance';

const hasClerkConfig = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
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
</style>
