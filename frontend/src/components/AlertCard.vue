<template>
  <article class="rounded-[28px] border border-slate-100 bg-white/90 p-5 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
    <header class="flex flex-col gap-1 text-slate-900">
      <p class="text-[0.55rem] font-semibold uppercase tracking-[0.45em] text-slate-400">Alertas clave</p>
      <h3 class="text-2xl font-semibold text-slate-900">Contratos e incidencias</h3>
      <p class="text-sm text-slate-500">Solo lo urgente para que puedas actuar rápido.</p>
    </header>

    <div class="mt-5">
      <template v-if="loading">
        <div class="grid gap-4 sm:grid-cols-3">
          <div
            v-for="slot in 3"
            :key="slot"
            class="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm animate-pulse"
          >
            <div class="h-3 w-2/3 rounded-full bg-slate-200"></div>
            <div class="mt-3 h-2.5 w-1/2 rounded-full bg-slate-200"></div>
            <div class="mt-2 h-2.5 w-1/4 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </template>
      <template v-else-if="alerts.length">
        <div class="grid gap-4 sm:grid-cols-3">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="rounded-2xl border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5"
            :class="[
              toneStyles(alert.tone).cardBorder,
              toneStyles(alert.tone).cardBg
            ]"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{{ alert.title }}</p>
                <p class="text-2xl font-semibold text-slate-900 leading-tight">{{ alert.valueLabel }}</p>
                <p class="text-sm text-slate-500">{{ alert.detail }}</p>
              </div>
              <div class="flex flex-col items-end gap-1 text-right">
                <span
                  class="rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] bg-white/70"
                  :class="toneClasses(alert.tone).text"
                >
                  {{ toneStyles(alert.tone).badge }}
                </span>
                <span class="text-xs font-semibold text-slate-400">Actualizado</span>
              </div>
            </div>
            <p
              v-if="alert.helper"
              class="mt-3 text-xs font-semibold leading-tight"
              :class="toneClasses(alert.tone).helper"
            >
              {{ alert.helper }}
            </p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="rounded-2xl border border-white/40 bg-white/80 px-4 py-6 text-center text-sm text-slate-700 shadow-sm">
          No se detectan riesgos activos en este momento. Mantén la estrategia financiera vigente.
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

type AlertTone = 'neutral' | 'info' | 'warning' | 'danger';

type AlertDefinition = {
  id: string;
  title: string;
  valueLabel: string;
  detail: string;
  helper?: string;
  tone?: AlertTone;
};

const props = defineProps({
  alerts: {
    type: Array as PropType<AlertDefinition[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const toneClasses = (tone: AlertTone | undefined) => {
  switch (tone) {
    case 'warning':
      return {
        text: 'text-amber-600',
        helper: 'text-amber-600'
      };
    case 'danger':
      return {
        text: 'text-rose-600',
        helper: 'text-rose-600'
      };
    case 'info':
      return {
        text: 'text-blue-600',
        helper: 'text-blue-600'
      };
    default:
      return {
        text: 'text-slate-900',
        helper: 'text-slate-700'
      };
  }
};

const toneStyles = (tone: AlertTone | undefined) => {
  switch (tone) {
    case 'warning':
      return {
        cardBorder: 'border-amber-100',
        cardBg: 'bg-amber-50',
        badge: 'ALERTA'
      };
    case 'danger':
      return {
        cardBorder: 'border-rose-100',
        cardBg: 'bg-rose-50',
        badge: 'CRÍTICO'
      };
    case 'info':
      return {
        cardBorder: 'border-sky-100',
        cardBg: 'bg-sky-50',
        badge: 'OK'
      };
    default:
      return {
        cardBorder: 'border-slate-100',
        cardBg: 'bg-slate-50',
        badge: 'LISTO'
      };
  }
};
</script>
