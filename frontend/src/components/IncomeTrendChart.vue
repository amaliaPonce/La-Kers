<template>
  <div class="flex h-full flex-col gap-2">
    <div v-if="!hasData" class="flex h-56 items-center justify-center rounded-[28px] border border-dashed border-[#dfd6cc] bg-[#faf7f2] text-sm font-semibold text-slate-400">
      {{ emptyLabel }}
    </div>
    <div v-else :class="containerClasses">
      <svg
        viewBox="0 0 520 200"
        preserveAspectRatio="none"
        role="img"
        :aria-label="ariaLabel"
        class="h-full w-full"
      >
        <defs v-if="!flat">
          <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#1f4f46" stop-opacity="0.26" />
            <stop offset="85%" stop-color="#1f4f46" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 32 168 H 488"
          stroke="#e8ddd1"
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round"
        />
        <path
          v-if="areaPath && !flat"
          :d="areaPath"
          :fill="`url(#${gradientId})`"
        />
        <path
          v-if="linePath"
          :d="linePath"
          stroke="#1f4f46"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <circle
          v-for="point in points"
          :key="`point-${point.label}`"
          :cx="point.x"
          :cy="point.y"
          r="5"
          fill="#c96a37"
          stroke="#fff"
          stroke-width="2"
        />
      </svg>
      <div class="mt-3 grid grid-cols-6 gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
        <span v-for="point in points" :key="`label-${point.label}`">{{ point.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  data: {
    type: Array as PropType<Array<{ label: string; value: number }>>,
    default: () => []
  },
  ariaLabel: {
    type: String,
    default: 'Ingresos cobrados últimos seis meses'
  },
  emptyLabel: {
    type: String,
    default: 'Sin datos históricos suficientes'
  },
  flat: {
    type: Boolean,
    default: false
  }
});

const gradientId = `income-trend-${Math.random().toString(36).slice(2)}`;
const containerClasses = computed(() =>
  props.flat
    ? 'h-56 w-full rounded-[24px] border border-slate-200 bg-white p-4'
    : 'h-56 w-full rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(244,239,232,0.82))] p-4 shadow-sm'
);

const maxValue = computed(() => {
  if (!props.data.length) return 1;
  const values = props.data.map((item) => (Number.isFinite(item.value) ? item.value : 0));
  const highest = Math.max(...values, 0);
  return highest > 0 ? highest : 1;
});

const spacing = 520 - 64;
const chartHeight = 200;
const padding = 32;

const points = computed(() => {
  if (!props.data.length) return [];
  const step = props.data.length > 1 ? spacing / (props.data.length - 1) : 0;
  return props.data.map((item, index) => {
    const safeValue = Number.isFinite(item.value) ? Math.max(item.value, 0) : 0;
    const normalized = safeValue / maxValue.value;
    const x = padding + step * index;
    const y = chartHeight - padding - normalized * (chartHeight - padding * 2);
    return { x, y, label: item.label, value: safeValue };
  });
});

const areaPath = computed(() => {
  if (!points.value.length) return '';
  const baseY = chartHeight - padding;
  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  const segments = [
    `M ${first.x} ${baseY}`,
    `L ${first.x} ${first.y}`,
    ...points.value.slice(1).map((point) => `L ${point.x} ${point.y}`),
    `L ${last.x} ${baseY}`,
    'Z'
  ];
  return segments.join(' ');
});

const linePath = computed(() => {
  if (!points.value.length) return '';
  return points.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
});

const hasData = computed(() => props.data.length > 0);
</script>
