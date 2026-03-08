<template>
  <tr
    :class="[
      'transition-colors hover:bg-slate-50 focus-within:bg-slate-50 odd:bg-slate-50 even:bg-white',
      isCritical ? 'ring-1 ring-amber-200 bg-amber-50/70' : '',
      isAnimating ? 'opacity-80' : ''
    ]"
  >
    <td class="px-3 py-4 align-top">
      <p class="text-sm font-semibold text-slate-900">{{ tenantName }}</p>
      <p class="text-xs text-slate-500">{{ tenantHint }}</p>
    </td>
    <td class="px-3 py-4 align-top text-sm text-slate-600">{{ apartmentLabel }}</td>
    <td class="px-3 py-4 align-top text-sm font-semibold text-slate-900">{{ monthLabel }}</td>
    <td class="px-3 py-4 align-top text-sm text-slate-900">{{ formattedAmount }}</td>
    <td class="px-3 py-4 align-top space-y-1">
      <PaymentStatusBadge :status="payment.status" />
      <p v-if="daysLateLabel" class="text-[0.65rem] font-semibold text-rose-500">
        {{ daysLateLabel }} días de retraso
      </p>
      <p v-else-if="isImminent" class="text-xs font-semibold text-amber-600">
        Vence en {{ daysUntilDueLabel }} días
      </p>
    </td>
      <td class="px-3 py-4 align-top text-sm text-slate-600">{{ dueLabel }}</td>
    <td class="px-3 py-4 align-top space-y-2">
      <div class="space-y-2">
        <button
          v-if="payment.status !== 'PAID'"
          type="button"
          class="w-full rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click="() => emit('mark-paid', payment.id)"
        >
          Marcar como pagado
        </button>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
            @click="() => emit('view-detail', payment)"
          >
            Detalle
          </button>
          <button
            v-if="payment.status === 'PAID'"
            type="button"
            class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
            @click="() => emit('download-receipt', payment)"
          >
            Recibo
          </button>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PaymentStatusBadge from './PaymentStatusBadge.vue';
import { Payment } from '../types/payment';

const props = defineProps<{
  payment: Payment;
  isAnimating?: boolean;
}>();

const emit = defineEmits<{
  (event: 'mark-paid', id: string): void;
  (event: 'view-detail', payment: Payment): void;
  (event: 'download-receipt', payment: Payment): void;
}>();

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
});

const tenantName = computed(() => props.payment.tenant_persons?.full_name ?? '—');
const tenantHint = computed(() => {
  const id = props.payment.tenant_persons?.id;
  return id ? `ID ${id.slice(0, 6)}` : 'Información mínima';
});

const apartmentLabel = computed(() => props.payment.units?.name ?? 'Sin apartamento');

const monthLabel = computed(() => {
  const year = props.payment.year;
  const month = props.payment.month;
  if (!year || !month) return 'Mes sin asignar';
  return new Date(year, month - 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
});

const formattedAmount = computed(() => currencyFormatter.format(props.payment.amount ?? 0));

const dueDate = computed(() => {
  if (!props.payment.due_date) return null;
  const date = new Date(props.payment.due_date);
  return Number.isNaN(date.getTime()) ? null : date;
});

const dueLabel = computed(() => {
  if (!dueDate.value) return '—';
  return dueDate.value.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysLate = computed(() => {
  if (!dueDate.value) return 0;
  const diff = Math.ceil((Date.now() - dueDate.value.getTime()) / MS_PER_DAY);
  return diff > 0 ? diff : 0;
});

const daysUntilDue = computed(() => {
  if (!dueDate.value) return Infinity;
  const diff = Math.ceil((dueDate.value.getTime() - Date.now()) / MS_PER_DAY);
  return diff;
});

const daysLateLabel = computed(() => (daysLate.value ? daysLate.value.toString() : null));
const daysUntilDueLabel = computed(() => (daysUntilDue.value > 0 ? daysUntilDue.value.toString() : '0'));
const isImminent = computed(() => props.payment.status !== 'PAID' && daysUntilDue.value <= 2 && daysLate.value === 0);

const isCritical = computed(() => {
  if (props.payment.status === 'LATE') return true;
  if (daysLate.value > 0) return true;
  if (props.payment.status !== 'PAID' && daysUntilDue.value <= 2) return true;
  if ((props.payment.amount ?? 0) >= 3000) return true;
  return false;
});
</script>
