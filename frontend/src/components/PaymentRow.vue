<template>
  <article
    class="cursor-pointer"
    :class="[
      'px-4 py-4 transition-colors',
      isCritical ? 'bg-amber-50/70' : 'bg-white',
      isAnimating ? 'opacity-80' : '',
      !isCritical ? 'hover:bg-[#fbf8f2]' : ''
    ]"
    role="button"
    tabindex="0"
    @click="() => emit('view-detail', payment)"
    @keydown.enter.prevent="() => emit('view-detail', payment)"
    @keydown.space.prevent="() => emit('view-detail', payment)"
  >
    <div class="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(190px,1fr)_minmax(200px,auto)] md:items-center">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-[15px] font-semibold leading-5 text-slate-900">{{ tenantName }}</p>
          <span
            v-if="selected"
            class="inline-flex items-center rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c4d29]"
          >
            Activo
          </span>
        </div>
        <p class="mt-1 text-xs text-slate-400">{{ tenantHint }}</p>
      </div>

      <div class="min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">Apartamento</p>
        <p class="mt-1 text-sm font-semibold leading-5 text-slate-900 md:mt-0">{{ apartmentLabel }}</p>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Resumen</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ monthLabel }}</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ formattedAmount }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <PaymentStatusBadge :status="payment.status" />
          <p v-if="daysLateLabel" class="text-[0.65rem] font-semibold text-rose-500">
            {{ daysLateLabel }} días de retraso
          </p>
          <p v-else-if="isImminent" class="text-xs font-semibold text-amber-600">
            Vence en {{ daysUntilDueLabel }} días
          </p>
          <p v-else class="text-xs text-slate-400">
            Vence {{ dueLabel }}
          </p>
        </div>
      </div>

      <div class="hidden md:flex md:flex-wrap md:justify-end md:gap-2">
        <div class="flex flex-wrap justify-end gap-2">
          <button
            v-if="showMarkPaidAction"
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-[#1f4f46] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#173c36]"
            @click.stop="() => emit('mark-paid', payment)"
          >
            {{ payment.status === 'PAID' ? 'Añadir método' : 'Marcar como pagado' }}
          </button>
          <button
            v-if="payment.status === 'PAID'"
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-[#d9cdbc] bg-[#fbf8f2] px-3.5 py-2 text-[12px] font-semibold text-[#8c4d29] transition hover:bg-[#f6efe5]"
            @click.stop="() => emit('download-receipt', payment)"
          >
            Recibo
          </button>
        </div>
        <p v-if="paymentMethodLabel" class="text-xs text-slate-400">
          Método: {{ paymentMethodLabel }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#efe7dd] pt-3 md:hidden">
      <button
        v-if="showMarkPaidAction"
        type="button"
        class="inline-flex min-w-[140px] items-center justify-center rounded-full bg-[#1f4f46] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#173c36]"
        @click.stop="() => emit('mark-paid', payment)"
      >
        {{ payment.status === 'PAID' ? 'Añadir método' : 'Marcar como pagado' }}
      </button>
      <button
        v-if="payment.status === 'PAID'"
        type="button"
        class="inline-flex items-center justify-center rounded-full border border-[#d9cdbc] bg-[#fbf8f2] px-3.5 py-2 text-[12px] font-semibold text-[#8c4d29] transition hover:bg-[#f6efe5]"
        @click.stop="() => emit('download-receipt', payment)"
      >
        Recibo
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PaymentStatusBadge from './PaymentStatusBadge.vue';
import { Payment } from '../types/payment';

const props = defineProps<{
  payment: Payment;
  isAnimating?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  (event: 'mark-paid', payment: Payment): void;
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
const paymentMethodLabel = computed(() => {
  switch (props.payment.payment_method) {
    case 'BANK':
      return 'Banco';
    case 'CASH':
      return 'Efectivo';
    default:
      return props.payment.status === 'PAID' ? 'No indicado' : 'Pendiente';
  }
});

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
  return Math.ceil((dueDate.value.getTime() - Date.now()) / MS_PER_DAY);
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

const showMarkPaidAction = computed(() => props.payment.status !== 'PAID' || !props.payment.payment_method);
const selected = computed(() => Boolean(props.selected));
</script>
