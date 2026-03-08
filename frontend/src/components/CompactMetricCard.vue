<template>
  <article
    class="group rounded-3xl border bg-white px-6 py-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    :class="borderAccent"
  >
    <p class="text-xs uppercase tracking-[0.35em] text-slate-500">{{ label }}</p>
    <p class="mt-3 text-3xl font-semibold text-slate-900">{{ displayValue }}</p>
    <p v-if="cleanSubtext" class="mt-2 text-xs text-slate-500">{{ cleanSubtext }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string | number;
  subtext?: string;
  accent?: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';
}>();

const borderAccent = computed(() => {
  switch (props.accent) {
    case 'emerald':
      return 'border-emerald-100';
    case 'rose':
      return 'border-rose-100';
    case 'amber':
      return 'border-amber-100';
    case 'slate':
      return 'border-slate-200';
    default:
      return 'border-blue-100';
  }
});

const displayValue = computed(() => String(props.value));
const cleanSubtext = computed(() => {
  if (!props.subtext) return undefined;
  return props.subtext.replace(/^\s*:\s*/, '');
});
</script>
