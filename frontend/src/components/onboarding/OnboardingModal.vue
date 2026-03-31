<template>
  <Transition name="onboarding-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-[2px]"
    >
      <div
        class="w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-7 shadow-[0_28px_70px_rgba(15,23,42,0.18)]"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">
          Onboarding
        </p>
        <h2 class="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          Bienvenido a LA-KERS
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          Configura tu espacio en pocos pasos y empieza a gestionar tus propiedades.
        </p>

        <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            @click="dismissOnboarding"
          >
            Ahora no
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl bg-[#1f4f46] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,79,70,0.18)] transition hover:bg-[#173b35]"
            @click="startOnboarding"
          >
            Empezar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOnboarding } from '../../composables/useOnboarding';

const { shouldShowWelcomeModal, dismissOnboarding, startOnboarding } = useOnboarding();

const isOpen = computed(() => shouldShowWelcomeModal.value);
</script>

<style scoped>
.onboarding-fade-enter-active,
.onboarding-fade-leave-active {
  transition: opacity 0.18s ease;
}

.onboarding-fade-enter-from,
.onboarding-fade-leave-to {
  opacity: 0;
}
</style>
