<template>
  <span
    class="inline-flex items-center rounded-full font-semibold uppercase tracking-wide"
    :class="[compact ? 'gap-1.5 px-2.5 py-0.5 text-[10px]' : 'gap-2 px-3 py-1 text-xs', badgeClass]"
  >
    <span class="rounded-full" :class="[compact ? 'h-2 w-2' : 'h-2.5 w-2.5', dotClass]" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ status: string; compact?: boolean }>(), {
  compact: false
});

const compact = computed(() => props.compact);

const statusMap: Record<string, { label: string; badge: string; dot: string }> = {
  AVAILABLE: {
    label: 'Disponible',
    badge: 'bg-emerald-50 text-emerald-700 shadow-inner shadow-emerald-50',
    dot: 'bg-emerald-500'
  },
  OCCUPIED: {
    label: 'Ocupado',
    badge: 'bg-rose-50 text-rose-700 shadow-inner shadow-rose-50',
    dot: 'bg-rose-500'
  },
  RESERVED: {
    label: 'Reservado',
    badge: 'bg-amber-50 text-amber-700 shadow-inner shadow-amber-50',
    dot: 'bg-amber-500'
  }
};

const badgeClass = computed(() => statusMap[props.status]?.badge ?? 'bg-slate-100 text-slate-600');
const dotClass = computed(() => statusMap[props.status]?.dot ?? 'bg-slate-400');
const label = computed(() => statusMap[props.status]?.label ?? 'Estado');
</script>
