<template>
  <div class="space-y-6 pb-10">
    <section class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px] xl:items-start">
        <div class="space-y-5">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-700">
            <SolidIcon name="coin" class="h-3.5 w-3.5 text-[#c96a37]" />
            <span>Gratis vs Pro</span>
          </div>

          <div class="max-w-3xl">
            <h1 class="text-3xl font-semibold text-slate-900 sm:text-5xl">Plan y Billing</h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Aquí se ve de forma explícita qué incluye cada plan, cuál tienes activo y cuándo toca pasar de gratis a Pro.
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

          <div class="grid gap-4 xl:grid-cols-2">
            <article
              class="rounded-[30px] border p-6 shadow-sm transition"
              :class="isProActive
                ? 'border-slate-200 bg-white'
                : 'border-[#ead8ca] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,241,0.94))]'"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold text-slate-900">Gratis</p>
                  <p class="mt-1 text-3xl font-semibold text-slate-900">0 €</p>
                  <p class="mt-2 text-sm leading-6 text-slate-500">Entrada sin tarjeta para validar el flujo y gestionar una cartera muy pequeña.</p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  :class="isProActive ? 'bg-slate-100 text-slate-500' : 'bg-[#f3ede4] text-[#8c4d29]'"
                >
                  {{ isProActive ? 'Base' : 'Plan actual' }}
                </span>
              </div>

              <ul class="mt-6 space-y-3 text-sm text-slate-700">
                <li v-for="feature in freePlanFeatures" :key="feature" class="flex items-start gap-3">
                  <span class="mt-1 h-2.5 w-2.5 rounded-full bg-[#c96a37]"></span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </article>

            <article class="rounded-[30px] border border-[#d5e4dd] bg-[#1f4f46] p-6 text-white shadow-lg shadow-[#1f4f46]/15">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">Pro</p>
                  <p class="mt-1 text-3xl font-semibold">{{ formatPrice(990) }}/mes</p>
                  <p class="mt-2 text-sm leading-6 text-emerald-100/85">Escala la misma operativa diaria sin quedarte bloqueado por capacidad.</p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  :class="isProActive ? 'bg-white text-[#1f4f46]' : 'bg-white/10 text-emerald-50'"
                >
                  {{ isProActive ? 'Plan actual' : 'Upgrade' }}
                </span>
              </div>

              <ul class="mt-6 space-y-3 text-sm text-emerald-50/95">
                <li v-for="feature in proPlanFeatures" :key="feature" class="flex items-start gap-3">
                  <span class="mt-1 h-2.5 w-2.5 rounded-full bg-[#f8c15c]"></span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </article>
          </div>
        </div>

        <aside class="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Plan actual</p>
          <div class="mt-3 flex items-center justify-between gap-3">
            <p class="text-4xl font-semibold tracking-tight text-slate-900">
              {{ summary?.plan.name ?? '...' }}
            </p>
            <span
              class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
              :class="isProActive ? 'bg-[#1f4f46] text-white' : 'bg-[#f3ede4] text-[#8c4d29]'"
            >
              {{ isProActive ? 'Pro activo' : 'Gratis' }}
            </span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ summary?.plan.description ?? 'Cargando estado de plan.' }}
          </p>

          <div class="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="isProActive ? 'bg-[#1f4f46]' : isAtLimit ? 'bg-amber-500' : 'bg-slate-900'"
              :style="{ width: `${usagePercentage}%` }"
            ></div>
          </div>

          <div class="mt-5 grid gap-3">
            <div class="rounded-[24px] border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Uso</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ summary?.usage.unitCount ?? 0 }} / {{ summary?.usage.unitLimit ?? 0 }} inmuebles
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {{ usageDetail }}
              </p>
            </div>
            <div class="rounded-[24px] border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ statusLabel }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ cycleLabel }}</p>
            </div>
            <div class="rounded-[24px] border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Cuándo subir a Pro</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ upgradeTimingTitle }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ upgradeTimingBody }}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <article class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">
            <SolidIcon name="wallet" class="h-3.5 w-3.5" />
            <span>Diferencias reales</span>
          </div>
          <h2 class="text-2xl font-semibold text-slate-900">Qué cambia de verdad entre gratis y Pro</h2>
          <p class="text-sm text-slate-500">La separación operativa se centra en la capacidad y en la continuidad de uso.</p>
        </div>

        <div class="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
          <div class="grid grid-cols-[minmax(0,1.1fr)_minmax(110px,0.45fr)_minmax(110px,0.45fr)] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Comparativa</span>
            <span class="text-center">Gratis</span>
            <span class="text-center">Pro</span>
          </div>

          <div
            v-for="row in comparisonRows"
            :key="row.label"
            class="grid grid-cols-[minmax(0,1.1fr)_minmax(110px,0.45fr)_minmax(110px,0.45fr)] items-center gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0"
          >
            <div>
              <p class="font-semibold text-slate-900">{{ row.label }}</p>
              <p class="mt-1 text-slate-500">{{ row.description }}</p>
            </div>
            <p class="text-center font-medium text-slate-700">{{ row.free }}</p>
            <p class="text-center font-semibold" :class="row.highlight ? 'text-[#1f4f46]' : 'text-slate-700'">{{ row.pro }}</p>
          </div>
        </div>
      </article>

      <article class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">
            <SolidIcon name="refresh" class="h-3.5 w-3.5" />
            <span>Acciones</span>
          </div>
          <h2 class="text-2xl font-semibold text-slate-900">Siguiente paso</h2>
          <p class="text-sm text-slate-500">Activa Pro o gestiona la suscripción actual desde aquí.</p>
        </div>

        <div class="mt-6 grid gap-4">
          <article class="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-slate-900">Plan Pro mensual</p>
                <p class="mt-1 text-sm text-slate-500">Pensado para subir de capacidad sin compromiso anual.</p>
              </div>
              <p class="text-xl font-semibold text-slate-900">{{ formatPrice(990) }}</p>
            </div>
            <button
              type="button"
              class="mt-4 rounded-full bg-[#1f4f46] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173c36] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isProActive || actionLoading === 'monthly'"
              @click="startCheckout('monthly')"
            >
              {{ actionLoading === 'monthly' ? 'Abriendo Stripe...' : monthlyButtonLabel }}
            </button>
          </article>

          <article class="rounded-[28px] border border-[#ead8ca] bg-[#fff7f1] p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-slate-900">Plan Pro anual</p>
                <p class="mt-1 text-sm text-slate-500">Mismo límite Pro con pago anual y menor fricción de renovación.</p>
              </div>
              <p class="text-xl font-semibold text-slate-900">{{ formatPrice(9900) }}</p>
            </div>
            <button
              type="button"
              class="mt-4 rounded-full border border-[#d9cec2] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-[#cdbba8] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isProActive || actionLoading === 'yearly'"
              @click="startCheckout('yearly')"
            >
              {{ actionLoading === 'yearly' ? 'Abriendo Stripe...' : yearlyButtonLabel }}
            </button>
          </article>

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
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useBilling } from '../composables/useBilling';
import SolidIcon from '../components/SolidIcon.vue';
import apiClient from '../services/apiClient';

const route = useRoute();
const { summary, isPro: isProActive, loadSummary } = useBilling();
const actionLoading = ref<'monthly' | 'yearly' | 'portal' | null>(null);
const feedbackMessage = ref('');
const feedbackTone = ref<'success' | 'warning' | 'error'>('success');

const freePlanFeatures = [
  'Hasta 2 inmuebles para validar el producto sin pagar.',
  'Acceso a propiedades, pagos, incidencias y documentos.',
  'Bloqueo automático al intentar superar la capacidad gratis.'
];

const proPlanFeatures = [
  'Hasta 25 inmuebles sin cambiar la operativa diaria.',
  'Upgrade mensual o anual desde el área de billing.',
  'Más margen para crecer sin frenar nuevas altas.'
];

const comparisonRows = [
  {
    label: 'Capacidad',
    description: 'Cuántos inmuebles puedes dar de alta antes de bloquear nuevas unidades.',
    free: '2',
    pro: '25',
    highlight: true
  },
  {
    label: 'Alta inicial',
    description: 'Cómo entra un nuevo propietario al producto.',
    free: 'Sin tarjeta',
    pro: 'Upgrade',
    highlight: false
  },
  {
    label: 'Facturación',
    description: 'Estado comercial del plan en cada modalidad.',
    free: 'Sin cobro',
    pro: 'Mensual o anual',
    highlight: false
  },
  {
    label: 'Momento ideal',
    description: 'Cuándo tiene sentido quedarse o pasar al siguiente nivel.',
    free: 'Validación',
    pro: 'Escala',
    highlight: false
  }
];

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatPrice = (priceCents: number) => currencyFormatter.format((priceCents || 0) / 100);

const usagePercentage = computed(() => {
  const unitLimit = summary.value?.usage.unitLimit ?? 0;
  const unitCount = summary.value?.usage.unitCount ?? 0;
  if (!unitLimit) return 0;
  return Math.min(Math.round((unitCount / unitLimit) * 100), 100);
});

const isAtLimit = computed(() => !(summary.value?.usage.canAddMoreUnits ?? true));

const usageDetail = computed(() => {
  const current = summary.value;
  if (!current) return 'Cargando uso del plan.';
  if (current.usage.canAddMoreUnits) {
    return `Te quedan ${current.usage.remainingUnits} inmuebles disponibles antes de bloquear nuevas altas.`;
  }
  return 'Has alcanzado el límite actual. La siguiente alta exige pasar a Pro.';
});

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
    : 'Sin fin de periodo registrado todavía.';
  if (current.billingCycle === 'yearly') return `Facturación anual. ${periodEndLabel}`;
  if (current.billingCycle === 'monthly') return `Facturación mensual. ${periodEndLabel}`;
  return periodEndLabel;
});

const upgradeTimingTitle = computed(() => {
  if (!summary.value) return 'Cargando recomendación.';
  if (isProActive.value) return 'No necesitas cambiar de plan ahora.';
  if (isAtLimit.value) return 'Ahora mismo ya toca pasar a Pro.';
  if ((summary.value.usage.remainingUnits ?? 0) <= 1) return 'Conviene prepararlo ya.';
  return 'Todavía puedes seguir en gratis.';
});

const upgradeTimingBody = computed(() => {
  if (!summary.value) return 'En cuanto cargue la cuenta verás la recomendación.';
  if (isProActive.value) return 'Tu cuenta ya tiene capacidad ampliada y portal de gestión si Stripe está disponible.';
  if (isAtLimit.value) return 'El siguiente inmueble quedará bloqueado hasta activar Pro.';
  if ((summary.value.usage.remainingUnits ?? 0) <= 1) return 'Te queda muy poco margen en gratis. Si prevés otra alta, evita fricción activando Pro.';
  return 'Mientras no llegues a 2 inmuebles puedes seguir validando el producto sin coste.';
});

const monthlyButtonLabel = computed(() =>
  isProActive.value
    ? 'Plan actual'
    : summary.value?.billing.checkoutAvailable
      ? 'Activar Pro mensual'
      : 'Solicitar Pro mensual'
);

const yearlyButtonLabel = computed(() =>
  isProActive.value
    ? 'Plan actual'
    : summary.value?.billing.checkoutAvailable
      ? 'Activar Pro anual'
      : 'Solicitar Pro anual'
);

const buildManualActivationLink = (billingCycle: 'monthly' | 'yearly') => {
  const email = summary.value?.billing.manualActivationEmail ?? 'contacto@la-kers.com';
  const subject = billingCycle === 'yearly'
    ? 'Activar plan Pro anual La-Kers'
    : 'Activar plan Pro mensual La-Kers';
  const body = billingCycle === 'yearly'
    ? 'Quiero activar el plan Pro anual de La-Kers para esta cuenta.'
    : 'Quiero activar el plan Pro mensual de La-Kers para esta cuenta.';
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const startCheckout = async (billingCycle: 'monthly' | 'yearly') => {
  if (isProActive.value) {
    feedbackTone.value = 'warning';
    feedbackMessage.value = 'La cuenta ya tiene Pro activo. Usa el portal de facturación para gestionarlo.';
    return;
  }

  if (!summary.value?.billing.checkoutAvailable) {
    window.location.href = buildManualActivationLink(billingCycle);
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
    feedbackTone.value = 'error';
    feedbackMessage.value = axios.isAxiosError(error)
      ? String(error.response?.data?.message ?? 'No se pudo abrir Stripe Checkout.')
      : 'No se pudo abrir Stripe Checkout.';
  } finally {
    actionLoading.value = null;
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
    feedbackTone.value = 'error';
    feedbackMessage.value = axios.isAxiosError(error)
      ? String(error.response?.data?.message ?? 'No se pudo abrir el portal de Stripe.')
      : 'No se pudo abrir el portal de Stripe.';
  } finally {
    actionLoading.value = null;
  }
};

onMounted(() => {
  const checkoutState = String(route.query.checkout ?? '');
  if (checkoutState === 'success') {
    feedbackTone.value = 'success';
    feedbackMessage.value = 'Checkout completado. Stripe confirmará la suscripción y el plan se actualizará en breve.';
  } else if (checkoutState === 'cancelled') {
    feedbackTone.value = 'warning';
    feedbackMessage.value = 'Checkout cancelado. El plan sigue igual hasta que completes el pago.';
  }

  loadSummary({ force: true }).catch((error) => console.error(error));
});
</script>
