<template>
  <article
    class="cursor-pointer px-4 py-4 transition-colors"
    :class="selected ? 'bg-[#fff8f3]' : 'bg-white hover:bg-[#fbf8f2]'"
    role="button"
    tabindex="0"
    @click="emit('detail', apartment)"
    @keydown.enter.prevent="emit('detail', apartment)"
    @keydown.space.prevent="emit('detail', apartment)"
  >
    <div class="grid gap-4 md:grid-cols-[minmax(0,1.75fr)_minmax(140px,0.6fr)_minmax(150px,0.65fr)_minmax(160px,auto)] md:items-center">
      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-[15px] font-semibold leading-5 text-slate-900">{{ apartment.name }}</p>
          <span
            v-if="selected"
            class="inline-flex items-center rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c4d29]"
          >
            Activo
          </span>
        </div>
        <p class="text-xs text-slate-400">
          {{ apartment.address || 'Dirección no registrada' }}
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inquilino</span>
          <p v-if="occupant" class="text-sm font-semibold text-slate-700">{{ occupant.full_name }}</p>
          <span v-else class="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            <svg class="h-2.5 w-2.5 text-slate-400" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="4" r="4" />
            </svg>
            Sin inquilino asignado
          </span>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Renta</p>
        <p class="mt-1 text-sm font-semibold leading-5 text-slate-900">{{ formatCurrency(apartment.monthly_rent) }} / mes</p>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
        <div class="mt-1">
          <StatusBadge :status="statusValue" />
        </div>
      </div>

      <div class="hidden md:flex md:flex-wrap md:justify-end md:gap-2">
        <div class="flex flex-wrap justify-end gap-2">
          <button
            class="inline-flex items-center justify-center rounded-full bg-[#1f4f46] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#173c36]"
            type="button"
            @click.stop="emit('edit', apartment)"
          >
            Editar
          </button>
          <button
            class="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            type="button"
            @click.stop="emit('delete', apartment)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#efe7dd] pt-3 md:hidden">
      <button
        class="inline-flex min-w-[104px] items-center justify-center rounded-full bg-[#1f4f46] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#173c36]"
        type="button"
        @click.stop="emit('edit', apartment)"
      >
        Editar
      </button>
      <button
        class="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
        type="button"
        @click.stop="emit('delete', apartment)"
      >
        Eliminar
      </button>
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
  selected?: boolean;
}>();
const emit = defineEmits<{
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
const selected = computed(() => Boolean(props.selected));
</script>
