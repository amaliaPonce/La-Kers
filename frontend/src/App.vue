<template>
  <div class="min-h-screen bg-[#f8f5ef] text-slate-900">
    <template v-if="route.meta.public">
      <div
        v-if="showAmbientBackground"
        class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.12),_transparent_28%),radial-gradient(circle_at_85%_8%,_rgba(15,118,110,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(248,245,239,0))]"
      ></div>
      <main :class="[showAmbientBackground ? 'relative z-10' : '', 'min-h-screen']">
        <router-view />
      </main>
    </template>

    <template v-else-if="!hasClerkConfig">
      <div class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.12),_transparent_28%),radial-gradient(circle_at_85%_8%,_rgba(15,118,110,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(248,245,239,0))]"></div>
      <main class="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div class="w-full max-w-2xl rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Configuración pendiente</p>
          <h1 class="mt-4 text-3xl font-semibold text-slate-900">Faltan claves de Clerk</h1>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            La app ya no usa el login anterior. Para que vuelva a funcionar necesitas añadir
            `VITE_CLERK_PUBLISHABLE_KEY` en `frontend/.env` y `CLERK_SECRET_KEY` en `backend/.env`.
          </p>
          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            En local, `VITE_API_BASE` debe ser `/api` para que la sesión de Clerk llegue al backend por el proxy de Vite.
          </div>
        </div>
      </main>
    </template>

    <template v-else>
      <SignedIn>
        <template v-if="route.meta.tenantPortal">
          <router-view />
        </template>
        <template v-else>
          <div class="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(248,245,239,0.92)_20%,_rgba(248,245,239,1))]"></div>

          <div class="lg:grid lg:min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="hidden border-r border-[#eadfd2] bg-[#fbf8f2] lg:block">
            <div class="sticky top-0 flex h-screen flex-col px-6 py-8">
              <div class="border-b border-[#eadfd2] pb-6">
                <div class="flex items-center gap-4">
                  <span class="flex h-14 items-center rounded-[22px] border border-[#e5ddd2] bg-white/90 px-3 shadow-sm shadow-[#1f4f46]/5">
                    <img :src="brandLogo" alt="La-Kers" class="h-8 w-auto object-contain" />
                  </span>
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Zona autenticada</p>
                    <p class="mt-1 text-sm text-slate-500">Gestión diaria con Clerk</p>
                  </div>
                </div>

                <div class="mt-5 rounded-2xl border border-[#eadfd2] bg-white px-4 py-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Cuenta activa</p>
                      <p class="mt-2 truncate text-sm font-semibold text-slate-900">{{ accountTitle }}</p>
                      <p class="mt-1 text-sm text-slate-500">{{ accountSubtitle }}</p>
                    </div>
                    <span
                      class="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                      :class="planBadgeClass"
                    >
                      {{ planBadgeLabel }}
                    </span>
                  </div>
                  <div v-if="billingSummary" class="mt-4">
                    <div class="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <span>Uso del plan</span>
                      <span>{{ billingSummary.usage.unitCount }} / {{ billingSummary.usage.unitLimit }}</span>
                    </div>
                    <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#efe7dd]">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="isProPlan ? 'bg-[#1f4f46]' : 'bg-[#c96a37]'"
                        :style="{ width: `${billingUsagePercentage}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <nav class="mt-8 space-y-6">
                <div v-for="section in sidebarSections" :key="section.title" class="space-y-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{{ section.title }}</p>
                  <div class="space-y-1">
                    <component
                      :is="item.path ? 'router-link' : 'button'"
                      v-for="item in section.items"
                      :key="item.label"
                      :to="item.path"
                      :type="item.path ? undefined : 'button'"
                      class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition"
                      :class="item.active
                        ? 'bg-[#1f4f46] text-white'
                        : item.path
                          ? 'text-slate-600 hover:bg-white hover:text-slate-900'
                          : 'text-slate-400'"
                    >
                      <span class="flex items-center gap-3">
                        <span
                          class="flex h-9 w-9 items-center justify-center rounded-xl"
                          :class="item.active ? 'bg-white/12 text-white' : item.path ? 'bg-white text-[#8c4d29]' : 'bg-[#f3ede4] text-slate-400'"
                        >
                          <SolidIcon :name="item.icon" class="h-4 w-4" />
                        </span>
                        <span>{{ item.label }}</span>
                      </span>
                      <span
                        v-if="!item.path"
                        class="rounded-full bg-[#f3ede4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
                      >
                        Próx.
                      </span>
                    </component>
                  </div>
                </div>
              </nav>

              <div class="mt-auto border-t border-[#eadfd2] pt-6">
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Resumen</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ billingSummary?.plan.name ?? currentSectionTitle }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ billingCtaDescription }}</p>
                <router-link
                  to="/billing"
                  class="mt-5 flex items-center justify-between rounded-2xl border border-[#d8cec2] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#cdbba8] hover:text-slate-900"
                  :class="route.path === '/billing' ? 'border-[#1f4f46] bg-[#1f4f46] text-white' : ''"
                >
                  <span class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-xl"
                      :class="route.path === '/billing' ? 'bg-white/12 text-white' : 'bg-[#f3ede4] text-[#8c4d29]'"
                    >
                      <SolidIcon name="coin" class="h-4 w-4" />
                    </span>
                    <span>Plan y Billing</span>
                  </span>
                  <span class="text-xs font-semibold uppercase tracking-[0.18em]" :class="route.path === '/billing' ? 'text-white/75' : 'text-slate-400'">
                    {{ billingLinkLabel }}
                  </span>
                </router-link>
              </div>
            </div>
          </aside>

          <div class="min-w-0">
            <header class="sticky top-0 z-20 border-b border-[#eadfd2] bg-[#f8f5ef]/95 backdrop-blur-xl">
              <div class="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <router-link
                      to="/dashboard"
                      class="flex items-center rounded-full border border-[#d8cec2] bg-white px-3 py-2 shadow-sm shadow-[#1f4f46]/5 transition hover:border-[#cdbba8]"
                    >
                      <img :src="brandLogo" alt="La-Kers" class="h-6 w-auto object-contain" />
                    </router-link>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ currentSectionTitle }}</p>
                      <p class="text-sm text-slate-500">{{ currentSectionDescription }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <router-link
                      to="/billing"
                      class="inline-flex items-center gap-2 rounded-full border border-[#d8cec2] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#cdbba8] hover:text-slate-900"
                      :class="route.path === '/billing' ? 'border-[#1f4f46] bg-[#1f4f46] text-white' : ''"
                    >
                      <SolidIcon name="coin" class="h-4 w-4" />
                      <span class="hidden sm:inline">Plan</span>
                    </router-link>
                    <div class="h-10 w-10 overflow-hidden rounded-full border border-[#d8cec2] bg-white">
                      <UserButton :appearance="clerkUserButtonAppearance" />
                    </div>
                  </div>
                </div>

                <nav class="flex flex-wrap items-center gap-2 text-sm lg:hidden">
                  <router-link
                    v-for="item in quickNavItems"
                    :key="item.path"
                    :to="item.path"
                    class="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-medium transition"
                    :class="route.path === item.path
                      ? 'border-[#1f4f46] bg-[#1f4f46] text-white'
                      : 'border-[#e2d6ca] bg-white text-slate-600 hover:border-[#cfbeaf] hover:text-slate-900'"
                  >
                    <SolidIcon :name="item.icon" class="h-4 w-4" />
                    {{ item.label }}
                  </router-link>
                </nav>
              </div>
            </header>

            <main class="relative z-10 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
              <router-view />
            </main>
          </div>
          </div>

          <OnboardingModal />
          <OnboardingChecklist />
          <TooltipGuide :route-name="currentOnboardingRoute" />
        </template>
      </SignedIn>

      <SignedOut>
        <template v-if="route.meta.tenantPortal">
          <div class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(31,79,70,0.12),_transparent_28%),radial-gradient(circle_at_85%_8%,_rgba(201,106,55,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(246,243,238,0))]"></div>
          <main class="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div class="w-full max-w-xl overflow-hidden rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">Portal del inquilino</p>
              <h1 class="mt-4 text-3xl font-semibold text-slate-900">Inicia sesión para acceder a tu alquiler</h1>
              <p class="mt-3 text-sm leading-7 text-slate-600">
                Usa el mismo correo que figura en tu contrato para enlazar tu expediente automáticamente.
              </p>
              <router-link
                to="/tenant/sign-in"
                class="mt-6 inline-flex rounded-full bg-[#1f4f46] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1f4f46]/15 transition hover:bg-[#163a33]"
              >
                Ir al portal
              </router-link>
            </div>
          </main>
        </template>
        <template v-else>
          <div class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.12),_transparent_28%),radial-gradient(circle_at_85%_8%,_rgba(15,118,110,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(248,245,239,0))]"></div>
          <main class="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div class="w-full max-w-xl overflow-hidden rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Acceso requerido</p>
              <h1 class="mt-4 text-3xl font-semibold text-slate-900">Inicia sesión para entrar al panel</h1>
              <p class="mt-3 text-sm leading-7 text-slate-600">
                La autenticación ya corre con Clerk. Después de entrar volverás a esta misma pantalla.
              </p>
              <router-link
                :to="{ path: '/sign-in', query: { redirect: route.fullPath } }"
                class="mt-6 inline-flex rounded-full bg-[#c96a37] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
              >
                Ir a iniciar sesión
              </router-link>
            </div>
          </main>
        </template>
      </SignedOut>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/vue';
import SolidIcon from './components/SolidIcon.vue';
import { useBilling } from './composables/useBilling';
import OnboardingChecklist from './components/onboarding/OnboardingChecklist.vue';
import OnboardingModal from './components/onboarding/OnboardingModal.vue';
import TooltipGuide from './components/onboarding/TooltipGuide.vue';
import { clerkUserButtonAppearance } from './services/clerkAppearance';
import brandLogo from './assets/logo.png';
const route = useRoute();
const hasClerkConfig = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const { user } = hasClerkConfig ? useUser() : { user: ref(null) };
const {
  summary: billingSummary,
  isPro: isProPlan,
  usagePercentage: billingUsagePercentage,
  loadSummary,
  clearSummary
} = useBilling();

const quickNavItems = computed(() => {
  return [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Propiedades', path: '/apartments', icon: 'building' },
    { label: 'Inquilinos', path: '/tenants', icon: 'users' },
    { label: 'Pagos', path: '/payments', icon: 'wallet' },
    { label: 'Incidencias', path: '/incidents', icon: 'warning' },
    { label: 'Documentos', path: '/documents', icon: 'calendar' },
    { label: 'Mensajes', path: '/communications', icon: 'message' }
  ];
});

const resolveActive = (path) => route.path === path;

const sidebarSections = computed(() => {
  return [
    {
      title: 'Lo básico',
      items: [
        { label: 'Tablero', path: '/dashboard', icon: 'dashboard', active: resolveActive('/dashboard') },
        { label: 'Propiedades', path: '/apartments', icon: 'building', active: resolveActive('/apartments') },
        { label: 'Inquilinos', path: '/tenants', icon: 'users', active: resolveActive('/tenants') },
        { label: 'Sistema de pagos', path: '/payments', icon: 'wallet', active: resolveActive('/payments') },
        { label: 'Incidencias', path: '/incidents', icon: 'warning', active: resolveActive('/incidents') },
        { label: 'Documentos', path: '/documents', icon: 'calendar', active: resolveActive('/documents') },
        { label: 'Mensajes', path: '/communications', icon: 'message', active: resolveActive('/communications') }
      ]
    },
    {
      title: 'El resto',
      items: [
        { label: 'Contactos', icon: 'users', active: false },
        { label: 'Mensajes legacy', icon: 'message', active: false },
        { label: 'Candidatos', icon: 'users', active: false },
        { label: 'Herramientas', icon: 'spark', active: false },
        { label: 'Basura', icon: 'warning', active: false }
      ]
    }
  ];
});

const currentSectionTitle = computed(() => {
  if (route.path === '/billing') return 'Plan y Billing';
  const found = quickNavItems.value.find((item) => item.path === route.path);
  return found?.label ?? 'Panel de gestión';
});

const accountTitle = computed(() => user.value?.primaryEmailAddress?.emailAddress ?? user.value?.fullName ?? 'Cuenta activa');
const accountSubtitle = computed(() => {
  if (!billingSummary.value) return 'Cargando plan y capacidad.';
  const remaining = billingSummary.value.usage.remainingUnits;
  if (isProPlan.value) {
    return `${billingSummary.value.usage.unitCount} de ${billingSummary.value.usage.unitLimit} inmuebles en uso.`;
  }
  if (remaining > 0) {
    return `Plan gratis activo. Te quedan ${remaining} huecos antes de pasar a Pro.`;
  }
  return 'Plan gratis al límite. Necesitas Pro para seguir creciendo.';
});

const planBadgeLabel = computed(() => (isProPlan.value ? 'Pro' : 'Gratis'));

const planBadgeClass = computed(() =>
  isProPlan.value
    ? 'bg-[#1f4f46] text-white'
    : 'bg-[#f3ede4] text-[#8c4d29]'
);

const billingLinkLabel = computed(() => (isProPlan.value ? 'Activo' : 'Upgrade'));

const billingCtaDescription = computed(() => {
  if (!billingSummary.value) return 'Cargando plan, uso y opciones de upgrade.';
  if (isProPlan.value) {
    return `Plan Pro activo con ${billingSummary.value.usage.unitLimit} inmuebles disponibles.`;
  }
  if (!billingSummary.value.usage.canAddMoreUnits) {
    return 'Has tocado el límite gratis. Sube a Pro para añadir más propiedades.';
  }
  return `Ahora mismo usas ${billingSummary.value.usage.unitCount} de ${billingSummary.value.usage.unitLimit} inmuebles del plan gratis.`;
});

const currentSectionDescription = computed(() => {
  if (route.path === '/apartments') return 'Inventario y estado de cada unidad.';
  if (route.path === '/tenants') return 'Seguimiento de inquilinos y contratos.';
  if (route.path === '/payments') return 'Cobros, vencimientos y movimientos.';
  if (route.path === '/incidents') return 'Incidencias y seguimiento operativo.';
  if (route.path === '/documents') return 'Contratos y recibos listos para localizar.';
  if (route.path === '/communications') return 'Bandeja profesional con trazabilidad por contrato o propiedad.';
  if (route.path === '/billing') return 'Plan activo, uso y control de cobro.';
  return 'Resumen general de la operación.';
});

const showAmbientBackground = computed(() => !route.meta.hideNavbar);
const currentOnboardingRoute = computed(() =>
  String(route.meta.onboardingRoute ?? route.name ?? '')
);

watch(
  [() => route.meta.public, () => user.value?.id],
  ([isPublic, userId]) => {
    if (!hasClerkConfig || isPublic || !userId) {
      clearSummary();
      return;
    }

    loadSummary().catch((error) => console.error(error));
  },
  { immediate: true }
);
</script>
