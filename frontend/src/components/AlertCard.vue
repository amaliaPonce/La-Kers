<template>
  <article class="rounded-[32px] border border-[#e5ddd3] bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(249,246,240,0.92))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
    <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 rounded-full border border-[#e5d5c7] bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29] shadow-sm">
          <SolidIcon name="warning" class="h-3.5 w-3.5" />
          <span>Alertas clave</span>
        </div>
        <h3 class="text-2xl font-semibold text-slate-900">Seguimiento prioritario</h3>
        <p class="text-sm text-slate-500">Contratos, cobros e incidencias con lectura inmediata.</p>
      </div>
      <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
        <SolidIcon name="clock" class="h-3.5 w-3.5 text-[#1f4f46]" />
        Actualizado en tiempo real
      </div>
    </header>

    <div class="mt-6">
      <template v-if="loading">
        <div class="grid gap-4 sm:grid-cols-3">
          <div
            v-for="slot in 3"
            :key="slot"
            class="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm animate-pulse"
          >
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-2xl bg-slate-200"></div>
              <div class="h-6 w-20 rounded-full bg-slate-200"></div>
            </div>
            <div class="mt-5 h-3 w-2/3 rounded-full bg-slate-200"></div>
            <div class="mt-4 h-8 w-1/2 rounded-full bg-slate-200"></div>
            <div class="mt-3 h-2.5 w-3/4 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </template>

      <template v-else-if="alerts.length">
        <div class="grid gap-4 sm:grid-cols-3">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="rounded-[28px] border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5"
            :class="[toneStyles(alert.tone).cardBorder, toneStyles(alert.tone).cardBg]"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-4">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
                  :class="toneStyles(alert.tone).iconBadge"
                >
                  <SolidIcon :name="iconForAlert(alert.id, alert.tone)" class="h-5 w-5" />
                </span>
                <div class="space-y-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{{ alert.title }}</p>
                  <p class="text-2xl font-semibold leading-tight text-slate-900">{{ alert.valueLabel }}</p>
                  <p class="text-sm text-slate-500">{{ alert.detail }}</p>
                </div>
              </div>
              <span
                class="rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] shadow-sm"
                :class="[toneStyles(alert.tone).badgeBg, toneClasses(alert.tone).text]"
              >
                {{ toneStyles(alert.tone).badge }}
              </span>
            </div>

            <p
              v-if="alert.helper"
              class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold leading-tight shadow-sm"
              :class="toneClasses(alert.tone).helper"
            >
              <SolidIcon name="spark" class="h-3.5 w-3.5" />
              {{ alert.helper }}
            </p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="rounded-[28px] border border-white/40 bg-white/80 px-4 py-8 text-center shadow-sm">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f4f46] text-white shadow-lg shadow-emerald-950/10">
            <SolidIcon name="check" class="h-6 w-6" />
          </span>
          <p class="mt-4 text-base font-semibold text-slate-900">Sin riesgos activos</p>
          <p class="mt-2 text-sm text-slate-600">No hay alertas urgentes en este momento.</p>
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import SolidIcon from './SolidIcon.vue';

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
        cardBorder: 'border-[#ead8ca]',
        cardBg: 'bg-[#fff7f1]',
        iconBadge: 'bg-[#c96a37] text-white',
        badgeBg: 'bg-white/80',
        badge: 'ALERTA'
      };
    case 'danger':
      return {
        cardBorder: 'border-rose-200',
        cardBg: 'bg-rose-50',
        iconBadge: 'bg-rose-500 text-white',
        badgeBg: 'bg-white/80',
        badge: 'CRÍTICO'
      };
    case 'info':
      return {
        cardBorder: 'border-[#d5e4dd]',
        cardBg: 'bg-[#edf6f2]',
        iconBadge: 'bg-[#1f4f46] text-white',
        badgeBg: 'bg-white/80',
        badge: 'OK'
      };
    default:
      return {
        cardBorder: 'border-[#e5ddd3]',
        cardBg: 'bg-[#faf7f2]',
        iconBadge: 'bg-slate-900 text-white',
        badgeBg: 'bg-white/80',
        badge: 'LISTO'
      };
  }
};

const iconForAlert = (id: string, tone: AlertTone | undefined) => {
  if (id === 'contracts') return 'calendar';
  if (id === 'overdue') return 'wallet';
  if (id === 'incidents') return tone === 'info' ? 'check' : 'warning';
  return 'warning';
};
</script>
