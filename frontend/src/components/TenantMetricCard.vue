<template>
  <article
    class="group relative overflow-hidden rounded-3xl border bg-white px-6 py-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg text-center"
    :class="borderAccent"
  >
    <p class="text-sm font-semibold text-slate-500">{{ label }}</p>
    <p class="mt-3 text-3xl font-semibold text-slate-900">{{ displayValue }}</p>
    <p v-if="subtext" class="mt-1 text-sm text-slate-500">{{ subtext }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string | number;
  subtext?: string;
  accent?: 'emerald' | 'amber' | 'rose' | 'slate' | 'blue';
}>();

const borderAccent = computed(() => {
  switch (props.accent) {
    case 'emerald':
      return 'border-emerald-100';
    case 'amber':
      return 'border-amber-100';
    case 'rose':
      return 'border-rose-100';
    case 'slate':
      return 'border-slate-200';
    default:
      return 'border-blue-100';
  }
});

const displayValue = computed(() => String(props.value));
</script>
