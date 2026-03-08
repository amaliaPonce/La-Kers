<template>
  <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm">
    <input
      v-model="localSearch"
      @input="emitChange"
      placeholder="Buscar apartamento"
      type="text"
      class="flex-1 min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-primary focus:ring focus:ring-primary/40"
    />
    <select
      v-model="localStatus"
      @change="emitChange"
      class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-primary focus:ring focus:ring-primary/40"
    >
      <option value="ALL">Todos los estados</option>
      <option value="AVAILABLE">Disponible</option>
      <option value="OCCUPIED">Ocupado</option>
      <option value="RESERVED">Reservado</option>
    </select>
    <button
      class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
      type="button"
      @click="toggleSort"
    >
      <span>Ordenar por renta</span>
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" v-if="sortOrder === 'asc'" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" v-else />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const emits = defineEmits<{
  (e: 'update', payload: { search: string; status: string; sort: 'asc' | 'desc' }): void;
}>();

const localSearch = ref('');
const localStatus = ref('ALL');
const sortOrder = ref<'asc' | 'desc'>('asc');

const emitChange = () => {
  emits('update', {
    search: localSearch.value,
    status: localStatus.value,
    sort: sortOrder.value
  });
};

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  emitChange();
};

watch([localSearch, localStatus], emitChange);
</script>
