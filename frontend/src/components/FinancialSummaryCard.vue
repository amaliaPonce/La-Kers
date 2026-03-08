<template>
  <article
    :class="[
      'rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl'
    ]"
  >
    <header class="flex flex-col gap-1">
      <p class="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Rentabilidad</p>
      <h3 class="text-3xl font-semibold text-slate-900">Resumen mensual</h3>
      <p class="text-sm text-slate-500">
        Conecta ingresos, ocupación y gastos imprevistos en un solo gráfico de negocio.
      </p>
    </header>

    <div class="mt-6">
      <template v-if="loading">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="slot in 4"
              :key="`loading-stat-${slot}`"
              class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm animate-pulse"
            >
              <div class="h-4 w-2/3 rounded-full bg-slate-200"></div>
              <div class="mt-3 h-6 w-full rounded-full bg-slate-200"></div>
            </div>
          </div>
          <div class="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm animate-pulse">
            <div class="h-3 w-1/2 rounded-full bg-slate-200"></div>
            <div class="mt-5 grid grid-cols-2 gap-4">
              <div v-for="slot in 4" :key="`loading-bar-${slot}`" class="flex flex-col items-center gap-3">
                <div class="h-32 w-10 rounded-full bg-slate-200/70"></div>
                <div class="h-3 w-3/4 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div class="space-y-4">
            <div
              v-for="stat in stats"
              :key="stat.id"
              class="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm"
            >
              <div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-400">{{ stat.title }}</p>
                  <p v-if="stat.label" class="text-xs text-slate-500">{{ stat.label }}</p>
                </div>
                <p class="text-3xl font-semibold" :class="toneClasses(stat.tone).text">
                  {{ formatValue(stat.value) }}
                </p>
              </div>
              <div class="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-slate-400">
                <span>Participación</span>
                <span>{{ statShare(stat) }}%</span>
              </div>
              <div class="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="toneClasses(stat.tone).bar"
                  :style="{ width: `${statShare(stat)}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-xl">
            <div class="flex flex-col gap-1">
              <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Estadística</p>
              <h4 class="text-xl font-semibold text-slate-900">Balance del mes</h4>
              <p class="text-sm text-slate-500">
                Mantén una visión proporcional entre objetivos, ocupación activa e impactos inesperados.
              </p>
            </div>
            <div class="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div class="flex items-baseline justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Beneficio neto estimado</p>
                  <p class="text-lg font-semibold" :class="toneClasses(netStatTone).text">
                    {{ formatValue(netProfit) }}
                  </p>
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Ingresos - gastos</p>
                </div>
              </div>
            </div>
            <div class="mt-5 space-y-5">
              <div
                v-for="highlight in highlightItems"
                :key="highlight.id"
                class="space-y-2"
              >
                <div class="flex items-end justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ highlight.label }}</p>
                    <p class="text-xs text-slate-500">{{ highlight.detail }}</p>
                  </div>
                  <p class="text-lg font-semibold text-slate-900">{{ highlight.display }}</p>
                </div>
                <div class="h-2 w-full rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="highlight.progressTone"
                    :style="{ width: `${highlight.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';

type SummaryTone = 'neutral' | 'success' | 'warning' | 'danger';

type FinancialStat = {
  id: string;
  title: string;
  value: number;
  label?: string;
  shortLabel?: string;
  tone?: SummaryTone;
};

type FinancialHighlight = {
  id: string;
  label: string;
  detail: string;
  display: string;
  progress: number;
  progressTone: string;
};

const props = defineProps({
  stats: {
    type: Array as PropType<FinancialStat[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  formatter: {
    type: Function as PropType<(value: number) => string>,
    default: undefined
  },
  highlights: {
    type: Array as PropType<FinancialHighlight[]>,
    default: () => []
  },
  netProfit: {
    type: Number,
    default: 0
  }
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatValue = (value: number) => {
  if (props.formatter) {
    return props.formatter(value);
  }
  return currencyFormatter.format(value);
};

const graphMax = computed(() => {
  if (!props.stats.length) return 1;
  return Math.max(1, ...props.stats.map((stat) => Math.abs(stat.value)));
});

const statShare = (stat: FinancialStat) => {
  if (!graphMax.value) return 0;
  const magnitude = Math.abs(stat.value);
  return Math.min(100, Math.max(0, Math.round((magnitude / graphMax.value) * 100)));
};

const toneClasses = (tone: SummaryTone | undefined) => {
  switch (tone) {
    case 'success':
      return { text: 'text-emerald-600', bar: 'bg-emerald-500' };
    case 'warning':
      return { text: 'text-amber-600', bar: 'bg-amber-500' };
    case 'danger':
      return { text: 'text-rose-600', bar: 'bg-rose-500' };
    default:
      return { text: 'text-slate-900', bar: 'bg-slate-500/70' };
  }
};

const netStatTone = computed<SummaryTone | undefined>(() => {
  const netStat = props.stats.find((stat) => stat.id === 'net');
  return netStat?.tone;
});

const highlightItems = computed(() => props.highlights);
</script>
