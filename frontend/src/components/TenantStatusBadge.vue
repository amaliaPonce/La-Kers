<template>
  <span
    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
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
    badge: 'bg-[#edf6f2] text-[#1f4f46]',
    dot: 'bg-[#2ab27b]'
  },
  'PRÓXIMO A VENCER': {
    label: 'Próximo a vencer',
    badge: 'bg-[#fff4e7] text-[#8c4d29]',
    dot: 'bg-[#f59e0b]'
  },
  VENCIDO: {
    label: 'Vencido',
    badge: 'bg-[#fff1f1] text-[#c55a5a]',
    dot: 'bg-[#e06a6a]'
  }
  ,
  ARCHIVADO: {
    label: 'Archivado',
    badge: 'bg-[#f3f4f6] text-slate-500',
    dot: 'bg-slate-600'
  }
};

const badgeClass = computed(() => statusMap[props.status]?.badge ?? 'bg-slate-100 text-slate-600');
const dotClass = computed(() => statusMap[props.status]?.dot ?? 'bg-slate-400');
const label = computed(() => statusMap[props.status]?.label ?? 'Estado');
</script>
