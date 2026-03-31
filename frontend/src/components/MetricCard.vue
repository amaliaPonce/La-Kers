<template>
  <article :class="cardClasses">
    <div v-if="!flat" class="absolute inset-x-0 top-0 h-24 rounded-t-[32px] opacity-80" :class="surfaceGlowClass"></div>

    <div class="relative">
      <div :class="labelClasses">
        <span>{{ label }}</span>
      </div>
      <p class="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
        {{ displayValue }}
      </p>
      <p v-if="subtext" class="mt-1 text-sm text-slate-500">{{ subtext }}</p>
      <div
        v-if="helper || showRetrasoBadge"
        class="mt-4 flex flex-wrap items-center gap-2"
      >
        <span
          v-if="helper"
          :class="helperClasses"
        >
          {{ helper }}
        </span>
        <span
          v-if="showRetrasoBadge"
          class="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm"
        >
          Riesgo activo
        </span>
      </div>
    </div>

    <div class="relative mt-6 flex items-center justify-between text-sm">
      <p class="text-sm font-semibold text-slate-400">
        {{ indicatorLabel }}
      </p>
      <div class="flex items-center gap-2">
        <span :class="indicatorTextClass">{{ indicatorDisplay }}</span>
      </div>
    </div>

    <div class="relative mt-3 h-2 w-full overflow-hidden rounded-full" :class="trackClasses">
      <div
        class="absolute inset-y-0 left-0 h-full rounded-full transition-all duration-500"
        :class="indicatorBarClass"
        :style="{ width: `${indicatorWidth}%` }"
      ></div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number as PropType<number | null | undefined>,
    default: null
  },
  subtext: {
    type: String,
    default: ''
  },
  helper: {
    type: String,
    default: ''
  },
  percentage: {
    type: Number as PropType<number | null | undefined>,
    default: null
  },
  indicatorLabel: {
    type: String,
    default: 'Del objetivo'
  },
  tone: {
    type: String as PropType<'neutral' | 'success' | 'warning' | 'danger'>,
    default: 'neutral'
  },
  icon: {
    type: String,
    default: 'dashboard'
  },
  flat: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  formatter: {
    type: Function as PropType<(value: number) => string>,
    default: undefined
  }
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatValue = (value: number) => {
  if (props.formatter) {
    return props.formatter(value);
  }
  return currencyFormatter.format(value);
};

const sanitizedValue = computed(() => {
  if (props.value === null || props.value === undefined || Number.isNaN(props.value)) {
    return null;
  }
  return props.value;
});

const displayValue = computed(() => {
  if (props.loading || sanitizedValue.value === null) {
    return '—';
  }
  return formatValue(sanitizedValue.value);
});

const sanitizedPercentage = computed(() => {
  if (props.percentage === null || props.percentage === undefined || Number.isNaN(props.percentage)) {
    return null;
  }
  return Math.max(0, Math.min(props.percentage, 999));
});

const indicatorDisplay = computed(() => {
  if (sanitizedPercentage.value === null) return '—';
  return `${Math.round(sanitizedPercentage.value)}%`;
});

const indicatorWidth = computed(() => {
  if (sanitizedPercentage.value === null) return 0;
  return Math.min(Math.max(sanitizedPercentage.value, 0), 100);
});

const tonePalette = computed(() => {
  switch (props.tone) {
    case 'success':
      return {
        border: 'border-[#d5e4dd]',
        surface: 'bg-[linear-gradient(180deg,_rgba(231,245,239,0.96),_rgba(255,255,255,0.88))]',
        text: 'text-[#1f4f46]',
        bar: 'bg-[#1f4f46]',
        glow: 'bg-[radial-gradient(circle_at_top,_rgba(31,79,70,0.12),_transparent_72%)]',
        iconBadge: 'bg-[#1f4f46] text-white'
      };
    case 'warning':
      return {
        border: 'border-[#ead8ca]',
        surface: 'bg-[linear-gradient(180deg,_rgba(255,247,241,0.98),_rgba(255,255,255,0.9))]',
        text: 'text-[#8c4d29]',
        bar: 'bg-[#c96a37]',
        glow: 'bg-[radial-gradient(circle_at_top,_rgba(201,106,55,0.15),_transparent_72%)]',
        iconBadge: 'bg-[#fff1e7] text-[#8c4d29]'
      };
    case 'danger':
      return {
        border: 'border-rose-200',
        surface: 'bg-[linear-gradient(180deg,_rgba(255,241,242,0.98),_rgba(255,255,255,0.9))]',
        text: 'text-rose-600',
        bar: 'bg-rose-500',
        glow: 'bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.14),_transparent_72%)]',
        iconBadge: 'bg-rose-500 text-white'
      };
    default:
      return {
        border: 'border-[#e5ddd3]',
        surface: 'bg-[linear-gradient(180deg,_rgba(250,247,242,0.98),_rgba(255,255,255,0.9))]',
        text: 'text-slate-700',
        bar: 'bg-slate-500/80',
        glow: 'bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_72%)]',
        iconBadge: 'bg-slate-900 text-white'
      };
  }
});

const cardClasses = computed(() => [
  props.flat
    ? 'relative flex flex-col rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm'
    : 'relative flex flex-col rounded-[32px] border px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]',
  props.flat ? '' : tonePalette.value.border,
  props.flat ? '' : tonePalette.value.surface,
  props.loading ? 'opacity-80' : ''
]);

const surfaceGlowClass = computed(() => tonePalette.value.glow);
const labelClasses = computed(() =>
  props.flat
    ? 'inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500'
    : 'inline-flex rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm'
);
const helperClasses = computed(() =>
  props.flat
    ? 'inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600'
    : 'inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm'
);
const trackClasses = computed(() => (props.flat ? 'bg-slate-100' : 'bg-white/80'));
const indicatorTextClass = computed(() => `text-sm font-semibold ${tonePalette.value.text}`);
const indicatorBarClass = computed(() => tonePalette.value.bar);
const showRetrasoBadge = computed(() => props.tone === 'danger' && sanitizedPercentage.value !== null && sanitizedPercentage.value > 0);
</script>
