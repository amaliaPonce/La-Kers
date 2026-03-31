<template>
  <div class="space-y-8 px-4 pb-10 pt-6">
    <section class="space-y-6 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500">Centro de cobros</p>
          <h1 class="text-3xl font-semibold text-slate-900">Pagos</h1>
        </div>
        <p class="text-sm text-slate-500">Última actualización {{ lastUpdatedLabel }}</p>
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PaymentMetricCard
          v-for="metric in metricCards"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
          :sub-label="metric.subLabel"
          :accent="metric.accent"
        />
      </div>
    </section>

    <template v-if="hasAnyPayments">
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div class="order-2 space-y-5 xl:order-1">
          <PaymentFilters
            :state-filter="filters.state"
            :apartment-filter="filters.apartment"
            :month-filter="filters.month"
            :search-term="filters.query"
            :apartment-options="apartmentOptions"
            :month-options="monthOptions"
            @update:stateFilter="updateStateFilter"
            @update:apartmentFilter="updateApartmentFilter"
            @update:monthFilter="updateMonthFilter"
            @update:searchTerm="updateSearchTerm"
          />
          <PaymentSummaryBar
            :month-label="summaryMonthLabel"
            :collected="summaryTotals.collected"
            :expected="summaryTotals.expected"
            :pending="outstandingPending"
            :late="summaryTotals.late"
          />
        </div>
        <aside ref="detailPanelRef" class="order-1 scroll-mt-24 xl:order-2 xl:sticky xl:top-6">
          <transition name="detail-slide" mode="out-in">
            <article
              v-if="selectedPayment"
              key="payment-detail"
              class="rounded-[32px] border border-[#ead8ca] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(249,246,240,0.96))] p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Ficha activa</p>
                  <div>
                    <h3 class="text-2xl font-semibold text-slate-900">{{ selectedPayment.tenant_persons?.full_name ?? '—' }}</h3>
                    <p class="mt-1 text-sm text-slate-500">
                      {{ selectedPayment.units?.name ?? 'Sin apartamento asignado' }} ·
                      {{ formatMonthLabel(createMonthKey(selectedPayment.year, selectedPayment.month)) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <PaymentStatusBadge :status="selectedPayment.status" />
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                    @click="selectedPayment = null"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Monto</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(selectedPayment.amount ?? 0) }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Vencimiento</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(selectedPayment.due_date) }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado de mora</p>
                  <p
                    class="mt-2 text-base font-semibold"
                    :class="{
                      'text-rose-600': selectedDaysLate > 0,
                      'text-amber-600': !selectedDaysLate && selectedDaysUntilDue <= 3,
                      'text-emerald-600': selectedPayment.status === 'PAID'
                    }"
                  >
                    <span v-if="selectedPayment.status === 'PAID'">Cobro confirmado</span>
                    <span v-else-if="selectedDaysLate > 0">{{ selectedDaysLate }} días de retraso</span>
                    <span v-else>Vence en {{ selectedDaysUntilDue }} días</span>
                  </p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Última actualización</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ lastUpdatedLabel }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Método de pago</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">
                    {{ formatPaymentMethod(selectedPayment.payment_method, selectedPayment.status) }}
                  </p>
                </div>
              </div>

              <div class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Seguimiento</p>
                <p class="mt-2 text-base font-semibold text-slate-900">
                  {{ selectedPayment.status === 'PAID' ? 'Pago liquidado' : 'Cobro en seguimiento' }}
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  {{ selectedDaysLate > 0 ? `Retraso acumulado de ${selectedDaysLate} días.` : `Periodo ${formatMonthLabel(createMonthKey(selectedPayment.year, selectedPayment.month))}.` }}
                </p>
              </div>

              <div class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Histórico del inquilino</p>
                    <p class="mt-2 text-base font-semibold text-slate-900">Cómo ha pagado en periodos anteriores</p>
                  </div>
                  <p class="text-xs font-semibold text-slate-500">{{ selectedTenantHistory.length }} registros</p>
                </div>

                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Pagado</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ selectedHistorySummary.paidCount }}</p>
                    <p class="text-xs text-slate-500">{{ formatCurrency(selectedHistorySummary.paidAmount) }}</p>
                  </div>
                  <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Banco</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ selectedHistorySummary.bankCount }}</p>
                    <p class="text-xs text-slate-500">{{ formatCurrency(selectedHistorySummary.bankAmount) }}</p>
                  </div>
                  <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Efectivo</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ selectedHistorySummary.cashCount }}</p>
                    <p class="text-xs text-slate-500">{{ formatCurrency(selectedHistorySummary.cashAmount) }}</p>
                  </div>
                </div>

                <div v-if="selectedTenantHistory.length" class="mt-4 space-y-3">
                  <article
                    v-for="historyPayment in selectedTenantHistory"
                    :key="historyPayment.id"
                    class="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm font-semibold text-slate-900">
                          {{ formatMonthLabel(createMonthKey(historyPayment.year, historyPayment.month)) }}
                        </p>
                        <p class="mt-1 text-xs text-slate-500">
                          {{ historyPayment.units?.name ?? 'Sin apartamento' }} ·
                          {{ formatDate(historyPayment.paid_date ?? historyPayment.due_date) }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-semibold text-slate-900">{{ formatCurrency(historyPayment.amount ?? 0) }}</p>
                        <p class="mt-1 text-xs font-semibold text-slate-500">
                          {{ formatPaymentMethod(historyPayment.payment_method, historyPayment.status) }}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
                <p v-else class="mt-4 text-sm text-slate-500">
                  Aún no hay pagos anteriores para construir un histórico útil.
                </p>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  data-onboarding="register-payment"
                  class="min-w-[140px] rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="selectedPayment.status === 'PAID' && Boolean(selectedPayment.payment_method)"
                  @click="openMarkPaidModal(selectedPayment)"
                >
                  {{ selectedPayment.status === 'PAID' ? 'Actualizar método' : 'Marcar como pagado' }}
                </button>
                <button
                  v-if="selectedPayment.status === 'PAID'"
                  type="button"
                  class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  @click="() => downloadReceipt(selectedPayment.id)"
                >
                  Generar recibo
                </button>
              </div>
            </article>

            <article
              v-else
              key="payment-empty-detail"
              class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/80 p-6 shadow-sm xl:min-h-[320px]"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Ficha del pago</p>
              <h3 class="mt-3 text-xl font-semibold text-slate-900">Selecciona un cobro para ver su detalle</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                La ficha mantiene el contexto visible mientras revisas el histórico y activas acciones rápidas.
              </p>
            </article>
          </transition>
        </aside>
      </section>

      <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="overflow-hidden rounded-[28px] border border-[#eadfd2] bg-white">
          <div class="hidden border-b border-[#efe7dd] bg-[#fbf8f2] px-4 py-3 md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(190px,1fr)_minmax(200px,auto)] md:items-center md:gap-4">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inquilino</p>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Apartamento</p>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Resumen</p>
            <p class="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Acciones</p>
          </div>
          <div v-if="groupedPayments.length" class="divide-y divide-[#efe7dd] bg-white">
            <div
              v-for="group in groupedPayments"
              :key="group.key"
              class="bg-white"
            >
              <div
                v-if="shouldShowGroupSummary(group.key)"
                class="border-b border-[#efe7dd] bg-[#f7f3ee] px-4 py-3"
              >
                <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ group.label }}</p>
                    <p class="text-xs text-slate-500">
                      Esperado {{ formatCurrency(group.totals.expected) }}, cobrado {{ formatCurrency(group.totals.collected) }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-3 text-[0.65rem] font-semibold text-slate-600">
                    <span>{{ computeProgress(group.totals.collected, group.totals.expected) }}% cobrado</span>
                    <span>Pendiente {{ formatCurrency(group.totals.pending) }}</span>
                    <span>Retrasado {{ formatCurrency(group.totals.late) }}</span>
                  </div>
                </div>
              </div>
              <div class="divide-y divide-[#efe7dd]">
                <PaymentRow
                  v-for="payment in group.items"
                  :key="payment.id"
                  :payment="payment"
                  :is-animating="animatingPaymentId === payment.id"
                  :selected="selectedPayment?.id === payment.id"
                  @mark-paid="openMarkPaidModal"
                  @view-detail="selectPayment"
                  @download-receipt="handleDownloadReceipt"
                />
              </div>
            </div>
          </div>
          <p v-if="!groupedPayments.length && !isLoading" class="p-6 text-center text-sm text-slate-500">
            No hay registros para los filtros actuales.
          </p>
          <p v-if="isLoading" class="p-6 text-center text-sm text-slate-500">Cargando pagos...</p>
        </div>
      </section>
    </template>

    <section
      v-else
      class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <EmptyPaymentsState
        eyebrow="Pagos"
        title="Todavía no hay pagos"
        description="Cuando registres pagos, aquí verás el resumen financiero."
        cta-label="Ir a inquilinos"
        cta-to="/tenants"
      />
    </section>

    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="fixed right-6 bottom-6 z-50 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur"
      >
        {{ toastMessage }}
      </div>
    </Transition>

    <Transition name="fade-scale">
      <div
        v-if="paymentToMarkPaid"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
        @click.self="closeMarkPaidModal"
      >
        <article class="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Método de cobro</p>
          <h3 class="mt-3 text-xl font-semibold text-slate-900">
            {{ paymentToMarkPaid.status === 'PAID' ? 'Actualizar método del pago' : 'Registrar cobro' }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ paymentToMarkPaid.tenant_persons?.full_name ?? 'Inquilino sin nombre' }} ·
            {{ formatCurrency(paymentToMarkPaid.amount ?? 0) }}
          </p>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="rounded-2xl border px-4 py-4 text-left transition"
              :class="paymentMethodDraft === 'BANK'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'"
              @click="paymentMethodDraft = 'BANK'"
            >
              <p class="text-sm font-semibold">Banco</p>
              <p class="mt-1 text-xs opacity-80">Transferencia, ingreso o domiciliación.</p>
            </button>
            <button
              type="button"
              class="rounded-2xl border px-4 py-4 text-left transition"
              :class="paymentMethodDraft === 'CASH'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'"
              @click="paymentMethodDraft = 'CASH'"
            >
              <p class="text-sm font-semibold">Efectivo</p>
              <p class="mt-1 text-xs opacity-80">Cobro presencial en metálico.</p>
            </button>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
              @click="closeMarkPaidModal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!paymentMethodDraft || isSavingPaymentMethod"
              @click="confirmMarkPaid"
            >
              {{ isSavingPaymentMethod ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>
        </article>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import apiClient from '../services/apiClient';
import EmptyPaymentsState from '../components/empty-states/EmptyPaymentsState.vue';
import PaymentFilters from '../components/PaymentFilters.vue';
import PaymentMetricCard from '../components/PaymentMetricCard.vue';
import PaymentRow from '../components/PaymentRow.vue';
import PaymentSummaryBar from '../components/PaymentSummaryBar.vue';
import PaymentStatusBadge from '../components/PaymentStatusBadge.vue';
import { useOnboarding } from '../composables/useOnboarding';
import { Payment, PaymentMethod, PaymentStatus } from '../types/payment';

type FilterState = PaymentStatus | 'ALL';
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const now = new Date();
const defaultMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const payments = ref<Payment[]>([]);
const isLoading = ref(false);
const toastMessage = ref('');
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const animatingPaymentId = ref<string | null>(null);
const selectedPayment = ref<Payment | null>(null);
const detailPanelRef = ref<HTMLElement | null>(null);
const lastLoadedAt = ref(new Date());
const paymentToMarkPaid = ref<Payment | null>(null);
const paymentMethodDraft = ref<PaymentMethod | null>(null);
const isSavingPaymentMethod = ref(false);
const { completeStep } = useOnboarding();

const filters = ref<{
  state: FilterState;
  apartment: string;
  month: string;
  query: string;
}>({
  state: 'PENDING',
  apartment: 'all',
  month: defaultMonthKey,
  query: ''
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
});

const formatCurrency = (value: number) => currencyFormatter.format(value ?? 0);
const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatPaymentMethod = (method?: PaymentMethod | null, status?: PaymentStatus) => {
  if (method === 'BANK') return 'Banco';
  if (method === 'CASH') return 'Efectivo';
  return status === 'PAID' ? 'No indicado' : 'Pendiente';
};

const createMonthKey = (year?: number, month?: number) => {
  if (!year || !month) return 'unknown';
  return `${year}-${String(month).padStart(2, '0')}`;
};

const formatMonthLabel = (key: string) => {
  if (key === 'unknown') return 'Mes sin asignar';
  const [yearPart, monthPart] = key.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!year || !month) return 'Mes sin asignar';
  return new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};

const computeProgress = (collected: number, expected: number) => {
  if (!expected) return 0;
  return Math.min(100, Math.round((collected / expected) * 100));
};

const shouldShowGroupSummary = (_key: string) => true;

const getDaysLate = (value?: string) => {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Math.ceil((Date.now() - date.getTime()) / MS_PER_DAY);
  return diff > 0 ? diff : 0;
};

const getDaysUntil = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / MS_PER_DAY);
};

const summaryMonthKey = computed(() => (filters.value.month === 'all' ? defaultMonthKey : filters.value.month));
const summaryMonthLabel = computed(() => formatMonthLabel(summaryMonthKey.value));

const summaryPayments = computed(() =>
  payments.value.filter((payment) => createMonthKey(payment.year, payment.month) === summaryMonthKey.value)
);

const summaryTotals = computed(() => {
  let expected = 0;
  let collected = 0;
  let pending = 0;
  let late = 0;
  summaryPayments.value.forEach((payment) => {
    const amount = Number(payment.amount ?? 0);
    expected += amount;
    if (payment.status === 'PAID') collected += amount;
    if (payment.status === 'PENDING') pending += amount;
    if (payment.status === 'LATE') late += amount;
  });
  return { expected, collected, pending, late };
});

const outstandingPending = computed(() => summaryTotals.value.pending + summaryTotals.value.late);

const metricCards = computed(() => [
  {
    label: 'Total esperado del mes',
    value: formatCurrency(summaryTotals.value.expected),
    subLabel: `Planificado ${summaryMonthLabel.value}`,
    accent: 'slate'
  },
  {
    label: 'Total cobrado',
    value: formatCurrency(summaryTotals.value.collected),
    subLabel: 'Cobros confirmados',
    accent: 'emerald'
  },
  {
    label: 'Total pendiente',
    value: formatCurrency(outstandingPending.value),
    subLabel: 'Cartera abierta',
    accent: 'amber'
  },
  {
    label: 'Total retrasado',
    value: formatCurrency(summaryTotals.value.late),
    subLabel: 'Prioridad roja',
    accent: 'rose'
  }
]);

const monthOptions = computed(() => {
  const options = new Map<string, string>();
  payments.value.forEach((payment) => {
    const key = createMonthKey(payment.year, payment.month);
    if (!options.has(key)) {
      options.set(key, formatMonthLabel(key));
    }
  });
  return Array.from(options.entries())
    .sort(([a], [b]) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return b.localeCompare(a);
    })
    .map(([value, label]) => ({ value, label }));
});

const apartmentOptions = computed(() => {
  const map = new Map<string, string>();
  payments.value.forEach((payment) => {
    const key = payment.units?.id ?? payment.units?.name ?? 'sin-apartado';
    const label = payment.units?.name ?? 'Sin apartamento asignado';
    if (!map.has(key)) {
      map.set(key, label);
    }
  });
  return Array.from(map.entries())
    .sort(([, labelA], [, labelB]) => labelA.localeCompare(labelB))
    .map(([value, label]) => ({ value, label }));
});

const filteredPayments = computed(() => {
  const normalizedSearch = filters.value.query.trim().toLowerCase();
  const matchesTenant = (payment: Payment) => {
    const tenant = (payment.tenant_persons?.full_name ?? '').toLowerCase();
    return !normalizedSearch || tenant.includes(normalizedSearch);
  };
  return payments.value
    .filter((payment) => {
      const stateMatch = (() => {
        if (filters.value.state === 'ALL') return true;
        if (filters.value.state === 'PENDING') {
          return payment.status === 'PENDING' || payment.status === 'LATE';
        }
        return payment.status === filters.value.state;
      })();
      const apartmentMatch = filters.value.apartment === 'all' || payment.units?.id === filters.value.apartment;
      const monthMatch = filters.value.month === 'all' || createMonthKey(payment.year, payment.month) === filters.value.month;
      return stateMatch && apartmentMatch && monthMatch && matchesTenant(payment);
    })
    .sort((a, b) => {
      const statusScore: Record<PaymentStatus, number> = { LATE: 0, PENDING: 1, PAID: 2 };
      if (statusScore[a.status] !== statusScore[b.status]) {
        return statusScore[a.status] - statusScore[b.status];
      }
      const dueA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const dueB = b.due_date ? new Date(b.due_date).getTime() : 0;
      return dueA - dueB;
    });
});

type PaymentGroup = {
  key: string;
  label: string;
  totals: {
    expected: number;
    collected: number;
    pending: number;
    late: number;
  };
  items: Payment[];
};

const groupedPayments = computed(() => {
  const groups = new Map<string, PaymentGroup>();
  filteredPayments.value.forEach((payment) => {
    const key = createMonthKey(payment.year, payment.month);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatMonthLabel(key),
        totals: { expected: 0, collected: 0, pending: 0, late: 0 },
        items: []
      });
    }
    const group = groups.get(key)!;
    const amount = Number(payment.amount ?? 0);
    group.totals.expected += amount;
    if (payment.status === 'PAID') group.totals.collected += amount;
    if (payment.status === 'PENDING') group.totals.pending += amount;
    if (payment.status === 'LATE') group.totals.late += amount;
    group.items.push(payment);
  });
  const sorted = Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
  sorted.forEach((group) => {
    group.items.sort((a, b) => {
      const statusOrder: Record<PaymentStatus, number> = { LATE: 0, PENDING: 1, PAID: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      const dueA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const dueB = b.due_date ? new Date(b.due_date).getTime() : 0;
      return dueA - dueB;
    });
  });
  return sorted;
});

const hasAnyPayments = computed(() => payments.value.length > 0);
const hasRegisteredPayment = computed(() =>
  payments.value.some((payment) => payment.status === 'PAID')
);

const loadPayments = async () => {
  isLoading.value = true;
  try {
    const { data } = await apiClient.get('/payments');
    payments.value = data ?? [];
    lastLoadedAt.value = new Date();
  } catch (error) {
    console.error(error);
    setToast('No se pudo cargar los pagos. Intenta nuevamente.');
  } finally {
    isLoading.value = false;
  }
};

const setToast = (message: string) => {
  toastMessage.value = message;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
  }, 2400);
};

const closeMarkPaidModal = (force = false) => {
  if (isSavingPaymentMethod.value && !force) return;
  paymentToMarkPaid.value = null;
  paymentMethodDraft.value = null;
};

const openMarkPaidModal = (payment: Payment) => {
  paymentToMarkPaid.value = payment;
  paymentMethodDraft.value = payment.payment_method ?? null;
};

const confirmMarkPaid = async () => {
  if (!paymentToMarkPaid.value || !paymentMethodDraft.value) return;
  const id = paymentToMarkPaid.value.id;
  animatingPaymentId.value = id;
  isSavingPaymentMethod.value = true;
  try {
    const { data } = await apiClient.patch(`/payments/${id}/pay`, {
      payment_method: paymentMethodDraft.value
    });
    const matchedIndex = payments.value.findIndex((payment) => payment.id === id);
    if (matchedIndex >= 0) {
      payments.value[matchedIndex] = {
        ...payments.value[matchedIndex],
        ...(data ?? {})
      };
    }
    closeMarkPaidModal(true);
    completeStep('paymentAdded');
    setToast('Pago actualizado correctamente.');
    if (selectedPayment.value?.id === id && matchedIndex >= 0) {
      selectedPayment.value = payments.value[matchedIndex];
    }
  } catch (error) {
    console.error(error);
    setToast('No fue posible registrar el pago.');
  } finally {
    isSavingPaymentMethod.value = false;
    setTimeout(() => {
      if (animatingPaymentId.value === id) animatingPaymentId.value = null;
    }, 500);
  }
};

const downloadReceipt = async (id: string) => {
  try {
    const response = await apiClient.post(`/documents/receipt/${id}`, {}, {
      responseType: 'blob'
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setToast('Recibo preparado para descarga.');
  } catch (error) {
    console.error(error);
    setToast('No se pudo generar el recibo.');
  }
};

const handleDownloadReceipt = (payment: Payment) => {
  if (payment.status !== 'PAID') {
    setToast('Solo se puede generar un recibo de pagos marcados como cobrados.');
    return;
  }
  downloadReceipt(payment.id);
};

const selectPayment = async (payment: Payment) => {
  selectedPayment.value = payment;
  await nextTick();
  if (window.innerWidth < 1280) {
    detailPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

watch(
  payments,
  () => {
    if (!selectedPayment.value) return;
    const match = payments.value.find((payment) => payment.id === selectedPayment.value?.id);
    if (match) {
      selectedPayment.value = match;
    } else {
      selectedPayment.value = null;
    }
  },
  { deep: true }
);

watch(
  hasRegisteredPayment,
  (value) => {
    if (value) completeStep('paymentAdded');
  },
  { immediate: true }
);

const updateStateFilter = (value: FilterState) => {
  filters.value.state = value;
};

const updateApartmentFilter = (value: string) => {
  filters.value.apartment = value;
};

const updateMonthFilter = (value: string) => {
  filters.value.month = value;
};

const updateSearchTerm = (value: string) => {
  filters.value.query = value;
};

const lastUpdatedLabel = computed(() =>
  lastLoadedAt.value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
);

const selectedDaysLate = computed(() => getDaysLate(selectedPayment.value?.due_date));
const selectedDaysUntilDue = computed(() => {
  const diff = getDaysUntil(selectedPayment.value?.due_date);
  if (diff === null) return 0;
  return diff >= 0 ? diff : 0;
});

const selectedTenantHistory = computed(() => {
  const tenantId = selectedPayment.value?.tenant_person_id ?? selectedPayment.value?.tenant_persons?.id;
  if (!tenantId) return [];

  return payments.value
    .filter((payment) => {
      const paymentTenantId = payment.tenant_person_id ?? payment.tenant_persons?.id;
      return paymentTenantId === tenantId;
    })
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.paid_date ?? a.due_date ?? '').getTime();
      const dateB = new Date(b.paid_date ?? b.due_date ?? '').getTime();
      return dateB - dateA;
    })
    .slice(0, 6);
});

const selectedHistorySummary = computed(() => {
  const summary = {
    paidCount: 0,
    paidAmount: 0,
    bankCount: 0,
    bankAmount: 0,
    cashCount: 0,
    cashAmount: 0
  };

  selectedTenantHistory.value.forEach((payment) => {
    const amount = Number(payment.amount ?? 0);
    if (payment.status === 'PAID') {
      summary.paidCount += 1;
      summary.paidAmount += amount;
    }
    if (payment.payment_method === 'BANK') {
      summary.bankCount += 1;
      summary.bankAmount += amount;
    }
    if (payment.payment_method === 'CASH') {
      summary.cashCount += 1;
      summary.cashAmount += amount;
    }
  });

  return summary;
});

onMounted(() => {
  loadPayments().catch((error) => console.error(error));
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.detail-slide-enter-from,
.detail-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
