<template>
  <div class="min-h-screen bg-[#f6f3ee] text-slate-900">
    <div class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(31,79,70,0.13),_transparent_26%),radial-gradient(circle_at_88%_4%,_rgba(201,106,55,0.12),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(246,243,238,0))]"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="rounded-[32px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-[#d5cbc1] bg-[#fbf8f2] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">
              <SolidIcon name="home" class="h-3.5 w-3.5 text-[#c96a37]" />
              <span>Portal del inquilino</span>
            </div>
            <div>
              <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">Seguimiento del alquiler</h1>
              <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Consulta la información base de tu contrato y de la vivienda asociada.
              </p>
            </div>
          </div>

          <UserButton v-if="tenantPortalEnabled" :appearance="clerkUserButtonAppearance" />
        </div>
      </header>

      <section v-if="!tenantPortalEnabled" class="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
        El portal del inquilino está desactivado en modo mínimo.
      </section>

      <section v-else-if="loadError" class="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ loadError }}
      </section>

      <template v-else>
        <section class="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Mi contrato</p>
            <div v-if="profile" class="mt-4 space-y-4">
              <div>
                <h2 class="text-2xl font-semibold text-slate-900">{{ profile.tenant.fullName }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ profile.unit?.name ?? 'Unidad sin nombre' }}</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ contractStatusLabel }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Correo vinculado</p>
                  <p class="mt-2 break-all text-base font-semibold text-slate-900">{{ profile.tenant.email ?? 'Sin correo' }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Inicio</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(profile.tenant.contractStart) }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Fin</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(profile.tenant.contractEnd) }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Dirección</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">
                    {{ [profile.unit?.address, profile.unit?.city, profile.unit?.postalCode].filter(Boolean).join(', ') || 'Sin dirección disponible' }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="mt-4 text-sm text-slate-500">Cargando datos del contrato…</div>
          </article>

          <section class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article v-for="metric in metrics" :key="metric.id" class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ metric.helper }}</p>
            </article>
          </section>
        </section>

        <section class="mt-6 rounded-[32px] border border-[#d9d1c9] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,247,243,0.96))] p-5 shadow-sm">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Estado del portal</p>
          <h2 class="mt-1 text-xl font-semibold text-slate-900">Versión actual centrada en contrato y vivienda</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            La mensajería anterior se ha retirado. Este portal se queda, por ahora, como acceso limpio a la información esencial del alquiler mientras se redefine la siguiente experiencia de mensajes.
          </p>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { UserButton } from '@clerk/vue';
import SolidIcon from '../components/SolidIcon.vue';
import { runtimeConfig } from '../config/runtimeConfig';
import { clerkUserButtonAppearance } from '../services/clerkAppearance';
import tenantApiClient from '../services/tenantApiClient';

type TenantPortalProfile = {
  accessId: string;
  ownerId: string;
  tenantPersonId: string;
  clerkUserId: string;
  tenant: {
    id: string;
    fullName: string;
    email: string | null;
    contractStart: string | null;
    contractEnd: string | null;
    status: string | null;
  };
  unit: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
};

const profile = ref<TenantPortalProfile | null>(null);
const loadError = ref('');
const tenantPortalEnabled = runtimeConfig.enableTenantPortal;
const metrics = computed(() => [
  { id: 'unit', label: 'Unidad', value: profile.value?.unit?.name ?? 'Sin unidad', helper: 'Vivienda vinculada a tu expediente.' },
  { id: 'status', label: 'Estado', value: contractStatusLabel.value, helper: 'Situación actual del contrato.' },
  { id: 'city', label: 'Ciudad', value: profile.value?.unit?.city ?? 'Sin ciudad', helper: 'Ubicación cargada en la ficha.' }
]);

const contractStatusLabel = computed(() => {
  const status = String(profile.value?.tenant.status ?? '').trim().toUpperCase();
  if (!status) return 'Sin estado';
  if (status === 'ACTIVE') return 'Activo';
  if (status === 'ARCHIVED') return 'Archivado';
  return status;
});

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

async function loadProfile() {
  const { data } = await tenantApiClient.get('/me');
  profile.value = data as TenantPortalProfile;
}

async function refreshData() {
  loadError.value = '';
  try {
    await loadProfile();
  } catch (error: any) {
    loadError.value = String(error?.response?.data?.message ?? 'No se pudo cargar el portal del inquilino.');
  }
}

onMounted(() => {
  if (!tenantPortalEnabled) {
    return;
  }

  void refreshData();
});
</script>
