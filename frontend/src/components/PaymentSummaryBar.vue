<template>
  <article class="rounded-3xl border border-[#eadfd2] bg-[linear-gradient(90deg,_rgba(255,255,255,0.9),_rgba(248,245,239,0.92))] px-5 py-5 shadow-sm">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-medium text-[#8c4d29]">Resumen mensual</p>
        <p class="text-lg font-semibold text-slate-900">{{ monthLabel }}</p>
      </div>
      <p class="text-sm font-semibold text-[#1f4f46]">{{ progressPercent }}% del objetivo</p>
    </div>
    <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#efe7dd]/80">
      <div
        class="h-full rounded-full bg-[#1f4f46] transition-all duration-500"
        :style="{ width: progressWidth }"
      ></div>
    </div>
    <div class="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
      <div>
        <p class="text-xs font-semibold text-[#8c4d29]">Cobrado</p>
        <p class="text-base font-semibold text-[#1f4f46]">{{ formatCurrency(collected) }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold text-[#8c4d29]">Pendiente</p>
        <p class="text-base font-semibold text-[#8a6518]">{{ formatCurrency(pending) }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold text-[#8c4d29]">Retrasado</p>
        <p class="text-base font-semibold text-rose-600">{{ formatCurrency(late) }}</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  monthLabel: string;
  collected: number;
  expected: number;
  pending: number;
  late: number;
}>();

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
});

const formatCurrency = (value: number) => currencyFormatter.format(value ?? 0);

const progressPercent = computed(() => {
  if (!props.expected) return 0;
  return Math.min(100, Math.round((props.collected / props.expected) * 100));
});

const progressWidth = computed(() => `${progressPercent.value}%`);
</script>
