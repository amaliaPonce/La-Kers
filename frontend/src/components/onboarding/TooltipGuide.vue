<template>
  <Transition name="tooltip-guide">
    <aside
      v-if="tooltip"
      class="fixed right-6 top-24 z-40 w-[calc(100vw-2rem)] max-w-xs rounded-[24px] border border-white/80 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">
            Guía contextual
          </p>
          <h3 class="mt-2 text-base font-semibold text-slate-900">{{ tooltip.title }}</h3>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          @click="dismissTooltip(tooltip.id)"
        >
          Cerrar
        </button>
      </div>

      <p class="mt-3 text-sm leading-6 text-slate-600">
        {{ tooltip.description }}
      </p>

      <button
        type="button"
        class="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#1f4f46] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173b35]"
        @click="handleCta"
      >
        {{ tooltip.ctaLabel }}
      </button>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboarding } from '../../composables/useOnboarding';

const props = defineProps<{
  routeName?: string | null;
}>();

const router = useRouter();
const { dismissTooltip, getCurrentTooltip } = useOnboarding();

const tooltip = computed(() => getCurrentTooltip(props.routeName));

const handleCta = async () => {
  if (!tooltip.value?.ctaTo) return;
  await router.push(tooltip.value.ctaTo);
};
</script>

<style scoped>
.tooltip-guide-enter-active,
.tooltip-guide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.tooltip-guide-enter-from,
.tooltip-guide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
