<template>
  <article
    class="group rounded-3xl border bg-white/80 px-5 py-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
    :class="accentBorder"
  >
    <p class="text-sm font-semibold text-slate-500">{{ label }}</p>
    <p class="mt-3 text-3xl font-semibold text-slate-900">{{ value }}</p>
    <p v-if="subLabel" class="mt-2 text-sm text-slate-500">{{ subLabel }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string;
  subLabel?: string;
  accent?: 'slate' | 'emerald' | 'amber' | 'rose' | 'indigo';
}>();

const accentBorder = computed(() => {
  switch (props.accent) {
    case 'emerald':
      return 'border-emerald-100';
    case 'amber':
      return 'border-amber-100';
    case 'rose':
      return 'border-rose-100';
    case 'indigo':
      return 'border-indigo-100';
    default:
      return 'border-slate-100';
  }
});
</script>
