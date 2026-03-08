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

    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-5">
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
      <div class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-900">Detalle del pago</p>
          <button
            v-if="selectedPayment"
            type="button"
            class="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            @click="selectedPayment = null"
          >
            Cerrar
          </button>
        </div>
        <div v-if="selectedPayment" class="mt-4 space-y-4 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ selectedPayment.tenant_persons?.full_name ?? '—' }}</p>
              <p class="text-xs font-semibold text-slate-400">
                {{ formatMonthLabel(createMonthKey(selectedPayment.year, selectedPayment.month)) }}
              </p>
            </div>
            <PaymentStatusBadge :status="selectedPayment.status" />
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div>
              <p class="text-xs font-semibold text-slate-500">Apartamento</p>
              <p class="text-base font-semibold text-slate-900">{{ selectedPayment.units?.name ?? 'Sin asignar' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500">Vencimiento</p>
              <p class="text-base font-semibold text-slate-900">{{ formatDate(selectedPayment.due_date) }}</p>
            </div>
          </div>
          <div class="border-t border-dashed border-slate-200 pt-4">
            <div class="grid gap-3 text-sm md:grid-cols-2">
              <div>
              <p class="text-xs font-semibold text-slate-500">Monto</p>
                <p class="text-2xl font-semibold text-slate-900">{{ formatCurrency(selectedPayment.amount ?? 0) }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-500">Estado de mora</p>
                <p
                  class="text-sm font-semibold"
                  :class="{
                    'text-rose-600': selectedDaysLate > 0,
                    'text-amber-600': !selectedDaysLate && selectedDaysUntilDue <= 3
                  }"
                >
                  <span v-if="selectedDaysLate > 0" class="text-[0.65rem] font-semibold">{{ selectedDaysLate }} días de retraso</span>
                  <span v-else>Vence en {{ selectedDaysUntilDue }} días</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 pt-3 text-xs text-slate-500">
            <p>Mes {{ formatMonthLabel(createMonthKey(selectedPayment.year, selectedPayment.month)) }}</p>
            <p>Días de retraso {{ selectedDaysLate }}</p>
            <p>Última actualización {{ lastUpdatedLabel }}</p>
          </div>
          <div class="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              class="flex-1 min-w-[140px] rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="selectedPayment.status === 'PAID'"
              @click="() => markPaid(selectedPayment.id)"
            >
              Marcar como pagado
            </button>
            <button
              v-if="selectedPayment.status === 'PAID'"
              type="button"
              class="flex-1 min-w-[140px] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
              @click="() => downloadReceipt(selectedPayment.id)"
            >
              Generar recibo
            </button>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-slate-500">
          Selecciona un pago para abrir su ficha rápida y activar acciones inmediatas.
        </p>
      </div>
    </section>

    <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div class="overflow-hidden rounded-2xl border border-slate-100">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-sm font-semibold text-slate-500">
            <tr>
              <th class="px-3 py-3">Inquilino</th>
              <th class="px-3 py-3">Apartamento</th>
              <th class="px-3 py-3">Mes</th>
              <th class="px-3 py-3">Importe</th>
              <th class="px-3 py-3">Estado</th>
              <th class="px-3 py-3">Fecha venc.</th>
              <th class="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <template v-if="groupedPayments.length">
            <tbody
              v-for="group in groupedPayments"
              :key="group.key"
              class="divide-y divide-slate-100 bg-white"
            >
              <tr
                v-if="shouldShowGroupSummary(group.key)"
                class="bg-slate-100 text-xs font-semibold text-slate-500"
              >
                <td class="px-3 py-3" colspan="7">
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
                </td>
              </tr>
              <PaymentRow
                v-for="payment in group.items"
                :key="payment.id"
                :payment="payment"
                :is-animating="animatingPaymentId === payment.id"
                @mark-paid="markPaid"
                @view-detail="selectPayment"
                @download-receipt="handleDownloadReceipt"
              />
            </tbody>
          </template>
        </table>
        <p v-if="!groupedPayments.length && !isLoading" class="p-6 text-center text-sm text-slate-500">
          No hay registros para los filtros actuales.
        </p>
        <p v-if="isLoading" class="p-6 text-center text-sm text-slate-500">Cargando pagos...</p>
      </div>
    </section>

    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="fixed right-6 bottom-6 z-50 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import apiClient from '../services/apiClient';
import PaymentFilters from '../components/PaymentFilters.vue';
import PaymentMetricCard from '../components/PaymentMetricCard.vue';
import PaymentRow from '../components/PaymentRow.vue';
import PaymentSummaryBar from '../components/PaymentSummaryBar.vue';
import PaymentStatusBadge from '../components/PaymentStatusBadge.vue';
import { Payment, PaymentStatus } from '../types/payment';

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
const lastLoadedAt = ref(new Date());

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

const hiddenGroupSummaryKeys = new Set(['2026-03']);
const shouldShowGroupSummary = (key: string) => !hiddenGroupSummaryKeys.has(key);

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

const markPaid = async (id: string) => {
  animatingPaymentId.value = id;
  try {
    await apiClient.patch(`/payments/${id}/pay`);
    const matched = payments.value.find((payment) => payment.id === id);
    if (matched) {
      matched.status = 'PAID';
      matched.paid_date = new Date().toISOString();
    }
    setToast('Pago marcado como cobrado.');
    if (selectedPayment.value?.id === id && matched) {
      selectedPayment.value = matched;
    }
  } catch (error) {
    console.error(error);
    setToast('No fue posible registrar el pago.');
  } finally {
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

const selectPayment = (payment: Payment) => {
  selectedPayment.value = payment;
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
</style>
