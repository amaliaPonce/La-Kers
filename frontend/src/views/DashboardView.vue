<template>
  <div class="space-y-6 pb-10">
    <section class="space-y-6 rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-lg backdrop-blur-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Resumen express</p>
          <h1 class="text-3xl font-semibold text-slate-900">Dashboard del propietario</h1>
          <p class="text-sm text-slate-500">3 segundos para entender ingresos, ocupación y riesgos.</p>
        </div>
        <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isLoading"
            @click="refreshDashboard"
          >
            <svg v-if="isLoading" class="h-3.5 w-3.5 animate-spin text-white" viewBox="0 0 24 24">
              <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4z" />
            </svg>
            <span>{{ isLoading ? 'Actualizando...' : 'Actualizar datos' }}</span>
          </button>
          <span class="text-xs text-slate-500">Última actualización: {{ lastSyncedLabel }}</span>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          v-for="metric in metrics"
          :key="metric.id"
          :label="metric.label"
          :value="metric.value"
          :subtext="metric.subtext"
          :percentage="metric.percentage"
          :tone="metric.tone"
          :indicator-label="metric.indicatorLabel"
          :formatter="metric.formatter || formatCurrency"
          :loading="isLoading"
        />
      </div>
    </section>


    <AlertCard :alerts="alertItems" :loading="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AlertCard from '../components/AlertCard.vue';
import IncomeTrendChart from '../components/IncomeTrendChart.vue';
import MetricCard from '../components/MetricCard.vue';
import apiClient from '../services/apiClient';

type IncomeTrendPoint = {
  month: number;
  year: number;
  label: string;
  collected: number;
};

type DashboardSummary = {
  totalExpectedMes?: number;
  totalPaidMes?: number;
  totalPendingMes?: number;
  totalLateMes?: number;
  unidadesOcupadas?: number;
  unidadesDisponibles?: number;
  totalUnits?: number;
  totalTenants?: number;
  incomeTrend?: IncomeTrendPoint[];
};

type PaymentRecord = {
  id?: string;
  amount?: number;
  status?: string;
};

type TenantRecord = {
  id?: string;
  contract_end?: string | null;
};

type IncidentRecord = {
  id?: string;
  cost?: number | null;
  status?: string | null;
};

type AlertTone = 'neutral' | 'info' | 'warning' | 'danger';

type DashboardAlert = {
  id: string;
  title: string;
  valueLabel: string;
  detail: string;
  helper?: string;
  tone?: AlertTone;
};

const summary = ref<DashboardSummary | null>(null);
const payments = ref<PaymentRecord[]>([]);
const tenants = ref<TenantRecord[]>([]);
const incidents = ref<IncidentRecord[]>([]);
const isLoading = ref(false);
const lastSynced = ref<Date | null>(null);

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const msPerDay = 1000 * 60 * 60 * 24;
const contractWindowDays = 30;

const loadDashboard = async () => {
  isLoading.value = true;
  try {
    const [summaryResponse, paymentsResponse, tenantsResponse, incidentsResponse] =
      await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/payments'),
        apiClient.get('/tenants'),
        apiClient.get('/incidents')
      ]);

    summary.value = summaryResponse.data ?? null;
    payments.value = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
    tenants.value = Array.isArray(tenantsResponse.data) ? tenantsResponse.data : [];
    incidents.value = Array.isArray(incidentsResponse.data) ? incidentsResponse.data : [];
    lastSynced.value = new Date();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const refreshDashboard = () => {
  loadDashboard();
};

onMounted(() => {
  loadDashboard();
});

const expectedValue = computed(() => summary.value?.totalExpectedMes ?? 0);
const paidValue = computed(() => summary.value?.totalPaidMes ?? 0);
const lateValue = computed(() => summary.value?.totalLateMes ?? 0);

const shareOfTarget = (amount: number) => {
  if (!expectedValue.value) return 0;
  return Math.min(100, Math.round((amount / expectedValue.value) * 100));
};

const occupiedUnits = computed(() => summary.value?.unidadesOcupadas ?? 0);
const totalUnits = computed(() => summary.value?.totalUnits ?? 0);
const occupancyPercent = computed(() => {
  if (!totalUnits.value) return 0;
  return Math.min(100, Math.round((occupiedUnits.value / totalUnits.value) * 100));
});

const formatPercent = (value: number) => `${Math.round(value)}%`;

const overduePayments = computed(() =>
  payments.value.filter((payment) => String(payment.status).toUpperCase() === 'LATE')
);

const overdueCount = computed(() => overduePayments.value.length);

const overdueAmount = computed(() =>
  overduePayments.value.reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0)
);

const openIncidents = computed(() =>
  incidents.value.filter((incident) => String(incident.status).toUpperCase() !== 'CLOSED')
);

const openIncidentCost = computed(() =>
  openIncidents.value.reduce((total, incident) => total + Number(incident.cost ?? 0), 0)
);

const metrics = computed(() => [
  {
    id: 'paid',
    label: 'Ingresos cobrados este mes',
    value: paidValue.value,
    subtext: 'Pagos confirmados',
    percentage: shareOfTarget(paidValue.value),
    indicatorLabel: 'Cobrado del objetivo',
    tone: 'success' as const
  },
  {
    id: 'potential',
    label: 'Ingresos potenciales',
    value: expectedValue.value,
    subtext: 'Base contractual',
    indicatorLabel: 'Meta contractual',
    tone: 'neutral' as const
  },
  {
    id: 'occupancy',
    label: 'Ocupación',
    value: occupancyPercent.value,
    subtext: `${occupiedUnits.value} de ${totalUnits.value} unidades`,
    percentage: occupancyPercent.value,
    indicatorLabel: 'Unidades ocupadas',
    tone: 'success' as const,
    formatter: formatPercent
  },
  {
    id: 'late',
    label: 'Pagos retrasados',
    value: lateValue.value,
    subtext: `${overdueCount.value} ${overdueCount.value === 1 ? 'pago' : 'pagos'} en mora`,
    percentage: shareOfTarget(lateValue.value),
    indicatorLabel: 'Del objetivo',
    tone: 'danger' as const
  }
]);

const incomeTrendChartData = computed(() =>
  (summary.value?.incomeTrend ?? []).map((entry) => ({
    label: entry.label,
    value: entry.collected
  }))
);

const latestTrendEntry = computed(() => {
  const trend = summary.value?.incomeTrend;
  if (!trend || !trend.length) return null;
  return trend[trend.length - 1];
});

const latestTrendLabel = computed(() =>
  latestTrendEntry.value ? `${latestTrendEntry.value.label} ${latestTrendEntry.value.year}` : '—'
);

const latestTrendValue = computed(() => latestTrendEntry.value?.collected ?? 0);

const upcomingContracts = computed(() => {
  const reference = new Date();
  return tenants.value
    .map((tenant) => {
      if (!tenant.contract_end) return null;
      const target = new Date(tenant.contract_end);
      if (Number.isNaN(target.getTime())) return null;
      const diffDays = Math.ceil((target.getTime() - reference.getTime()) / msPerDay);
      return { diffDays, tenant };
    })
    .filter((item): item is { diffDays: number; tenant: TenantRecord } => {
      if (!item) return false;
      return item.diffDays >= 0 && item.diffDays <= contractWindowDays;
    });
});

const earliestExpiry = computed(() => {
  if (!upcomingContracts.value.length) return null;
  return upcomingContracts.value.reduce((min, current) => Math.min(min, current.diffDays), Infinity);
});

const alertItems = computed<DashboardAlert[]>(() => {
  const upcomingCount = upcomingContracts.value.length;
  const overdueCount = overduePayments.value.length;
  const incidentsCount = openIncidents.value.length;
  return [
    {
      id: 'contracts',
      title: 'Contratos próximos a vencer',
      valueLabel: `${upcomingCount} ${upcomingCount === 1 ? 'contrato' : 'contratos'}`,
      detail: upcomingCount
        ? `El contrato más cercano vence en ${earliestExpiry.value} días`
        : 'Sin vencimientos urgentes',
      helper: upcomingCount ? `${upcomingCount} en vigilancia activa` : 'Agenda limpia',
      tone: upcomingCount ? 'warning' : 'neutral'
    },
    {
      id: 'overdue',
      title: 'Pagos vencidos',
      valueLabel: `${overdueCount} ${overdueCount === 1 ? 'pago' : 'pagos'}`,
      detail: overdueCount ? 'Requieren atención inmediata' : 'Cartera al día',
      helper: overdueAmount.value ? `Importe ${formatCurrency(overdueAmount.value)}` : 'Sin retrasos',
      tone: overdueCount ? 'danger' : 'neutral'
    },
    {
      id: 'incidents',
      title: 'Incidencias abiertas',
      valueLabel: `${incidentsCount} ${incidentsCount === 1 ? 'incidencia' : 'incidencias'}`,
      detail: incidentsCount ? 'Impactan en rentabilidad' : 'Rentabilidad intacta y lista para crecer',
      helper: incidentsCount && openIncidentCost.value ? `Coste estimado ${formatCurrency(openIncidentCost.value)}` : undefined,
      tone: incidentsCount ? 'warning' : 'info'
    }
  ];
});

const lastSyncedLabel = computed(() => {
  if (!lastSynced.value) return 'Sin sincronizar';
  return dateFormatter.format(lastSynced.value);
});
</script>
