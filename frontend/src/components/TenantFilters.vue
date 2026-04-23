<template>
  <div>
    <div class="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(200px,0.75fr)_minmax(200px,0.75fr)] md:items-end">
      <div class="min-w-0 space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Buscar</p>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8c4d29]/60">🔍</span>
          <input
            type="search"
            class="h-11 w-full rounded-2xl border border-[#e1d7cb] bg-white/80 px-10 text-sm text-slate-700 shadow-sm focus:border-[#c96a37] focus:outline-none focus:ring-2 focus:ring-[#f1dccf]"
            :value="filters.query"
            placeholder="Buscar por nombre"
            @input="onChange('query', $event.currentTarget.value)"
          />
        </div>
      </div>
      <div class="min-w-[200px] space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Estado</p>
        <select
          class="h-11 w-full rounded-2xl border border-[#e1d7cb] bg-white/80 px-3 text-sm text-slate-700 shadow-sm focus:border-[#1f4f46] focus:outline-none"
          :value="filters.status"
          @change="onChange('status', $event.currentTarget.value)"
        >
          <option value="ALL">Todos</option>
          <option value="ACTIVO">Activos</option>
          <option value="PRÓXIMO A VENCER">Próximos</option>
          <option value="VENCIDO">Vencidos</option>
        </select>
      </div>
      <div class="min-w-[200px] space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Orden</p>
        <select
          class="h-11 w-full rounded-2xl border border-[#e1d7cb] bg-white/80 px-3 text-sm text-slate-700 shadow-sm focus:border-[#1f4f46] focus:outline-none"
          :value="filters.sort"
          @change="onChange('sort', $event.currentTarget.value)"
        >
          <option value="end_asc">Contrato próximo</option>
          <option value="end_desc">Contrato lejano</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  filters: {
    query: string;
    status: 'ALL' | 'ACTIVO' | 'PRÓXIMO A VENCER' | 'VENCIDO';
    sort: 'end_asc' | 'end_desc';
  };
}>();

const emit = defineEmits<{
  (e: 'update:filters', value: typeof props.filters): void;
}>();

const onChange = (field: keyof typeof props.filters, value: string) => {
  emit('update:filters', {
    ...props.filters,
    [field]: value
  });
};
</script>
