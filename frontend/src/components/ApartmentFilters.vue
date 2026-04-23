<template>
  <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm">
    <input
      v-model="localSearch"
      @input="emitChange"
      placeholder="Buscar propiedad"
      type="text"
      class="flex-1 min-w-[220px] rounded-2xl border border-[#e1d7cb] bg-[#fbf8f2] px-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-[#1f4f46] focus:ring focus:ring-[#d5e4dd]"
    />
    <select
      v-model="localStatus"
      @change="emitChange"
      class="rounded-2xl border border-[#e1d7cb] bg-[#fbf8f2] px-4 py-2 text-sm font-medium text-slate-700 focus:border-[#1f4f46] focus:ring focus:ring-[#d5e4dd]"
    >
      <option value="ALL">Todos los estados</option>
      <option value="AVAILABLE">Disponible</option>
      <option value="OCCUPIED">Ocupado</option>
      <option value="RESERVED">Reservado</option>
    </select>
    <button
      class="flex items-center gap-2 rounded-2xl border border-[#d8cec2] bg-white px-4 py-2 text-sm font-semibold text-[#8c4d29] transition hover:border-[#c96a37] hover:text-[#8c4d29]"
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
