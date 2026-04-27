<template>
  <div class="space-y-6 pb-10">
    <section class="rounded-[36px] border border-[#eadfd2] bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-[#d6c7bb] bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8c4d29]">
            <SolidIcon name="chart" class="h-3.5 w-3.5 text-[#c96a37]" />
            <span>CEO/Admin</span>
          </div>
          <h1 class="mt-5 text-3xl font-semibold text-slate-900 sm:text-5xl">Panel CEO</h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Métricas SaaS accionables por owner, monetización, salud operativa, retención y señales de riesgo.
          </p>
        </div>

        <form class="grid gap-3 sm:grid-cols-2 xl:grid-cols-[150px_150px_220px_auto]" @submit.prevent="loadDashboard">
          <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Desde
            <input v-model="filters.from" type="date" class="mt-2 w-full rounded-2xl border border-[#dfd5ca] bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-800 focus:border-[#1f4f46] focus:outline-none" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hasta
            <input v-model="filters.to" type="date" class="mt-2 w-full rounded-2xl border border-[#dfd5ca] bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-800 focus:border-[#1f4f46] focus:outline-none" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Tenant owner_id
            <input v-model.trim="filters.tenant" placeholder="all" class="mt-2 w-full rounded-2xl border border-[#dfd5ca] bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-800 focus:border-[#1f4f46] focus:outline-none" />
          </label>
          <div class="flex items-end gap-2">
            <button type="submit" class="rounded-full bg-[#1f4f46] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173c36] disabled:cursor-not-allowed disabled:opacity-60" :disabled="loading">
              {{ loading ? 'Cargando…' : 'Actualizar' }}
            </button>
            <button type="button" class="rounded-full border border-[#d8cec2] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#cdbba8]" @click="exportCsv('summary')">
              CSV
            </button>
          </div>
        </form>
      </div>

      <div v-if="error" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {{ error }}
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="metric in primaryMetrics" :key="metric.label" class="rounded-[30px] border border-[#eadfd2] bg-white p-5 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{{ metric.label }}</p>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-500">{{ metric.detail }}</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="rounded-[36px] border border-[#eadfd2] bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Tendencia</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Owners activos vs altas</h2>
          </div>
          <span class="rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-semibold text-[#1f4f46]">{{ summary?.trends?.length ?? 0 }} puntos</span>
        </div>
        <div class="mt-6 h-64 rounded-[28px] border border-[#eadfd2] bg-[#fbf8f2] p-4">
          <div v-if="!summary?.trends?.length" class="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
            Sin datos para el rango.
          </div>
          <div v-else class="flex h-full items-end gap-2">
            <div v-for="point in summary.trends" :key="point.label" class="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div class="flex h-48 w-full items-end justify-center gap-1">
                <span class="w-2 rounded-t-full bg-[#1f4f46]" :style="{ height: `${barHeight(point.activeOwners, maxTrendActive)}%` }"></span>
                <span class="w-2 rounded-t-full bg-[#c96a37]" :style="{ height: `${barHeight(point.newOwners, maxTrendNew)}%` }"></span>
              </div>
              <span class="truncate text-[10px] font-semibold text-slate-400">{{ point.label }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-[36px] border border-[#eadfd2] bg-white p-6 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c4d29]">Alertas</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">Riesgo y operación</h2>
        <div class="mt-6 space-y-3">
          <div v-if="!summary?.alerts?.length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Sin alertas relevantes en el rango.
          </div>
          <article v-for="alert in summary?.alerts ?? []" :key="alert.title" class="rounded-[24px] border p-4" :class="alert.severity === 'danger' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'">
            <p class="text-sm font-semibold text-slate-900">{{ alert.title }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ alert.detail }}</p>
          </article>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[36px] border border-[#eadfd2] bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Top tenants</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Owners con más actividad</h2>
          </div>
          <button type="button" class="rounded-full border border-[#d8cec2] px-4 py-2 text-xs font-semibold text-slate-600" @click="exportCsv('tenants')">CSV</button>
        </div>
        <div class="mt-6 overflow-hidden rounded-[28px] border border-[#eadfd2]">
          <table class="min-w-full divide-y divide-[#eadfd2] text-sm">
            <thead class="bg-[#fbf8f2] text-left text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th class="px-4 py-3">Owner</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Eventos</th>
                <th class="px-4 py-3">MRR</th>
                <th class="px-4 py-3">Plan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eadfd2]">
              <tr v-for="tenant in tenants" :key="tenant.ownerId">
                <td class="px-4 py-3 font-semibold text-slate-800">{{ tenant.ownerId }}</td>
                <td class="px-4 py-3 text-slate-600">{{ tenant.email ?? '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ tenant.events }}</td>
                <td class="px-4 py-3 text-slate-600">{{ formatCents(tenant.mrrCents) }}</td>
                <td class="px-4 py-3 text-slate-600">{{ tenant.planId }} · {{ tenant.subscriptionStatus }}</td>
              </tr>
              <tr v-if="!tenants.length">
                <td colspan="5" class="px-4 py-8 text-center text-slate-500">Sin tenants para mostrar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="rounded-[36px] border border-[#eadfd2] bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c4d29]">Eventos</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Actividad reciente</h2>
          </div>
          <button type="button" class="rounded-full border border-[#d8cec2] px-4 py-2 text-xs font-semibold text-slate-600" @click="exportCsv('events')">CSV</button>
        </div>
        <div class="mt-6 space-y-3">
          <article v-for="event in events" :key="event.id" class="rounded-[24px] border border-[#eadfd2] bg-[#fbf8f2] p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ event.eventName }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ event.ownerId ?? 'system' }} · {{ formatDateTime(event.occurredAt) }}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" :class="severityClass(event.severity)">
                {{ event.severity }}
              </span>
            </div>
          </article>
          <div v-if="!events.length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Sin eventos recientes.
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[36px] border border-[#eadfd2] bg-white p-6 shadow-sm">
      <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Data definitions</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">Cómo se calcula cada KPI</h2>
      <div class="mt-6 grid gap-3 md:grid-cols-2">
        <article v-for="definition in summary?.dataDefinitions ?? []" :key="definition.metric" class="rounded-[24px] border border-[#eadfd2] bg-[#fbf8f2] p-4">
          <p class="text-sm font-semibold text-slate-900">{{ definition.metric }}</p>
          <p class="mt-1 text-sm leading-6 text-slate-600">{{ definition.definition }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import SolidIcon from '../components/SolidIcon.vue';
import apiClient from '../services/apiClient';

type CeoSummary = {
  kpis: any;
  trends: Array<{ label: string; activeOwners: number; newOwners: number; events: number }>;
  alerts: Array<{ severity: string; title: string; detail: string }>;
  dataDefinitions: Array<{ metric: string; definition: string }>;
};

type TenantRow = {
  ownerId: string;
  email: string | null;
  events: number;
  mrrCents: number;
  planId: string;
  subscriptionStatus: string;
};

type EventRow = {
  id: string;
  ownerId: string | null;
  eventName: string;
  severity: string;
  occurredAt: string;
};

const today = new Date();
const defaultFrom = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const filters = reactive({
  from: toDateInput(defaultFrom),
  to: toDateInput(today),
  tenant: ''
});

const summary = ref<CeoSummary | null>(null);
const tenants = ref<TenantRow[]>([]);
const events = ref<EventRow[]>([]);
const loading = ref(false);
const error = ref('');

const params = computed(() => ({
  from: filters.from,
  to: filters.to,
  tenant: filters.tenant || 'all'
}));

const formatNumber = (value: number | null | undefined) => new Intl.NumberFormat('es-ES').format(Number(value ?? 0));
const formatPercent = (value: number | null | undefined) => `${Math.round(Number(value ?? 0))}%`;
const formatCents = (value: number | null | undefined) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value ?? 0) / 100);
const formatDateTime = (value: string | null | undefined) => (value ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—');

const primaryMetrics = computed(() => {
  const kpis = summary.value?.kpis;
  return [
    { label: 'Owners activos', value: formatNumber(kpis?.tenants?.activeOwners), detail: `${formatNumber(kpis?.tenants?.newOwners)} altas · neto ${formatNumber(kpis?.tenants?.netGrowth)}` },
    { label: 'Activación', value: formatPercent(kpis?.activation?.activationRate), detail: `${formatNumber(kpis?.activation?.activatedOwners)} owners activados` },
    { label: 'MRR / ARR', value: formatCents(kpis?.monetization?.mrrCents), detail: `${formatCents(kpis?.monetization?.arrCents)} ARR` },
    { label: 'Latencia p95', value: `${formatNumber(kpis?.operation?.latencyP95Ms)} ms`, detail: `${formatNumber(kpis?.operation?.errorCount)} errores backend` },
    { label: 'DAU / WAU / MAU', value: `${formatNumber(kpis?.usage?.dau)} / ${formatNumber(kpis?.usage?.wau)} / ${formatNumber(kpis?.usage?.mau)}`, detail: 'Owners únicos con uso no pasivo' },
    { label: 'Retención 30d', value: formatPercent(kpis?.retention?.find((item: any) => item.days === 30)?.retentionRate), detail: 'Cohorte simple por owner' },
    { label: 'Webhooks', value: `${formatNumber(kpis?.operation?.webhooks?.failed)} fail`, detail: `${formatNumber(kpis?.operation?.webhooks?.retries)} retries` },
    { label: 'Riesgo', value: formatNumber(kpis?.risk?.dangerEvents), detail: `${formatNumber(kpis?.risk?.deniedCeoAccess)} accesos CEO denegados` }
  ];
});

const maxTrendActive = computed(() => Math.max(...(summary.value?.trends ?? []).map((point) => point.activeOwners), 1));
const maxTrendNew = computed(() => Math.max(...(summary.value?.trends ?? []).map((point) => point.newOwners), 1));
const barHeight = (value: number, maxValue: number) => Math.max(6, Math.round((value / Math.max(maxValue, 1)) * 100));

const severityClass = (severity: string) => {
  if (severity === 'danger') return 'bg-rose-100 text-rose-700';
  if (severity === 'warning') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
};

const loadDashboard = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [summaryResponse, tenantsResponse, eventsResponse] = await Promise.all([
      apiClient.get('/ceo-analytics/summary', { params: params.value }),
      apiClient.get('/ceo-analytics/tenants', { params: { ...params.value, pageSize: 8 } }),
      apiClient.get('/ceo-analytics/events', { params: { ...params.value, pageSize: 8 } })
    ]);
    summary.value = summaryResponse.data as CeoSummary;
    tenants.value = (tenantsResponse.data?.items ?? []) as TenantRow[];
    events.value = (eventsResponse.data?.items ?? []) as EventRow[];
  } catch (loadError: any) {
    error.value = loadError?.response?.data?.message ?? 'No se pudo cargar el Panel CEO.';
  } finally {
    loading.value = false;
  }
};

const exportCsv = async (section: string) => {
  try {
    const response = await apiClient.get('/ceo-analytics/export.csv', {
      params: { ...params.value, section },
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ceo-analytics-${section}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (exportError: any) {
    error.value = exportError?.response?.data?.message ?? 'No se pudo exportar el CSV.';
  }
};

onMounted(loadDashboard);
</script>
