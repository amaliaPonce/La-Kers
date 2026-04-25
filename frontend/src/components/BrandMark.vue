<template>
  <span class="inline-flex items-center" :class="iconOnly ? '' : compact ? 'gap-2' : 'gap-3'">
    <span
      class="relative inline-flex items-center justify-center overflow-hidden rounded-[22px] border border-[#d9e6de] bg-[radial-gradient(circle_at_35%_28%,_#f6fffb,_#dff3ea_58%,_#cfe6db_100%)] shadow-[0_10px_26px_rgba(31,79,70,0.12)]"
      :class="iconClass"
      :aria-label="iconOnly ? APP_NAME : undefined"
    >
      <svg viewBox="0 0 64 64" class="h-[72%] w-[72%]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M11 31.5L32 14L53 31.5"
          stroke="#24544b"
          stroke-width="4.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17 29.5L32 17.5L47 29.5V49H17V29.5Z"
          fill="url(#brand-house-fill)"
          stroke="#24544b"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
        <path d="M39 21V15H44V24.5" stroke="#24544b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="28" y="34" width="8" height="15" rx="1.5" fill="#f7faf8" fill-opacity="0.95" />
        <rect x="20.5" y="33" width="5.5" height="5.5" rx="1" fill="#f7faf8" fill-opacity="0.92" />
        <rect x="38" y="33" width="5.5" height="5.5" rx="1" fill="#f7faf8" fill-opacity="0.92" />
        <defs>
          <linearGradient id="brand-house-fill" x1="17" y1="19" x2="47" y2="49" gradientUnits="userSpaceOnUse">
            <stop stop-color="#dff3ea" />
            <stop offset="1" stop-color="#9bb79c" />
          </linearGradient>
        </defs>
      </svg>
    </span>

    <span v-if="!iconOnly" :class="labelClass">{{ APP_NAME }}</span>
  </span>
</template>

<script setup lang="ts">
import { APP_NAME } from '../config/brand';

withDefaults(
  defineProps<{
    iconOnly?: boolean;
    compact?: boolean;
    iconClass?: string;
    labelClass?: string;
  }>(),
  {
    iconOnly: false,
    compact: false,
    iconClass: 'h-10 w-10',
    labelClass: 'text-lg font-semibold tracking-tight text-slate-900'
  }
);
</script>
