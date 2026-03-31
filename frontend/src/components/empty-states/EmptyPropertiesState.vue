<template>
  <section
    class="rounded-[32px] border border-dashed border-[#d8e4de] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,250,247,0.92))] p-8 text-center shadow-sm"
  >
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d5e4dd] bg-white text-[#1f4f46] shadow-sm">
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
        <path d="M4 20V8.8a1 1 0 0 1 .4-.8l6.8-5.1a1.4 1.4 0 0 1 1.6 0L19.6 8a1 1 0 0 1 .4.8V20" />
        <path d="M9 20v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V20" />
      </svg>
    </div>

    <p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1f4f46]">
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
      class="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#1f4f46] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,79,70,0.18)] transition hover:bg-[#173b35]"
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
    eyebrow: 'Espacio vacío',
    title: 'Aún no tienes propiedades',
    description: 'Empieza creando tu primera propiedad para activar el panel.',
    ctaLabel: 'Crear primera propiedad',
    ctaTo: '/apartments'
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
