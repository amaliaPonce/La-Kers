<template>
  <article
    class="group relative overflow-hidden rounded-3xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,245,239,0.9))] px-6 py-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    :class="borderAccent"
  >
    <p class="text-sm font-semibold text-[#8c4d29]">{{ label }}</p>
    <p class="mt-3 text-3xl font-semibold text-slate-900">{{ displayValue }}</p>
    <p v-if="subtext" class="mt-1 text-sm text-slate-600">{{ subtext }}</p>
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
      return 'border-[#d5e4dd]';
    case 'amber':
      return 'border-[#e7cf8c]';
    case 'rose':
      return 'border-rose-100';
    case 'slate':
      return 'border-[#eadfd2]';
    default:
      return 'border-[#d8e6df]';
  }
});

const displayValue = computed(() => String(props.value));
</script>
