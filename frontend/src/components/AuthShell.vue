<template>
  <div class="relative min-h-screen overflow-hidden bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.14),_transparent_34%),radial-gradient(circle_at_82%_12%,_rgba(15,118,110,0.1),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(248,245,239,0))]"></div>
    <div class="pointer-events-none absolute inset-y-0 right-0 w-[36rem] bg-[radial-gradient(circle_at_center,_rgba(31,79,70,0.08),_transparent_58%)]"></div>
    <div class="pointer-events-none absolute left-1/2 top-40 h-72 w-72 -translate-x-1/2 rounded-full bg-[#c96a37]/10 blur-3xl"></div>

    <header class="relative z-10 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <router-link to="/" class="brand-wordmark flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
          <span class="flex h-14 items-center rounded-[22px] border border-[#e5ddd2] bg-white/90 px-3 shadow-sm shadow-[#1f4f46]/5">
            <img :src="brandLogo" alt="La-Kers" class="h-9 w-auto object-contain" />
          </span>
          <span class="hidden text-sm font-semibold uppercase tracking-[0.24em] text-[#1f4f46] sm:inline">Propiedades</span>
        </router-link>

        <div class="flex flex-wrap items-center gap-3 text-sm sm:justify-end">
          <router-link
            to="/"
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Volver a la landing
          </router-link>
          <router-link
            :to="secondaryActionPath"
            class="rounded-full bg-[#c96a37] px-4 py-2 font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
          >
            {{ secondaryActionLabel }}
          </router-link>
        </div>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid min-h-[calc(100vh-81px)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section class="hidden space-y-6 lg:block">
          <div class="inline-flex items-center gap-2 rounded-full border border-[#d6c7bb] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#1f4f46] shadow-sm">
            <span class="h-2 w-2 rounded-full bg-[#c96a37]"></span>
            {{ heroBadge }}
          </div>

          <div class="max-w-xl space-y-5">
            <h1 class="text-5xl font-semibold leading-[0.95] text-slate-900">
              {{ heroTitle }}
            </h1>
            <p class="max-w-lg text-base leading-8 text-slate-600">
              {{ heroDescription }}
            </p>
          </div>

          <div v-if="heroMetrics.length" class="grid gap-4 sm:grid-cols-3">
            <article
              v-for="metric in heroMetrics"
              :key="metric.label"
              class="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">{{ metric.label }}</p>
              <p class="mt-3 text-2xl font-semibold text-slate-900">{{ metric.value }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ metric.copy }}</p>
            </article>
          </div>

          <div
            v-if="checklist.length"
            class="overflow-hidden rounded-[36px] border border-white/80 bg-white/75 shadow-[0_28px_70px_rgba(15,23,42,0.07)] backdrop-blur"
          >
            <div class="grid gap-0 md:grid-cols-[0.82fr_1.18fr]">
              <div class="bg-[#1f4f46] p-6 text-white">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100/80">Lo que resuelve</p>
                <div class="mt-5 space-y-4">
                  <div
                    v-for="item in checklist"
                    :key="item"
                    class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span class="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#f7c15c]"></span>
                    <p class="text-sm leading-6 text-emerald-50/90">{{ item }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,244,237,0.95))] p-6">
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Panel de hoy</p>
                <div class="mt-5 space-y-3">
                  <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div class="flex items-center justify-between">
                      <p class="text-xs uppercase tracking-[0.28em] text-slate-400">Cobrado</p>
                      <span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Mes actual</span>
                    </div>
                    <p class="mt-2 text-2xl font-semibold text-slate-900">6.820 €</p>
                    <p class="mt-1 text-sm text-slate-500">Todo lo que ya entró sin revisar hojas sueltas.</p>
                  </div>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p class="text-xs uppercase tracking-[0.28em] text-slate-400">Mora</p>
                      <p class="mt-2 text-xl font-semibold text-[#c96a37]">3 pagos</p>
                      <p class="mt-1 text-sm text-slate-500">Detectados y listos para seguimiento.</p>
                    </div>
                    <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p class="text-xs uppercase tracking-[0.28em] text-slate-400">Incidencias</p>
                      <p class="mt-2 text-xl font-semibold text-slate-900">2 activas</p>
                      <p class="mt-1 text-sm text-slate-500">Todo localizado por unidad.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="w-full max-w-xl justify-self-center lg:justify-self-end">
          <article class="overflow-hidden rounded-[36px] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div class="border-b border-[#efe5da] bg-[linear-gradient(180deg,_rgba(249,244,237,0.95),_rgba(255,255,255,0.7))] px-6 py-6 sm:px-8">
              <div class="flex items-center gap-4">
                <div class="flex h-16 items-center justify-center rounded-[24px] border border-[#e5ddd2] bg-white/90 px-4 shadow-sm shadow-[#1f4f46]/5">
                  <img :src="brandLogo" alt="La-Kers" class="h-10 w-auto object-contain" />
                </div>
                <div>
                  <div class="inline-flex items-center gap-2 rounded-full border border-[#e5d5c7] bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29] shadow-sm">
                    {{ panelBadge }}
                  </div>
                  <h2 class="mt-3 text-3xl font-semibold text-slate-900">{{ panelTitle }}</h2>
                </div>
              </div>
              <p class="mt-5 max-w-md text-sm leading-7 text-slate-500">{{ panelDescription }}</p>
            </div>

            <div class="px-6 py-6 sm:px-8 sm:py-8">
              <slot />
            </div>
          </article>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import brandLogo from '../assets/logo.png';

type HeroMetric = {
  label: string;
  value: string;
  copy: string;
};

defineProps<{
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  panelBadge: string;
  panelTitle: string;
  panelDescription: string;
  secondaryActionLabel: string;
  secondaryActionPath: string;
  heroMetrics: HeroMetric[];
  checklist: string[];
}>();
</script>
