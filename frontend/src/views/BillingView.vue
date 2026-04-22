<template>
  <div class="space-y-6 pb-10">
    <section class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="space-y-5">
        <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-700">
          <SolidIcon name="coin" class="h-3.5 w-3.5 text-[#c96a37]" />
          <span>Plan</span>
        </div>

        <div class="max-w-3xl">
          <h1 class="text-3xl font-semibold text-slate-900 sm:text-5xl">Plan y facturación</h1>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Estado actual, uso y cambio de plan desde una sola pantalla.
          </p>
        </div>

        <div
          v-if="feedbackMessage"
          class="rounded-[28px] border px-5 py-4 text-sm shadow-sm"
          :class="feedbackTone === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : feedbackTone === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-rose-200 bg-rose-50 text-rose-700'"
        >
          {{ feedbackMessage }}
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div class="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Plan actual</p>
                <div class="mt-3 flex items-center gap-3">
                  <p class="text-4xl font-semibold tracking-tight text-slate-900">{{ summary?.plan.name ?? '...' }}</p>
                  <span
                    class="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                    :class="isProActive ? 'bg-[#1f4f46] text-white' : 'bg-[#f3ede4] text-[#8c4d29]'"
                  >
                    {{ currentPlanBadge }}
                  </span>
                </div>
                <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  {{ summary?.plan.description ?? 'Cargando estado de plan.' }}
                </p>
              </div>

              <div class="min-w-[220px] rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Uso</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ usageHeadline }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ usageDetail }}</p>
              </div>
            </div>

            <div class="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="isProActive ? 'bg-[#1f4f46]' : isAtLimit ? 'bg-amber-500' : 'bg-slate-900'"
                :style="{ width: `${usagePercentage}%` }"
              ></div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article class="rounded-[24px] border border-slate-200 bg-white p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
                <p class="mt-2 text-xl font-semibold text-slate-900">{{ statusLabel }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ cycleLabel }}</p>
              </article>

              <article class="rounded-[24px] border border-slate-200 bg-white p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Recomendación</p>
                <p class="mt-2 text-xl font-semibold text-slate-900">{{ upgradeTimingTitle }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ upgradeTimingBody }}</p>
              </article>

              <article class="rounded-[24px] border border-slate-200 bg-white p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Facturación</p>
                <p class="mt-2 text-xl font-semibold text-slate-900">{{ billingSummaryHeadline }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ billingSummaryDetail }}</p>
              </article>
            </div>
          </div>

          <aside class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="space-y-1">
              <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">
                <SolidIcon name="refresh" class="h-3.5 w-3.5" />
                <span>Acciones</span>
              </div>
              <h2 class="text-2xl font-semibold text-slate-900">Gestionar plan</h2>
              <p class="text-sm text-slate-500">Activa Pro o abre el portal de facturación.</p>
            </div>

            <div class="mt-6 grid gap-4">
              <article class="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Pro mensual</p>
                    <p class="mt-1 text-sm text-slate-500">Pago flexible mes a mes.</p>
                  </div>
                  <p class="text-xl font-semibold text-slate-900">{{ formatPrice(990) }}</p>
                </div>
                <button
                  type="button"
                  class="mt-4 rounded-full bg-[#1f4f46] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173c36] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isProActive || actionLoading === 'monthly' || checkoutUnavailable"
                  @click="startCheckout('monthly')"
                >
                  {{ actionLoading === 'monthly' ? 'Abriendo Stripe...' : monthlyButtonLabel }}
                </button>
              </article>

              <article class="rounded-[24px] border border-[#ead8ca] bg-[#fff7f1] p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Pro anual</p>
                    <p class="mt-1 text-sm text-slate-500">Mismo precio bloqueado con pago anual.</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-semibold text-slate-900">{{ formatPrice(9900) }}</p>
                    <p class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8c4d29]">99 €/año</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="mt-4 rounded-full border border-[#d9cec2] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-[#cdbba8] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isProActive || actionLoading === 'yearly' || checkoutUnavailable"
                  @click="startCheckout('yearly')"
                >
                  {{ actionLoading === 'yearly' ? 'Abriendo Stripe...' : yearlyButtonLabel }}
                </button>
              </article>

              <p
                v-if="checkoutUnavailable"
                class="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                Stripe no está configurado todavía en este entorno.
              </p>

              <button
                v-if="summary?.billing.portalAvailable"
                type="button"
                class="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="actionLoading === 'portal'"
                @click="openPortal"
              >
                <SolidIcon name="refresh" class="h-4 w-4" />
                <span>{{ actionLoading === 'portal' ? 'Abriendo portal...' : 'Gestionar suscripción' }}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">
          <SolidIcon name="wallet" class="h-3.5 w-3.5" />
          <span>Planes disponibles</span>
        </div>
        <h2 class="text-2xl font-semibold text-slate-900">Elige según tu operativa</h2>
        <p class="text-sm text-slate-500">Resumen simple de cada opción sin duplicar la misma información.</p>
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-3">
        <article
          class="rounded-[30px] border p-6 shadow-sm transition"
          :class="isProActive
            ? 'border-slate-200 bg-white'
            : 'border-[#ead8ca] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,241,0.94))]'"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">Starter</p>
              <p class="mt-1 text-3xl font-semibold text-slate-900">0 €</p>
              <p class="mt-2 text-sm leading-6 text-slate-500">Ideal para empezar a ordenar tu operativa.</p>
            </div>
            <span
              class="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
              :class="isProActive ? 'bg-slate-100 text-slate-500' : 'bg-[#f3ede4] text-[#8c4d29]'"
            >
              {{ isProActive ? 'Incluido' : 'Plan actual' }}
            </span>
          </div>

          <ul class="mt-6 space-y-3 text-sm text-slate-700">
            <li v-for="feature in freePlanFeatures" :key="feature" class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-[#c96a37]"></span>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </article>

        <article class="rounded-[30px] border border-[#d8e6df] bg-[#1f4f46] p-6 text-white shadow-lg shadow-[#1f4f46]/15">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-lg font-semibold">Pro</p>
                <span class="rounded-full bg-[#f8c15c] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-900">
                  Más popular
                </span>
              </div>
              <p class="mt-2 text-3xl font-semibold">{{ formatPrice(990) }}/mes</p>
              <p class="mt-2 text-sm leading-6 text-emerald-100/85">Para propietarios que no quieren límites.</p>
            </div>
            <span
              class="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
              :class="isProActive ? 'bg-white text-[#1f4f46]' : 'bg-white/10 text-emerald-50'"
            >
              {{ isProActive ? 'Plan actual' : 'Disponible' }}
            </span>
          </div>

          <ul class="mt-6 space-y-3 text-sm text-emerald-50/95">
            <li v-for="feature in proPlanFeatures" :key="feature" class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-[#f8c15c]"></span>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </article>

        <article class="rounded-[30px] border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-lg font-semibold text-slate-900">Empresa</p>
                <span class="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700">
                  Próximamente
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Pensado para estructuras con más colaboración y reporting.
              </p>
            </div>
          </div>

          <ul class="mt-6 space-y-3 text-sm text-slate-600">
            <li v-for="feature in teamPlanFeatures" :key="feature" class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { BillingSummary } from '../composables/useBilling';
import { useBilling } from '../composables/useBilling';
import SolidIcon from '../components/SolidIcon.vue';
import apiClient from '../services/apiClient';
import { track } from '../lib/analytics';
import { captureAppException } from '../lib/sentry';

const route = useRoute();
const router = useRouter();
const { summary, isPro: isProActive, loadSummary } = useBilling();
const actionLoading = ref<'monthly' | 'yearly' | 'portal' | null>(null);
const feedbackMessage = ref('');
const feedbackTone = ref<'success' | 'warning' | 'error'>('success');

const freePlanFeatures = [
  'Hasta 3 inmuebles.',
  'Sin tarjeta y sin límite de tiempo.',
  'Acceso a propiedades, pagos, incidencias y documentos.'
];

const proPlanFeatures = [
  'Inmuebles ilimitados.',
  'Precio bloqueado mientras seas cliente.',
  'Alta mensual o anual desde esta pantalla.'
];

const teamPlanFeatures = [
  'Pensado para colaboración y reporting.',
  'Disponible próximamente.'
];

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatPrice = (priceCents: number) => currencyFormatter.format((priceCents || 0) / 100);

const usagePercentage = computed(() => {
  if (summary.value?.plan.isUnlimited) return 100;
  const unitLimit = summary.value?.usage.unitLimit ?? 0;
  const unitCount = summary.value?.usage.unitCount ?? 0;
  if (!unitLimit) return 0;
  return Math.min(Math.round((unitCount / unitLimit) * 100), 100);
});

const isAtLimit = computed(() => !(summary.value?.usage.canAddMoreUnits ?? true));
const usageHeadline = computed(() => {
  if (!summary.value) return 'Cargando uso.';
  if (summary.value.plan.isUnlimited) {
    return `${summary.value.usage.unitCount} inmuebles`;
  }
  return `${summary.value.usage.unitCount} / ${summary.value.usage.unitLimit} inmuebles`;
});

const usageDetail = computed(() => {
  const current = summary.value;
  if (!current) return 'Cargando uso del plan.';
  if (current.plan.isUnlimited) {
    return `Gestionas ${current.usage.unitCount} inmuebles sin techo visible.`;
  }
  if (current.usage.canAddMoreUnits) {
    return `Te quedan ${current.usage.remainingUnits} inmuebles disponibles en Starter.`;
  }
  return 'Has alcanzado el límite actual. La siguiente alta requiere Pro.';
});

const currentPlanBadge = computed(() => (isProActive.value ? 'Pro activo' : 'Starter'));

const statusLabel = computed(() => {
  const status = summary.value?.billing.current.subscriptionStatus ?? 'inactive';
  const labels: Record<string, string> = {
    inactive: 'Sin suscripción activa',
    active: 'Suscripción activa',
    trialing: 'Prueba activa',
    past_due: 'Pago pendiente',
    canceled: 'Suscripción cancelada',
    unpaid: 'Cobro fallido',
    incomplete: 'Checkout incompleto',
    incomplete_expired: 'Checkout vencido'
  };
  return labels[status] ?? status;
});

const cycleLabel = computed(() => {
  const current = summary.value?.billing.current;
  if (!current) return 'Sin datos de ciclo todavía.';
  const periodEndLabel = current.currentPeriodEnd
    ? `Periodo actual hasta ${new Date(current.currentPeriodEnd).toLocaleDateString('es-ES')}.`
    : 'Sin fecha de renovación disponible.';
  if (current.billingCycle === 'yearly') return `Facturación anual. ${periodEndLabel}`;
  if (current.billingCycle === 'monthly') return `Facturación mensual. ${periodEndLabel}`;
  return periodEndLabel;
});

const billingSummaryHeadline = computed(() => {
  if (!summary.value) return 'Cargando facturación.';
  if (isProActive.value) {
    return summary.value.billing.current.billingCycle === 'yearly' ? 'Pro anual' : 'Pro mensual';
  }
  return summary.value.billing.checkoutAvailable ? 'Upgradeable' : 'Sin cobro';
});

const billingSummaryDetail = computed(() => {
  if (!summary.value) return 'En cuanto cargue la cuenta verás el modo de facturación.';
  if (isProActive.value) return 'Facturación activa.';
  if (summary.value.billing.checkoutAvailable) return 'Puedes activar Pro desde esta misma pantalla.';
  return 'Starter funciona sin pago y sin portal de facturación.';
});

const upgradeTimingTitle = computed(() => {
  if (!summary.value) return 'Cargando recomendación.';
  if (isProActive.value) return 'Ya operas sin límites visibles.';
  if (isAtLimit.value) return 'Conviene activar Pro.';
  if ((summary.value.usage.remainingUnits ?? 0) <= 1) return 'Queda poco margen en Starter.';
  return 'Starter todavía encaja.';
});

const upgradeTimingBody = computed(() => {
  if (!summary.value) return 'En cuanto cargue la cuenta verás la recomendación.';
  if (isProActive.value) return 'Tu plan ya cubre la operativa actual.';
  if (isAtLimit.value) return 'Has agotado Starter y la siguiente alta requerirá activar Pro.';
  if ((summary.value.usage.remainingUnits ?? 0) <= 1) return 'Si prevés otra alta, el salto a Pro será el paso natural.';
  return 'Puedes seguir validando la operativa en Starter sin cambiar de flujo.';
});

const yearlyButtonLabel = computed(() =>
  isProActive.value
    ? 'Plan actual'
    : summary.value?.billing.checkoutAvailable
      ? 'Activar Pro anual'
      : 'Stripe no disponible'
);

const monthlyButtonLabel = computed(() =>
  isProActive.value
    ? 'Plan actual'
    : summary.value?.billing.checkoutAvailable
      ? 'Activar Pro mensual'
      : 'Stripe no disponible'
);

const checkoutUnavailable = computed(() => Boolean(summary.value) && !summary.value.billing.checkoutAvailable);

const PRO_ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

const isProSummaryActive = (billingSummary: BillingSummary | null | undefined) =>
  Boolean(
    billingSummary &&
      billingSummary.plan.id === 'pro' &&
      PRO_ACTIVE_STATUSES.has(String(billingSummary.billing.current.subscriptionStatus ?? ''))
  );

const clearCheckoutQueryParams = async () => {
  if (!('checkout' in route.query) && !('session_id' in route.query)) return;

  const nextQuery = { ...route.query };
  delete nextQuery.checkout;
  delete nextQuery.session_id;

  await router.replace({ query: nextQuery });
};

const startCheckout = async (billingCycle: 'monthly' | 'yearly') => {
  if (isProActive.value) {
    feedbackTone.value = 'warning';
    feedbackMessage.value = 'La cuenta ya tiene el plan Pro activo. Usa el portal de facturación para gestionarlo.';
    return;
  }

  track('pro_upgrade_clicked', {
    source: 'billing',
    billingCycle
  });

  if (!summary.value?.billing.checkoutAvailable) {
    feedbackTone.value = 'error';
    feedbackMessage.value = 'Stripe no está configurado todavía en este entorno.';
    return;
  }

  actionLoading.value = billingCycle;
  feedbackMessage.value = '';

  try {
    const { data } = await apiClient.post('/billing/checkout', { billingCycle });
    if (typeof data?.url === 'string' && data.url) {
      window.location.assign(data.url);
      return;
    }
    throw new Error('Stripe no devolvió una URL de checkout');
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      tags: {
        feature: 'billing',
        action: 'checkout'
      },
      context: {
        billingCycle,
        route: '/billing'
      }
    });
    feedbackTone.value = 'error';
    feedbackMessage.value = axios.isAxiosError(error)
      ? String(error.response?.data?.message ?? 'No se pudo abrir Stripe Checkout.')
      : 'No se pudo abrir Stripe Checkout.';
  } finally {
    actionLoading.value = null;
  }
};

const confirmReturnedCheckout = async () => {
  const checkoutState = String(route.query.checkout ?? '');
  const sessionId = String(route.query.session_id ?? '').trim();

  if (checkoutState !== 'success') {
    if (checkoutState === 'cancelled') {
      feedbackTone.value = 'warning';
      feedbackMessage.value = 'Checkout cancelado. El plan sigue igual hasta que completes el pago.';
    }
    return;
  }

  feedbackTone.value = 'warning';
  feedbackMessage.value = 'Confirmando pago con Stripe...';

  try {
    let confirmedSummary: BillingSummary | null = null;

    if (sessionId) {
      const { data } = await apiClient.get(`/billing/checkout-session/${encodeURIComponent(sessionId)}`);
      confirmedSummary = (data as BillingSummary) ?? null;
    } else {
      confirmedSummary = await loadSummary({ force: true });
    }

    if (!isProSummaryActive(confirmedSummary)) {
      confirmedSummary = await loadSummary({ force: true });
    }

    if (isProSummaryActive(confirmedSummary)) {
      feedbackTone.value = 'success';
      feedbackMessage.value = 'Pago confirmado. La cuenta ya está en Pro.';
    } else {
      feedbackTone.value = 'warning';
      feedbackMessage.value = 'El pago ha vuelto correctamente, pero Stripe todavía está terminando de activar la suscripción.';
    }
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      tags: {
        feature: 'billing',
        action: 'checkout_confirm'
      },
      context: {
        sessionId,
        route: '/billing'
      }
    });
    feedbackTone.value = 'error';
    feedbackMessage.value = axios.isAxiosError(error)
      ? String(error.response?.data?.message ?? 'No se pudo confirmar el checkout de Stripe.')
      : 'No se pudo confirmar el checkout de Stripe.';
  } finally {
    await clearCheckoutQueryParams();
  }
};

const openPortal = async () => {
  actionLoading.value = 'portal';
  feedbackMessage.value = '';

  try {
    const { data } = await apiClient.post('/billing/portal');
    if (typeof data?.url === 'string' && data.url) {
      window.location.assign(data.url);
      return;
    }
    throw new Error('Stripe no devolvió una URL de portal');
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      tags: {
        feature: 'billing',
        action: 'portal'
      },
      context: {
        route: '/billing'
      }
    });
    feedbackTone.value = 'error';
    feedbackMessage.value = axios.isAxiosError(error)
      ? String(error.response?.data?.message ?? 'No se pudo abrir el portal de Stripe.')
      : 'No se pudo abrir el portal de Stripe.';
  } finally {
    actionLoading.value = null;
  }
};

onMounted(async () => {
  track('billing_opened', { source: 'billing_view' });
  await loadSummary({ force: true }).catch((error) => console.error(error));
  await confirmReturnedCheckout();
});
</script>
