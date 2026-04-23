<template>
  <span
    class="inline-flex items-center rounded-full font-semibold"
    :class="[sizeClass, statusStyle]"
  >
    <span class="rounded-full" :class="[compact ? 'h-1.5 w-1.5' : 'h-2 w-2', dotStyle]"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type BadgeConfig = {
  label: string;
  style: string;
  dot: string;
};

const statusMap: Record<'PAID' | 'PENDING' | 'LATE', BadgeConfig> = {
  PAID: {
    label: 'Pagado',
    style: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500'
  },
  PENDING: {
    label: 'Pendiente',
    style: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500'
  },
  LATE: {
    label: 'Retrasado',
    style: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500'
  }
};

const props = withDefaults(defineProps<{ status: 'PAID' | 'PENDING' | 'LATE'; compact?: boolean }>(), {
  compact: false
});
const config = computed(() => statusMap[props.status] ?? statusMap.PENDING);
const label = computed(() => config.value.label);
const statusStyle = computed(() => `${config.value.style} border border-slate-100/60`);
const dotStyle = computed(() => config.value.dot);
const sizeClass = computed(() => {
  if (props.compact) return 'gap-1.5 px-2.5 py-0.5 text-[10px]';
  return props.status === 'PENDING' ? 'gap-2 text-sm' : 'gap-2 text-[0.65rem]';
});
</script>
