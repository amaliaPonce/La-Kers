<template>
  <div class="flex flex-wrap gap-4">
    <label class="w-full text-xs font-semibold uppercase tracking-wider text-slate-500">
      Buscar y filtrar
    </label>
    <div class="flex-1 min-w-[220px]">
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
        <input
          type="search"
          class="w-full rounded-2xl border border-slate-200 bg-white/60 px-10 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          :value="filters.query"
          placeholder="Buscar por nombre"
          @input="onChange('query', $event.currentTarget.value)"
        />
      </div>
    </div>
    <div class="min-w-[200px]">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Estado</p>
      <select
        class="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-amber-400 focus:outline-none"
        :value="filters.status"
        @change="onChange('status', $event.currentTarget.value)"
      >
        <option value="ALL">Todos</option>
        <option value="ACTIVO">Activos</option>
        <option value="PRÓXIMO A VENCER">Próximos</option>
        <option value="VENCIDO">Vencidos</option>
      </select>
    </div>
    <div class="min-w-[200px]">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Orden</p>
      <select
        class="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
        :value="filters.sort"
        @change="onChange('sort', $event.currentTarget.value)"
      >
        <option value="end_asc">Contrato próximo</option>
        <option value="end_desc">Contrato lejano</option>
      </select>
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
