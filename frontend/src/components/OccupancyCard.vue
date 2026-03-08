<template>
  <article :class="cardClasses">
    <header class="flex flex-col gap-1">
      <p class="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Ocupación</p>
      <h3 class="text-2xl font-semibold text-slate-900">Control del edificio</h3>
      <p class="text-sm text-slate-500">Centro operativo para ver unidades listas, ocupadas y en riesgo.</p>
    </header>

    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Total unidades</p>
        <p class="text-3xl font-semibold text-slate-900">{{ totalUnitsLabel }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Ocupadas</p>
        <p class="text-3xl font-semibold text-emerald-600">{{ occupiedUnitsLabel }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Disponibles</p>
        <p class="text-3xl font-semibold text-amber-600">{{ availableUnitsLabel }}</p>
      </div>
    </div>

    <div class="mt-5 space-y-3">
      <div class="flex items-center justify-between text-sm font-semibold text-slate-500">
        <span>Porcentaje ocupación</span>
        <span class="text-base font-bold text-slate-900">{{ occupancyPercentLabel }}</span>
      </div>
      <div class="h-2.5 rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-emerald-500 transition-all duration-500"
          :style="{ width: `${progressWidth}%` }"
        ></div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  totalUnits: {
    type: Number,
    default: 0
  },
  occupiedUnits: {
    type: Number,
    default: 0
  },
  availableUnits: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const totalUnitsLabel = computed(() => (Number.isFinite(props.totalUnits) ? props.totalUnits : 0));
const occupiedUnitsLabel = computed(() => (Number.isFinite(props.occupiedUnits) ? props.occupiedUnits : 0));
const availableUnitsLabel = computed(() => (Number.isFinite(props.availableUnits) ? props.availableUnits : 0));

const occupancyPercent = computed(() => {
  if (!props.totalUnits) return 0;
  return Math.min(100, Math.round((props.occupiedUnits / props.totalUnits) * 100));
});

const occupancyPercentLabel = computed(() => `${occupancyPercent.value}%`);
const progressWidth = computed(() => occupancyPercent.value);

const cardClasses = computed(() => [
  'rounded-[32px] border border-slate-100 bg-white/90 px-6 py-6 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl',
  props.loading ? 'opacity-80' : ''
]);
</script>
