<template>
  <section
    class="rounded-[32px] border border-dashed border-[#e4ddd4] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,246,240,0.94))] p-8 text-center shadow-sm"
  >
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e5ddd2] bg-white text-[#8c4d29] shadow-sm">
      <svg
        aria-hidden="true"
        class="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
      >
        <path d="M4 7.5h16" />
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M7 14h4" />
      </svg>
    </div>

    <p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">
      {{ eyebrow }}
    </p>
    <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
      {{ title }}
    </h2>
    <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
      {{ description }}
    </p>

    <button
      type="button"
      class="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition hover:bg-slate-800"
      @click="handleAction"
    >
      {{ ctaLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaTo?: string;
  }>(),
  {
    eyebrow: 'Cobros',
    title: 'Todavía no hay pagos',
    description: 'Cuando registres pagos, aquí verás el resumen financiero.',
    ctaLabel: 'Ir a inquilinos',
    ctaTo: '/tenants'
  }
);

const emit = defineEmits<{
  (event: 'action'): void;
}>();

const router = useRouter();

const handleAction = async () => {
  emit('action');
  if (props.ctaTo) {
    await router.push(props.ctaTo);
  }
};
</script>
