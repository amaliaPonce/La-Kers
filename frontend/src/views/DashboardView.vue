<template>
  <div class="space-y-6 pb-10">
    <section
      v-if="showEmptyDashboard"
      class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <EmptyPropertiesState
        eyebrow="Dashboard"
        title="Aún no tienes propiedades"
        description="Empieza creando tu primera propiedad para activar el panel."
        cta-label="Ir a propiedades"
        cta-to="/apartments"
      />

      <div class="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          Resumen financiero
        </p>
        <p class="mt-2 text-sm leading-7 text-slate-600">
          Cuando registres pagos, aquí verás el resumen financiero.
        </p>
      </div>
    </section>

    <template v-else>
      <section class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="space-y-5">
          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-700">
              <SolidIcon name="dashboard" class="h-3.5 w-3.5 text-[#c96a37]" />
              <span>Vista operativa</span>
            </div>
            <div
              v-if="realtimeBadge.label"
              class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em]"
              :class="realtimeBadge.className"
            >
              <span class="h-2.5 w-2.5 rounded-full" :class="realtimeBadge.dotClass"></span>
              <span>{{ realtimeBadge.label }}</span>
            </div>
          </div>

          <div class="max-w-3xl">
            <h1 class="text-3xl font-semibold text-slate-900 sm:text-5xl">Dashboard</h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Ve cobros, unidades libres y pagos atrasados sin leer de más.
            </p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            v-for="metric in metrics"
            :key="metric.id"
            :label="metric.label"
            :value="metric.value"
            :subtext="metric.subtext"
            :helper="metric.helper"
            :percentage="metric.percentage"
            :tone="metric.tone"
            :icon="metric.icon"
            :indicator-label="metric.indicatorLabel"
            :formatter="metric.formatter || formatCurrency"
            :loading="isLoading"
            flat
          />
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <article class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">
              <SolidIcon name="wallet" class="h-3.5 w-3.5" />
              <span>Distribución mensual</span>
            </div>
            <h2 class="text-2xl font-semibold text-slate-900">Cómo se reparte el mes</h2>
            <p class="text-sm text-slate-500">Lo cobrado, lo pendiente y la parte ya caída en mora.</p>
          </div>

          <div class="mt-6 space-y-4">
            <div
              v-for="item in breakdownItems"
              :key="item.id"
              class="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ item.label }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ item.detail }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xl font-semibold text-slate-900">{{ item.value }}</p>
                  <p class="mt-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{{ item.shareLabel }}</p>
                </div>
              </div>
              <div class="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full transition-all duration-500" :class="item.barClass" :style="{ width: `${item.share}%` }"></div>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">
              <SolidIcon name="spark" class="h-3.5 w-3.5" />
              <span>Resumen rápido</span>
            </div>
            <h2 class="text-2xl font-semibold text-slate-900">Lo importante hoy</h2>
            <p class="text-sm text-slate-500">Tres señales claras para decidir el siguiente paso.</p>
          </div>

          <div class="mt-6 grid gap-3">
            <article
              v-for="highlight in dashboardHighlights"
              :key="highlight.id"
              class="rounded-[28px] border p-5 shadow-sm"
              :class="highlightStyles(highlight.tone).card"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {{ highlight.title }}
                  </p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ highlight.value }}</p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]"
                  :class="highlightStyles(highlight.tone).badge"
                >
                  {{ highlight.badge }}
                </span>
              </div>
              <p class="mt-3 text-sm leading-6 text-slate-700">{{ highlight.body }}</p>
            </article>
          </div>
        </article>
      </section>

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import EmptyPropertiesState from '../components/empty-states/EmptyPropertiesState.vue';
import MetricCard from '../components/MetricCard.vue';
import SolidIcon from '../components/SolidIcon.vue';
import { runtimeConfig } from '../config/runtimeConfig';
import { useOnboarding } from '../composables/useOnboarding';
import apiClient from '../services/apiClient';

type DashboardSummary = {
  totalExpectedMes?: number;
  totalPaidMes?: number;
  totalPendingMes?: number;
  totalLateMes?: number;
  unidadesOcupadas?: number;
  unidadesDisponibles?: number;
  totalUnits?: number;
  totalTenants?: number;
};

type PaymentRecord = {
  id?: string;
  amount?: number;
  status?: string;
};

type IncidentRecord = {
  id?: string;
  status?: string;
};

type HighlightTone = 'neutral' | 'success' | 'warning' | 'danger';

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.PROD ? '/api' : 'http://localhost:4000');
const DASHBOARD_REFRESH_DEBOUNCE_MS = 350;
const DASHBOARD_STREAM_RECONNECT_MS = 5000;
const DASHBOARD_FALLBACK_POLL_MS = 60000;

const summary = ref<DashboardSummary | null>(null);
const payments = ref<PaymentRecord[]>([]);
const incidents = ref<IncidentRecord[]>([]);
const isLoading = ref(false);
const realtimeStatus = ref<'manual' | 'connecting' | 'live' | 'offline'>(
  runtimeConfig.enableDashboardRealtime ? 'connecting' : 'manual'
);
const { completeStep } = useOnboarding();

let dashboardEventSource: EventSource | null = null;
let refreshTimeoutId: number | null = null;
let reconnectTimeoutId: number | null = null;
let fallbackPollIntervalId: number | null = null;
let loadInFlight = false;
let reloadQueued = false;

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const formatCurrency = (value: number) => currencyFormatter.format(value);

const clearRefreshTimeout = () => {
  if (refreshTimeoutId !== null) {
    window.clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
};

const clearReconnectTimeout = () => {
  if (reconnectTimeoutId !== null) {
    window.clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = null;
  }
};

const clearFallbackPolling = () => {
  if (fallbackPollIntervalId !== null) {
    window.clearInterval(fallbackPollIntervalId);
    fallbackPollIntervalId = null;
  }
};

const loadDashboard = async (options: { silent?: boolean } = {}) => {
  if (loadInFlight) {
    reloadQueued = true;
    return;
  }

  const { silent = false } = options;
  loadInFlight = true;
  if (!silent) {
    isLoading.value = true;
  }

  try {
    const [summaryResponse, paymentsResponse, incidentsResponse] = await Promise.all([
      apiClient.get('/dashboard/summary'),
      apiClient.get('/payments'),
      apiClient.get('/incidents')
    ]);

    summary.value = summaryResponse.data ?? null;
    payments.value = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
    incidents.value = Array.isArray(incidentsResponse.data) ? incidentsResponse.data : [];
  } catch (error) {
    console.error(error);
  } finally {
    loadInFlight = false;
    isLoading.value = false;

    if (reloadQueued) {
      reloadQueued = false;
      window.setTimeout(() => {
        void loadDashboard({ silent: true });
      }, 0);
    }
  }
};

const scheduleDashboardRefresh = () => {
  if (refreshTimeoutId !== null) return;

  refreshTimeoutId = window.setTimeout(() => {
    refreshTimeoutId = null;
    void loadDashboard({ silent: true });
  }, DASHBOARD_REFRESH_DEBOUNCE_MS);
};

const buildDashboardStreamUrl = () => {
  const normalizedApiBase = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
  const baseUrl = /^https?:\/\//i.test(normalizedApiBase)
    ? normalizedApiBase
    : new URL(normalizedApiBase, window.location.origin).toString();
  const streamUrl = new URL('dashboard/stream', baseUrl);
  return streamUrl.toString();
};

const scheduleDashboardStreamReconnect = () => {
  if (reconnectTimeoutId !== null) return;

  reconnectTimeoutId = window.setTimeout(() => {
    reconnectTimeoutId = null;
    connectDashboardStream();
  }, DASHBOARD_STREAM_RECONNECT_MS);
};

const disconnectDashboardStream = () => {
  clearReconnectTimeout();
  if (dashboardEventSource) {
    dashboardEventSource.close();
    dashboardEventSource = null;
  }
};

const connectDashboardStream = () => {
  if (!runtimeConfig.enableDashboardRealtime) {
    realtimeStatus.value = 'manual';
    return;
  }

  disconnectDashboardStream();

  if (typeof EventSource === 'undefined') {
    realtimeStatus.value = 'offline';
    return;
  }

  const streamUrl = buildDashboardStreamUrl();
  if (!streamUrl) {
    realtimeStatus.value = 'offline';
    return;
  }

  realtimeStatus.value = 'connecting';
  const source = new EventSource(streamUrl);
  dashboardEventSource = source;

  source.addEventListener('connected', () => {
    realtimeStatus.value = 'live';
    clearReconnectTimeout();
  });

  source.addEventListener('dashboard-update', () => {
    realtimeStatus.value = 'live';
    scheduleDashboardRefresh();
  });

  source.onerror = () => {
    if (dashboardEventSource === source) {
      source.close();
      dashboardEventSource = null;
    }
    realtimeStatus.value = 'offline';
    scheduleDashboardStreamReconnect();
  };
};

const startFallbackPolling = () => {
  clearFallbackPolling();
  fallbackPollIntervalId = window.setInterval(() => {
    void loadDashboard({ silent: true });
  }, DASHBOARD_FALLBACK_POLL_MS);
};

const handleVisibilityChange = () => {
  if (document.visibilityState !== 'visible') return;
  void loadDashboard({ silent: true });
  if (runtimeConfig.enableDashboardRealtime && !dashboardEventSource) {
    connectDashboardStream();
  }
};

onMounted(() => {
  void loadDashboard();
  if (runtimeConfig.enableDashboardRealtime) {
    connectDashboardStream();
    startFallbackPolling();
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  clearRefreshTimeout();
  clearFallbackPolling();
  disconnectDashboardStream();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

const expectedValue = computed(() => summary.value?.totalExpectedMes ?? 0);
const paidValue = computed(() => summary.value?.totalPaidMes ?? 0);
const pendingValue = computed(() => summary.value?.totalPendingMes ?? 0);
const lateValue = computed(() => summary.value?.totalLateMes ?? 0);

const shareOfTarget = (amount: number) => {
  if (!expectedValue.value) return 0;
  return Math.min(100, Math.round((amount / expectedValue.value) * 100));
};

const occupiedUnits = computed(() => summary.value?.unidadesOcupadas ?? 0);
const totalUnits = computed(() => summary.value?.totalUnits ?? 0);
const availableUnits = computed(() => {
  if (typeof summary.value?.unidadesDisponibles === 'number') {
    return summary.value.unidadesDisponibles;
  }
  return Math.max(totalUnits.value - occupiedUnits.value, 0);
});

const occupancyPercent = computed(() => {
  if (!totalUnits.value) return 0;
  return Math.min(100, Math.round((occupiedUnits.value / totalUnits.value) * 100));
});

const formatPercent = (value: number) => `${Math.round(value)}%`;

const pendingPayments = computed(() =>
  payments.value.filter((payment) => String(payment.status).toUpperCase() === 'PENDING')
);

const pendingCount = computed(() => pendingPayments.value.length);

const overduePayments = computed(() =>
  payments.value.filter((payment) => String(payment.status).toUpperCase() === 'LATE')
);

const overdueCount = computed(() => overduePayments.value.length);

const overdueAmount = computed(() =>
  overduePayments.value.reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0)
);

const outstandingValue = computed(() => pendingValue.value + lateValue.value);
const outstandingCount = computed(() => pendingCount.value + overdueCount.value);
const collectionRate = computed(() => shareOfTarget(paidValue.value));
const pendingRate = computed(() => shareOfTarget(pendingValue.value));
const lateRate = computed(() => shareOfTarget(lateValue.value));
const openIncidentCount = computed(() =>
  incidents.value.filter((incident) => {
    const status = String(incident.status).toUpperCase();
    return status === 'OPEN' || status === 'IN_PROGRESS';
  }).length
);
const inProgressIncidentCount = computed(() =>
  incidents.value.filter((incident) => String(incident.status).toUpperCase() === 'IN_PROGRESS').length
);
const hasConfiguredPortfolio = computed(() => totalUnits.value > 0);
const hasRegisteredTenants = computed(() => (summary.value?.totalTenants ?? 0) > 0);
const hasCollectedPayments = computed(() =>
  payments.value.some((payment) => String(payment.status).toUpperCase() === 'PAID')
);
const showEmptyDashboard = computed(
  () =>
    !isLoading.value &&
    !hasConfiguredPortfolio.value &&
    !hasRegisteredTenants.value &&
    payments.value.length === 0
);
watch(
  [hasConfiguredPortfolio, hasRegisteredTenants, hasCollectedPayments],
  ([portfolioReady, tenantsReady, paymentsReady]) => {
    if (portfolioReady) completeStep('propertyCreated');
    if (tenantsReady) completeStep('tenantAdded');
    if (paymentsReady) completeStep('paymentAdded');
  },
  { immediate: true }
);
const realtimeBadge = computed(() => {
  switch (realtimeStatus.value) {
    case 'manual':
      return {
        label: '',
        className: 'border-slate-200 bg-slate-50 text-slate-600',
        dotClass: 'bg-slate-400'
      };
    case 'live':
      return {
        label: 'Sincronización en vivo',
        className: 'border-[#d5e4dd] bg-[#edf6f2] text-[#1f4f46]',
        dotClass: 'bg-emerald-500'
      };
    case 'offline':
      return {
        label: 'Reconectando',
        className: 'border-[#ead8ca] bg-[#fff1e7] text-[#8c4d29]',
        dotClass: 'bg-amber-500'
      };
    default:
      return {
        label: 'Conectando',
        className: 'border-slate-200 bg-white/90 text-slate-600',
        dotClass: 'bg-slate-400'
      };
  }
});
const breakdownItems = computed(() => [
  {
    id: 'paid',
    label: 'Cobrado',
    detail: collectionRate.value >= 80 ? 'Ritmo sano para este punto del mes' : 'Conviene seguir empujando cobros',
    value: formatCurrency(paidValue.value),
    share: collectionRate.value,
    shareLabel: `${formatPercent(collectionRate.value)} del objetivo`,
    barClass: 'bg-[#1f4f46]'
  },
  {
    id: 'pending',
    label: 'Pendiente',
    detail: pendingCount.value
      ? `${pendingCount.value} ${pendingCount.value === 1 ? 'pago pendiente' : 'pagos pendientes'} todavía en ventana`
      : 'No quedan pagos pendientes en ventana',
    value: formatCurrency(pendingValue.value),
    share: pendingRate.value,
    shareLabel: `${formatPercent(pendingRate.value)} del objetivo`,
    barClass: 'bg-[#c96a37]'
  },
  {
    id: 'late',
    label: 'En mora',
    detail: overdueCount.value
      ? `${overdueCount.value} ${overdueCount.value === 1 ? 'caso fuera de plazo' : 'casos fuera de plazo'}`
      : 'Sin retrasos acumulados',
    value: formatCurrency(lateValue.value),
    share: lateRate.value,
    shareLabel: `${formatPercent(lateRate.value)} del objetivo`,
    barClass: 'bg-rose-500'
  }
]);
const highlightStyles = (tone: HighlightTone) => {
  switch (tone) {
    case 'success':
      return {
        card: 'border-[#d5e4dd] bg-[#edf6f2]',
        badge: 'bg-white/90 text-[#1f4f46]'
      };
    case 'warning':
      return {
        card: 'border-[#ead8ca] bg-[#fff7f1]',
        badge: 'bg-white/90 text-[#8c4d29]'
      };
    case 'danger':
      return {
        card: 'border-rose-200 bg-rose-50',
        badge: 'bg-white/90 text-rose-600'
      };
    default:
      return {
        card: 'border-slate-200 bg-slate-50',
        badge: 'bg-white/90 text-slate-600'
      };
  }
};
const dashboardHighlights = computed(() => [
  {
    id: 'collection',
    title: 'Cobro',
    value: formatPercent(collectionRate.value),
    badge: collectionRate.value >= 80 ? 'Bien' : 'Seguir',
    body:
      collectionRate.value >= 80
        ? 'Buen ritmo de cobro este mes.'
        : collectionRate.value > 0
          ? 'Cobro bajo. Conviene insistir esta semana.'
          : 'Aún no entra dinero este mes.',
    tone: (collectionRate.value >= 80 ? 'success' : 'warning') as HighlightTone
  },
  {
    id: 'availability',
    title: 'Libres',
    value: String(availableUnits.value),
    badge: availableUnits.value ? 'Mover' : 'Lleno',
    body: availableUnits.value
      ? `Hay ${availableUnits.value} ${availableUnits.value === 1 ? 'unidad libre' : 'unidades libres'} para alquilar.`
      : 'Ahora mismo todo está ocupado.',
    tone: (availableUnits.value ? 'warning' : 'success') as HighlightTone
  },
  {
    id: 'overdue',
    title: 'Atrasos',
    value: String(overdueCount.value),
    badge: overdueCount.value ? 'Urgente' : 'Limpio',
    body: overdueCount.value
      ? `Hay ${overdueCount.value} ${overdueCount.value === 1 ? 'pago atrasado' : 'pagos atrasados'} por ${formatCurrency(overdueAmount.value)}.`
      : 'No hay pagos atrasados.',
    tone: (overdueCount.value ? 'danger' : 'success') as HighlightTone
  }
]);

const metrics = computed(() => [
  {
    id: 'paid',
    label: 'Cobrado este mes',
    value: paidValue.value,
    subtext: 'Pagos confirmados',
    helper: shareOfTarget(paidValue.value)
      ? `${formatPercent(shareOfTarget(paidValue.value))} del objetivo`
      : 'Sin cobros registrados',
    percentage: shareOfTarget(paidValue.value),
    indicatorLabel: 'Cobrado del objetivo',
    tone: 'success' as const,
    icon: 'wallet'
  },
  {
    id: 'expected',
    label: 'Objetivo mensual',
    value: expectedValue.value,
    subtext: 'Base contractual',
    helper: totalUnits.value
      ? `${totalUnits.value} ${totalUnits.value === 1 ? 'unidad configurada' : 'unidades configuradas'}`
      : 'Sin unidades registradas',
    indicatorLabel: 'Meta contractual',
    tone: 'neutral' as const,
    icon: 'coin'
  },
  {
    id: 'occupancy',
    label: 'Ocupación',
    value: occupancyPercent.value,
    subtext: `${occupiedUnits.value} de ${totalUnits.value} unidades ocupadas`,
    helper: `${availableUnits.value} ${availableUnits.value === 1 ? 'unidad libre' : 'unidades libres'}`,
    percentage: occupancyPercent.value,
    indicatorLabel: 'Unidades ocupadas',
    tone: 'warning' as const,
    formatter: formatPercent,
    icon: 'building'
  },
  {
    id: 'outstanding',
    label: 'Pendiente por cobrar',
    value: outstandingValue.value,
    subtext: outstandingCount.value
      ? `${outstandingCount.value} ${outstandingCount.value === 1 ? 'pago pendiente' : 'pagos pendientes'}`
      : 'Sin pagos pendientes',
    helper: overdueCount.value
      ? ''
      : outstandingValue.value
        ? `Pendiente ${formatCurrency(pendingValue.value)} · Mora ${formatCurrency(lateValue.value)}`
        : 'Todo al día',
    percentage: shareOfTarget(outstandingValue.value),
    indicatorLabel: 'Del objetivo',
    tone: outstandingValue.value ? ('danger' as const) : ('success' as const),
    icon: 'warning'
  }
]);

</script>
