<template>
  <article
    class="group rounded-3xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(248,245,239,0.88))] px-5 py-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
    :class="accentBorder"
  >
    <p class="text-sm font-semibold text-[#8c4d29]">{{ label }}</p>
    <p class="mt-3 text-3xl font-semibold text-slate-900">{{ value }}</p>
    <p v-if="subLabel" class="mt-2 text-sm text-slate-600">{{ subLabel }}</p>
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
      return 'border-[#d5e4dd]';
    case 'amber':
      return 'border-[#e7cf8c]';
    case 'rose':
      return 'border-rose-100';
    case 'indigo':
      return 'border-[#d8e6df]';
    default:
      return 'border-[#eadfd2]';
  }
});
</script>
