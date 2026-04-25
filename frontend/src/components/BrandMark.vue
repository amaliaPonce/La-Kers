<template>
  <span class="inline-flex items-center" :class="iconOnly ? '' : compact ? 'gap-2' : 'gap-3'">
    <span
      v-if="!hideIcon"
      class="relative inline-flex items-center justify-center overflow-hidden rounded-[22px] border border-[#d9e6de] bg-[radial-gradient(circle_at_35%_28%,_#f6fffb,_#dff3ea_58%,_#cfe6db_100%)] shadow-[0_10px_26px_rgba(31,79,70,0.12)]"
      :class="iconClass"
      :aria-label="iconOnly ? APP_NAME : undefined"
    >
      <img :src="brandIsotype" class="h-full w-full object-contain scale-[1.18]" :alt="APP_NAME" />
    </span>

    <img
      v-if="!iconOnly && useWordmarkImage"
      :src="brandWordmark"
      class="w-auto object-contain"
      :class="[compact ? 'h-6' : 'h-7', labelClass, wordmarkClass]"
      :alt="APP_NAME"
    />
    <span v-else-if="!iconOnly" :class="labelClass">{{ APP_NAME }}</span>
  </span>
</template>

<script setup lang="ts">
import { APP_NAME } from '../config/brand';
import brandIsotype from '../assets/isotipoAlquilio.png';
import brandWordmark from '../assets/LogotipoAlquilio.png';

withDefaults(
  defineProps<{
    iconOnly?: boolean;
    compact?: boolean;
    iconClass?: string;
    labelClass?: string;
    useWordmarkImage?: boolean;
    wordmarkClass?: string;
    hideIcon?: boolean;
  }>(),
  {
    iconOnly: false,
    compact: false,
    iconClass: 'h-10 w-10',
    labelClass: 'text-lg font-semibold tracking-tight text-slate-900',
    useWordmarkImage: false,
    wordmarkClass: '',
    hideIcon: false
  }
);
</script>
