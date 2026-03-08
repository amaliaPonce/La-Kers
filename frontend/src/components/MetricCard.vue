<template>
  <article :class="cardClasses">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-500">
          {{ label }}
        </p>
        <p class="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          {{ displayValue }}
        </p>
        <p v-if="subtext" class="mt-1 text-sm text-slate-500">{{ subtext }}</p>
      </div>
      <span
        v-if="showRetrasoBadge"
        class="flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm"
      >
        <span class="h-2 w-2 rounded-full bg-rose-500"></span>
        Retrasos
      </span>
    </div>

    <div class="mt-6 flex items-center justify-between text-sm">
      <p class="text-sm font-semibold text-slate-400">
        {{ indicatorLabel }}
      </p>
      <div class="flex items-center gap-2">
        <span :class="indicatorTextClass">{{ indicatorDisplay }}</span>
      </div>
    </div>

    <div class="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100/80">
      <div
        class="absolute inset-y-0 left-0 h-full rounded-full transition-all duration-500"
        :class="indicatorBarClass"
        :style="{ width: `${indicatorWidth}%` }"
      ></div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
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

const animatedValue = ref<number>(sanitizedValue.value ?? 0);
let frameId: number | null = null;

const cancelAnimation = () => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
};

const animateTo = (target: number) => {
  cancelAnimation();
  const startValue = animatedValue.value;
  const delta = target - startValue;
  const duration = 650;
  const startTime = performance.now();

  const step = (timestamp: number) => {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    animatedValue.value = startValue + delta * eased;
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      animatedValue.value = target;
    }
  };

  frameId = requestAnimationFrame(step);
};

watch(
  sanitizedValue,
  (next) => {
    if (next === null) {
      cancelAnimation();
      animatedValue.value = 0;
      return;
    }
    animateTo(next);
  },
  { immediate: true }
);

const displayValue = computed(() => {
  if (props.loading || sanitizedValue.value === null) {
    return '—';
  }
  return formatValue(animatedValue.value);
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
        border: 'border-emerald-100',
        text: 'text-emerald-600',
        bar: 'bg-emerald-500'
      };
    case 'warning':
      return {
        border: 'border-amber-100',
        text: 'text-amber-600',
        bar: 'bg-amber-500'
      };
    case 'danger':
      return {
        border: 'border-rose-100',
        text: 'text-rose-600',
        bar: 'bg-rose-500'
      };
    default:
      return {
        border: 'border-slate-200',
        text: 'text-slate-600',
        bar: 'bg-slate-500/80'
      };
  }
});

const cardClasses = computed(() => [
  'relative flex flex-col gap-2 rounded-[32px] border bg-white/90 px-6 py-6 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl',
  tonePalette.value.border,
  props.loading ? 'opacity-80' : ''
]);

const indicatorTextClass = computed(() => `text-sm font-semibold ${tonePalette.value.text}`);
const indicatorBarClass = computed(() => tonePalette.value.bar);
const showRetrasoBadge = computed(() => props.tone === 'danger' && sanitizedPercentage.value !== null && sanitizedPercentage.value > 0);

onBeforeUnmount(() => cancelAnimation());
</script>
