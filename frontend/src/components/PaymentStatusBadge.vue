<template>
  <span
    class="inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold"
    :class="[sizeClass, statusStyle]"
  >
    <span class="h-2 w-2 rounded-full" :class="dotStyle"></span>
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

const props = defineProps<{ status: 'PAID' | 'PENDING' | 'LATE' }>();
const config = computed(() => statusMap[props.status] ?? statusMap.PENDING);
const label = computed(() => config.value.label);
const statusStyle = computed(() => `${config.value.style} border border-slate-100/60`);
const dotStyle = computed(() => config.value.dot);
const sizeClass = computed(() => (props.status === 'PENDING' ? 'text-sm' : 'text-[0.65rem]'));
</script>
