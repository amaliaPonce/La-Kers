<template>
  <div class="flex h-full flex-col gap-2">
    <div v-if="!hasData" class="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">
      Sin datos históricos suficientes
    </div>
    <div v-else class="h-56 w-full">
      <svg
        viewBox="0 0 520 200"
        preserveAspectRatio="none"
        role="img"
        aria-label="Ingresos cobrados últimos seis meses"
        class="h-full w-full"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.3" />
            <stop offset="80%" stop-color="#0ea5e9" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          v-if="areaPath"
          :d="areaPath"
          :fill="`url(#${gradientId})`"
        />
        <path
          v-if="linePath"
          :d="linePath"
          stroke="#0ea5e9"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <circle
          v-for="point in points"
          :key="`point-${point.label}`"
          :cx="point.x"
          :cy="point.y"
          r="4"
          fill="#0ea5e9"
          stroke="#fff"
          stroke-width="2"
        />
      </svg>
      <div class="mt-3 grid grid-cols-6 gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
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
  }
});

const gradientId = `income-trend-${Math.random().toString(36).slice(2)}`;

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
