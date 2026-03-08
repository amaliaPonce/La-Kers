<template>
  <article class="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="flex-1 space-y-2">
        <div class="flex flex-wrap gap-2 items-center">
          <p class="text-lg font-semibold text-slate-900">{{ apartment.name }}</p>
          <StatusBadge :status="statusValue" />
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-slate-500">
          <span class="inline-flex items-center gap-1">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 8c-3 0-5 1.5-5 4h10c0-2.5-2-4-5-4z" />
              <path d="M11 12v6m2-6v6" />
            </svg>
            {{ formatCurrency(apartment.monthly_rent) }} / mes
          </span>
          <span v-if="occupant" class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            <span class="text-slate-700">Inquilino:</span>
            <span class="text-emerald-700">{{ occupant.full_name }}</span>
          </span>
          <span v-else class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            <svg class="h-3 w-3 text-slate-400" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="4" r="4" />
            </svg>
            Sin inquilino asignado
          </span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
        <button
          class="rounded-full border border-slate-200 px-3 py-1 transition hover:border-primary hover:text-primary"
          type="button"
          @click="$emit('detail', apartment)"
        >
          Detalle
        </button>
        <button
          class="rounded-full border border-slate-200 px-3 py-1 transition hover:border-primary hover:text-primary"
          type="button"
          @click="$emit('edit', apartment)"
        >
          Editar
        </button>
        <button
          class="rounded-full border border-rose-100 px-3 py-1 text-rose-600 transition hover:bg-rose-50"
          type="button"
          @click="$emit('delete', apartment)"
        >
          Eliminar
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  apartment: Record<string, unknown>;
  occupant?: Record<string, unknown> | null;
  derivedStatus?: string;
}>();
defineEmits<{
  (e: 'detail', apartment: Record<string, unknown>): void;
  (e: 'edit', apartment: Record<string, unknown>): void;
  (e: 'delete', apartment: Record<string, unknown>): void;
}>();

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatCurrency = (value: unknown) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return currencyFormatter.format(0);
  return currencyFormatter.format(amount);
};

const occupant = computed(() => props.occupant ?? null);
const statusValue = computed(() => props.derivedStatus ?? (props.apartment.status as string));
</script>
