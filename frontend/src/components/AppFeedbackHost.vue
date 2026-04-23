<template>
  <Teleport to="body">
    <Transition name="app-toast">
      <div
        v-if="toast.visible"
        class="pointer-events-none fixed right-6 bottom-6 z-[70] max-w-sm"
      >
        <article
          class="rounded-[24px] border px-4 py-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur"
          :class="toastClasses(toast.tone)"
        >
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
              :class="toastIconClasses(toast.tone)"
            >
              <SolidIcon :name="toast.tone === 'success' ? 'check' : 'warning'" class="h-4 w-4" />
            </span>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em]" :class="toastEyebrowClasses(toast.tone)">
                {{ toastLabel(toast.tone) }}
              </p>
              <p class="mt-1 text-sm font-medium text-slate-900">{{ toast.message }}</p>
            </div>
          </div>
        </article>
      </div>
    </Transition>

    <Transition name="fade-scale">
      <div
        v-if="confirmation.visible"
        class="fixed inset-0 z-[80] flex items-center justify-center px-4"
        aria-modal="true"
        role="dialog"
      >
        <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" @click="resolveConfirmation(false)"></div>

        <article class="relative w-full max-w-md rounded-[28px] border border-[#eadfd2] bg-white p-6 shadow-2xl">
          <div class="flex items-start gap-4">
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              :class="confirmation.tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-[#f3ede4] text-[#8c4d29]'"
            >
              <SolidIcon name="warning" class="h-5 w-5" />
            </span>
            <div class="min-w-0">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.28em]"
                :class="confirmation.tone === 'danger' ? 'text-rose-500' : 'text-[#8c4d29]'"
              >
                {{ confirmation.tone === 'danger' ? 'Acción sensible' : 'Confirmación' }}
              </p>
              <h3 class="mt-2 text-xl font-semibold text-slate-900">{{ confirmation.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ confirmation.message }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-2xl border border-[#d8cec2] px-4 py-2 text-sm font-semibold text-[#8c4d29] transition hover:border-[#c96a37]"
              @click="resolveConfirmation(false)"
            >
              {{ confirmation.cancelLabel }}
            </button>
            <button
              type="button"
              class="rounded-2xl px-4 py-2 text-sm font-semibold text-white transition"
              :class="confirmation.tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#1f4f46] hover:bg-[#173c36]'"
              @click="resolveConfirmation(true)"
            >
              {{ confirmation.confirmLabel }}
            </button>
          </div>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import SolidIcon from './SolidIcon.vue';
import type { AppToastTone } from '../composables/useAppFeedback';
import { useAppFeedback } from '../composables/useAppFeedback';

const { toast, confirmation, resolveConfirmation } = useAppFeedback();

const toastLabel = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return 'Correcto';
    case 'error':
      return 'Error';
    default:
      return 'Aviso';
  }
};

const toastClasses = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return 'border-emerald-200 bg-white/96';
    case 'error':
      return 'border-rose-200 bg-white/96';
    default:
      return 'border-[#eadfd2] bg-white/96';
  }
};

const toastIconClasses = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700';
    case 'error':
      return 'bg-rose-100 text-rose-600';
    default:
      return 'bg-[#f3ede4] text-[#8c4d29]';
  }
};

const toastEyebrowClasses = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return 'text-emerald-600';
    case 'error':
      return 'text-rose-500';
    default:
      return 'text-[#8c4d29]';
  }
};
</script>

<style scoped>
.app-toast-enter-active,
.app-toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
