<template>
  <Transition name="checklist-fade">
    <div
      v-if="shouldRender"
      class="fixed bottom-6 right-6 z-40 w-[calc(100vw-2rem)] max-w-sm"
    >
      <Transition name="checklist-slide" mode="out-in">
        <section
          v-if="!checklistMinimized"
          key="expanded"
          class="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">
                Onboarding
              </p>
              <h3 class="mt-2 text-lg font-semibold text-slate-900">
                {{ onboardingCompleted ? 'Configuración lista' : 'Primer valor en marcha' }}
              </h3>
              <p class="mt-1 text-sm text-slate-500">
                {{ progressPercentage }}% completado
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                @click="setChecklistMinimized(true)"
              >
                Minimizar
              </button>
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                @click="setChecklistVisibility(false)"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-[#1f4f46] transition-all duration-200"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>

          <ol class="mt-5 space-y-3">
            <li
              v-for="item in checklistItems"
              :key="item.key"
              class="flex items-start gap-3 rounded-2xl border px-3 py-3 transition"
              :class="statusCardClass[item.status]"
            >
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                :class="statusDotClass[item.status]"
              >
                {{ item.status === 'completed' ? '✓' : item.status === 'active' ? '•' : itemIndex[item.key] }}
              </span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-sm leading-6 text-slate-500">{{ item.description }}</p>
              </div>
            </li>
          </ol>

          <button
            v-if="nextStepRoute"
            type="button"
            class="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#1f4f46] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,79,70,0.18)] transition hover:bg-[#173b35]"
            @click="router.push(nextStepRoute)"
          >
            {{ onboardingCompleted ? 'Ir al dashboard' : 'Continuar' }}
          </button>
        </section>

        <button
          v-else
          key="minimized"
          type="button"
          class="flex w-full items-center justify-between rounded-full border border-white/80 bg-white/95 px-4 py-3 text-left shadow-[0_18px_40px_rgba(15,23,42,0.1)] backdrop-blur transition hover:border-slate-200"
          @click="setChecklistMinimized(false)"
        >
          <span>
            <span class="block text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">
              Onboarding
            </span>
            <span class="mt-1 block text-sm font-semibold text-slate-900">
              {{ onboardingCompleted ? 'Configuración lista' : `${progressPercentage}% completado` }}
            </span>
          </span>
          <span class="rounded-full bg-[#edf6f2] px-3 py-1 text-xs font-semibold text-[#1f4f46]">
            Abrir
          </span>
        </button>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboarding, type OnboardingStepName, type OnboardingStepStatus } from '../../composables/useOnboarding';

const router = useRouter();

const {
  checklistItems,
  checklistMinimized,
  checklistVisible,
  onboardingCompleted,
  onboardingDismissed,
  onboardingStarted,
  progressPercentage,
  setChecklistMinimized,
  setChecklistVisibility
} = useOnboarding();

const shouldRender = computed(
  () => onboardingStarted.value && !onboardingDismissed.value && checklistVisible.value
);

const nextStepRoute = computed(() => {
  if (onboardingCompleted.value) return '/dashboard';
  const activeItem = checklistItems.value.find((item) => item.status === 'active');
  return activeItem?.route ?? '/dashboard';
});

const itemIndex: Record<OnboardingStepName, number> = {
  propertyCreated: 1,
  tenantAdded: 2,
  paymentAdded: 3
};

const statusCardClass: Record<OnboardingStepStatus, string> = {
  pending: 'border-slate-200 bg-white',
  active: 'border-[#d5e4dd] bg-[#f4faf7]',
  completed: 'border-emerald-100 bg-emerald-50/70'
};

const statusDotClass: Record<OnboardingStepStatus, string> = {
  pending: 'border-slate-200 bg-white text-slate-500',
  active: 'border-[#b8d4ca] bg-[#edf6f2] text-[#1f4f46]',
  completed: 'border-emerald-200 bg-emerald-100 text-emerald-700'
};
</script>

<style scoped>
.checklist-fade-enter-active,
.checklist-fade-leave-active,
.checklist-slide-enter-active,
.checklist-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.checklist-fade-enter-from,
.checklist-fade-leave-to,
.checklist-slide-enter-from,
.checklist-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
