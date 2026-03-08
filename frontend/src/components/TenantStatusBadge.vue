<template>
  <span
    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
    :class="badgeClass"
  >
    <span class="h-2.5 w-2.5 rounded-full" :class="dotClass" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'ACTIVO' | 'PRÓXIMO A VENCER' | 'VENCIDO' | 'ARCHIVADO';
}>();

const statusMap: Record<
  'ACTIVO' | 'PRÓXIMO A VENCER' | 'VENCIDO' | 'ARCHIVADO',
  { label: string; badge: string; dot: string }
> = {
  ACTIVO: {
    label: 'Activo',
    badge: 'bg-emerald-50 text-emerald-700 shadow-inner shadow-emerald-50',
    dot: 'bg-emerald-500'
  },
  'PRÓXIMO A VENCER': {
    label: 'Próximo a vencer',
    badge: 'bg-amber-50 text-amber-700 shadow-inner shadow-amber-50',
    dot: 'bg-amber-500'
  },
  VENCIDO: {
    label: 'Vencido',
    badge: 'bg-rose-50 text-rose-700 shadow-inner shadow-rose-50',
    dot: 'bg-rose-500'
  }
  ,
  ARCHIVADO: {
    label: 'Archivado',
    badge: 'bg-slate-50 text-slate-500 shadow-inner shadow-slate-100',
    dot: 'bg-slate-600'
  }
};

const badgeClass = computed(() => statusMap[props.status]?.badge ?? 'bg-slate-100 text-slate-600');
const dotClass = computed(() => statusMap[props.status]?.dot ?? 'bg-slate-400');
const label = computed(() => statusMap[props.status]?.label ?? 'Estado');
</script>
