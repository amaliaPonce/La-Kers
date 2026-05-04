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
                Usa el enlace personal que te haya enviado el propietario para crear un acceso seguro a tu expediente.
              </p>
            </div>
          </div>
        </section>

        <section class="min-w-0 w-full justify-self-stretch lg:justify-self-end">
          <div v-if="!tenantPortalEnabled" class="mx-auto max-w-[520px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            El portal del inquilino está desactivado en modo mínimo.
          </div>
          <div v-else-if="!hasClerkConfig" class="mx-auto max-w-[520px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            Falta configurar `VITE_CLERK_PUBLISHABLE_KEY` en `frontend/.env`.
          </div>
          <div v-else class="space-y-4">
            <div
              v-if="hasInviteToken"
              class="mx-auto max-w-[520px] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900"
            >
              Invitación personal detectada. Crea tu cuenta y el portal quedará enlazado con ese contrato.
            </div>
            <div v-else class="mx-auto max-w-[520px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              Este acceso ahora se recomienda mediante invitación personal. Pide al propietario que te comparta tu enlace del portal.
            </div>
            <div class="clerk-shell">
            <SignUp
              path="/tenant/sign-up"
              routing="path"
              oauth-flow="popup"
              :appearance="clerkAuthAppearance"
              fallback-redirect-url="/tenant"
              :sign-in-url="tenantSignInUrl"
              sign-in-fallback-redirect-url="/tenant"
            />
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { SignUp } from '@clerk/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { runtimeConfig } from '../config/runtimeConfig';
import { clerkAuthAppearance } from '../services/clerkAppearance';
import { rememberTenantPortalInviteToken } from '../services/tenantPortalInvite';

const hasClerkConfig = runtimeConfig.hasClerkConfig;
const tenantPortalEnabled = runtimeConfig.enableTenantPortal;
const route = useRoute();
const router = useRouter();
const inviteToken = ref(String(route.query.invite ?? '').trim());
const hasInviteToken = computed(() => Boolean(inviteToken.value));
const tenantSignInUrl = computed(() => (inviteToken.value ? `/tenant/sign-in?invite=${encodeURIComponent(inviteToken.value)}` : '/tenant/sign-in'));

onMounted(() => {
  rememberTenantPortalInviteToken(inviteToken.value);
  if (inviteToken.value) {
    const nextQuery = { ...route.query };
    delete nextQuery.invite;
    void router.replace({ query: nextQuery });
  }
});
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

.clerk-shell :deep(.cl-dividerText) {
  background: transparent !important;
}
</style>
