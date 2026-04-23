<template>
  <div class="rounded-3xl border border-[#eadfd2] bg-white/85 p-5 shadow-sm backdrop-blur">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-[#8c4d29]">Filtros avanzados</p>
      <p class="text-xs font-semibold text-slate-400">Control completo</p>
    </div>
    <div class="mt-4 grid gap-4 md:grid-cols-3">
      <label class="text-xs font-semibold text-[#8c4d29]">
        Estado
        <select
          class="mt-2 block w-full rounded-2xl border border-[#e1d7cb] bg-[#fbf8f2] px-3 py-2 text-sm text-slate-700 focus:border-[#1f4f46] focus:outline-none focus:ring-2 focus:ring-[#d5e4dd]"
          :value="stateFilter"
          @change="(event) => emit('update:stateFilter', event.target.value)"
        >
          <option value="ALL">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="LATE">Retrasados</option>
          <option value="PAID">Pagados</option>
        </select>
      </label>
      <label class="text-xs font-semibold text-[#8c4d29]">
        Propiedad
        <select
          class="mt-2 block w-full rounded-2xl border border-[#e1d7cb] bg-[#fbf8f2] px-3 py-2 text-sm text-slate-700 focus:border-[#1f4f46] focus:outline-none focus:ring-2 focus:ring-[#d5e4dd]"
          :value="apartmentFilter"
          @change="(event) => emit('update:apartmentFilter', event.target.value)"
        >
          <option value="all">Todas las propiedades</option>
          <option
            v-for="option in apartmentOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="text-xs font-semibold text-[#8c4d29]">
        Mes
        <select
          class="mt-2 block w-full rounded-2xl border border-[#e1d7cb] bg-[#fbf8f2] px-3 py-2 text-sm text-slate-700 focus:border-[#1f4f46] focus:outline-none focus:ring-2 focus:ring-[#d5e4dd]"
          :value="monthFilter"
          @change="(event) => emit('update:monthFilter', event.target.value)"
        >
          <option value="all">Todos los meses</option>
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
    <div class="mt-5">
      <label class="sr-only" for="payment-search">Buscar inquilino</label>
      <input
        id="payment-search"
        type="text"
        :value="searchTerm"
        @input="(event) => emit('update:searchTerm', event.target.value)"
        class="w-full rounded-2xl border border-[#e1d7cb] bg-[#fbf8f2] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1f4f46] focus:outline-none focus:ring-2 focus:ring-[#d5e4dd]"
        placeholder="Buscar por nombre del inquilino"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  stateFilter: 'ALL' | 'PENDING' | 'LATE' | 'PAID';
  apartmentFilter: string;
  monthFilter: string;
  searchTerm: string;
  apartmentOptions: Array<{ value: string; label: string }>;
  monthOptions: Array<{ value: string; label: string }>;
}>();

const emit = defineEmits<{
  (event: 'update:stateFilter', value: 'ALL' | 'PENDING' | 'LATE' | 'PAID'): void;
  (event: 'update:apartmentFilter', value: string): void;
  (event: 'update:monthFilter', value: string): void;
  (event: 'update:searchTerm', value: string): void;
}>();
</script>
