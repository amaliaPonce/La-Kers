<template>
  <div class="space-y-6 pb-10">
    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Inquilinos</p>
          <h1 class="text-3xl font-semibold text-slate-900">Control de contratos</h1>
          <p class="text-sm text-slate-500">Monitorea fechas críticas y responde con acciones inmediatas.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          data-onboarding="create-tenant"
          @click="openTenantModal('create')"
        >
          <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 3v10m5-5H3" />
          </svg>
          Nuevo inquilino
        </button>
      </div>
      <div class="mt-6 grid gap-6 md:grid-cols-4">
        <TenantMetricCard label="Total inquilinos" :value="metrics.total" accent="slate" />
        <TenantMetricCard label="Contratos activos" :value="metrics.active" accent="emerald" />
        <TenantMetricCard
          label="Próximos a vencer"
          :value="metrics.upcoming"
          subtext="Evento en 30 días"
          accent="amber"
        />
        <TenantMetricCard label="Contratos vencidos" :value="metrics.expired" accent="rose" />
      </div>
    </section>

    <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Lista principal</p>
          <h2 class="text-2xl font-semibold text-slate-900">Inquilinos</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition"
            :class="tenantViewMode === 'active' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'"
            @click="tenantViewMode = 'active'"
          >
            Activos
          </button>
          <button
            type="button"
            class="rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition"
            :class="tenantViewMode === 'archived' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'"
            @click="tenantViewMode = 'archived'"
          >
            Antiguos
          </button>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-between gap-2">
        <p class="text-sm text-slate-500">{{ displayedTenants.length }} contratos visibles</p>
      </div>

      <div class="mt-5 grid gap-6 xl:grid-cols-[minmax(0,2.15fr)_minmax(260px,300px)] xl:items-start">
        <div class="order-2 space-y-5 xl:order-1">
          <TenantFilters
            v-if="tenantViewMode === 'active'"
            :filters="tenantFilters"
            @update:filters="handleFiltersUpdate"
          />
          <div
            v-if="tenantViewMode === 'archived'"
            class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600"
          >
            <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Retenciones</p>
            <ul class="mt-3 space-y-2">
              <li v-for="note in retentionNotes" :key="note.title">
                <span class="font-semibold text-slate-900">{{ note.title }}:</span> {{ note.detail }}
              </li>
            </ul>
          </div>
          <div class="overflow-hidden rounded-[28px] border border-[#eadfd2] bg-white">
            <div>
              <div class="hidden border-b border-[#efe7dd] bg-[#fbf8f2] px-4 py-3 md:grid md:grid-cols-[minmax(0,1.85fr)_minmax(230px,1.1fr)_minmax(120px,0.7fr)_minmax(170px,auto)] md:items-center md:gap-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inquilino</p>
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Contrato</p>
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
                <p class="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Acciones</p>
              </div>
              <div class="divide-y divide-[#efe7dd]">
                <TenantRow
                  v-for="tenant in displayedTenants"
                  :key="tenant.id"
                  :tenant="tenant"
                  :formatted-start="tenant.formattedStart"
                  :formatted-end="tenant.formattedEnd"
                  :status="tenant.status"
                  :days-label="tenant.daysLabel"
                  :is-highlighted="tenant.signature === lastCreatedSignature"
                  :selected="detailTenant?.id === tenant.id"
                  @edit="handleRowInteraction('editar', $event)"
                  @details="handleRowInteraction('detalle', $event)"
                  @pdf="handleRowInteraction('pdf', $event)"
                  @finalize="handleRowInteraction('finalizar', $event)"
                />
              </div>
              <p
                v-if="!displayedTenants.length"
                class="border-t border-[#efe7dd] px-4 py-6 text-center text-sm text-slate-500"
              >
                No hay inquilinos que cumplan los filtros seleccionados en esta pestaña.
              </p>
            </div>
          </div>
        </div>

        <aside ref="detailPanelRef" class="order-1 scroll-mt-24 xl:order-2 xl:sticky xl:top-6">
          <transition name="detail-slide" mode="out-in">
            <article
              v-if="detailTenant"
              key="tenant-detail"
              class="rounded-[32px] border border-[#ead8ca] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(249,246,240,0.96))] p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Ficha activa</p>
                  <div>
                    <h3 class="text-2xl font-semibold text-slate-900">{{ detailTenant.full_name }}</h3>
                    <p class="mt-1 text-sm text-slate-500">DNI: {{ detailTenant.identification ?? '—' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <TenantStatusBadge :status="detailTenant.status" />
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                    @click="closeDetailPanel"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <div v-if="hasTenantReminders" class="mt-5 flex flex-wrap gap-2">
                <RouterLink
                  v-if="pendingPaymentCount > 0"
                  to="/payments"
                  class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
                >
                  <span class="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true"></span>
                  Pagos pendientes
                  <span class="text-[0.55rem] font-semibold text-amber-600">({{ pendingPaymentCount }})</span>
                </RouterLink>
                <RouterLink
                  v-if="openIncidentCount > 0"
                  to="/incidents"
                  class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                >
                  <span class="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true"></span>
                  Incidencias abiertas
                  <span class="text-[0.55rem] font-semibold text-rose-600">({{ openIncidentCount }})</span>
                </RouterLink>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Apartamento</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ detailTenant.units?.name ?? '—' }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Inicio</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ detailTenant.formattedStart }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Fin</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ detailTenant.formattedEnd }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Seguimiento</p>
                  <p
                    class="mt-2 text-base font-semibold"
                    :class="detailTenant.status === 'VENCIDO' ? 'text-rose-600' : detailTenant.status === 'PRÓXIMO A VENCER' ? 'text-amber-600' : 'text-emerald-600'"
                  >
                    {{ detailTenant.daysLabel }}
                  </p>
                </div>
              </div>

              <div class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Control del contrato</p>
                <p class="mt-2 text-base font-semibold text-slate-900">
                  {{ detailTenant.status === 'VENCIDO' ? 'Contrato vencido' : detailTenant.status === 'ARCHIVADO' ? 'Contrato archivado' : 'Contrato activo' }}
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  {{ detailTenant.daysLabel }}
                </p>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  @click="openTenantModal('edit', detailTenant)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  @click="downloadRentalContractPdf(detailTenant.id)"
                >
                  Descargar contrato
                </button>
                <button
                  v-if="detailTenant.status !== 'ARCHIVADO'"
                  type="button"
                  class="rounded-2xl border border-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  @click="openFinalizeWizard(detailTenant)"
                >
                  Finalizar contrato
                </button>
              </div>
            </article>

            <article
              v-else
              key="tenant-empty-detail"
              class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/80 p-6 shadow-sm xl:min-h-[320px]"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Ficha del inquilino</p>
              <h3 class="mt-3 text-xl font-semibold text-slate-900">Selecciona un contrato para ver su detalle</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                La ficha queda fija al lado del listado para revisar pagos, incidencias y fechas sin salir de la tabla.
              </p>
            </article>
          </transition>
        </aside>
      </div>
    </section>

    <TenantModal
      :visible="tenantModalState.visible"
      :mode="tenantModalState.mode"
      :apartments="apartments"
      :saving="saving"
      :initial-values="modalInitialValues"
      @close="handleModalClose"
      @submit="handleTenantSubmit"
    />

    <FinalizeContractWizard
      :visible="finalizeWizard.visible"
      :tenant="finalizeWizard.tenant"
      :payments="payments"
      :incidents="incidents"
      @close="closeFinalizeWizard"
      @finalized="handleContractFinalized"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import TenantMetricCard from '../components/TenantMetricCard.vue';
import TenantFilters from '../components/TenantFilters.vue';
import TenantRow from '../components/TenantRow.vue';
import TenantModal from '../components/TenantModal.vue';
import TenantStatusBadge from '../components/TenantStatusBadge.vue';
import FinalizeContractWizard from '../components/FinalizeContractWizard.vue';
import { useOnboarding } from '../composables/useOnboarding';
import apiClient from '../services/apiClient';
import type { AxiosError } from 'axios';
import type { Payment, PaymentStatus } from '../types/payment';
import type { Incident, IncidentStatus } from '../types/incident';
import type { TenantStatus, TenantWithMeta } from '../types/tenant';

type TenantFormValues = {
  id?: string;
  unit_id: string;
  full_name: string;
  identification: string;
  contract_start: string;
  contract_end: string;
};

const tenants = ref<Array<Record<string, unknown>>>([]);
const apartments = ref<Array<Record<string, unknown>>>([]);
const payments = ref<Payment[]>([]);
const incidents = ref<Incident[]>([]);
const archivedTenants = ref<Array<Record<string, unknown>>>([]);
const tenantFilters = reactive<{
  query: string;
  status: 'ALL' | 'ACTIVO' | 'PRÓXIMO A VENCER' | 'VENCIDO';
  sort: 'end_asc' | 'end_desc';
}>({
  query: '',
  status: 'ALL',
  sort: 'end_asc'
});
const tenantModalState = reactive({
  visible: false,
  mode: 'create' as 'create' | 'edit',
  tenant: null as TenantWithMeta | null
});
const detailTenant = ref<TenantWithMeta | null>(null);
const detailPanelRef = ref<HTMLElement | null>(null);
const saving = ref(false);
const lastCreatedSignature = ref('');
const highlightTimer = ref<number | null>(null);
const { completeStep } = useOnboarding();
const finalizeWizard = reactive({
  visible: false,
  tenant: null as TenantWithMeta | null
});

const tenantViewMode = ref<'active' | 'archived'>('active');
const retentionNotes = [
  { title: 'Datos del inquilino', detail: 'Contrato activo + 5 años' },
  { title: 'Facturación/pagos', detail: 'Conservación 4–6 años' },
  { title: 'Después', detail: 'Anonimización o borrado automático' }
];

const msPerDay = 1000 * 60 * 60 * 24;
const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const pendingPaymentStatusSet = new Set<PaymentStatus>(['PENDING', 'LATE']);
const incidentOpenStatusSet = new Set<IncidentStatus>(['OPEN', 'IN_PROGRESS']);

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return dateFormatter.format(parsed);
};

const computeStatusDetails = (endValue?: string | null, reference = new Date()) => {
  if (!endValue) {
    return { status: 'ACTIVO' as TenantStatus, daysLabel: 'Fecha final pendiente' };
  }
  const endDate = new Date(endValue);
  if (Number.isNaN(endDate.getTime())) {
    return { status: 'ACTIVO' as TenantStatus, daysLabel: 'Fecha inválida' };
  }
  const diff = Math.ceil((endDate.getTime() - reference.getTime()) / msPerDay);
  if (diff < 0) {
    return { status: 'VENCIDO' as TenantStatus, daysLabel: `Vencido hace ${Math.abs(diff)} días` };
  }
  if (diff <= 30) {
    return { status: 'PRÓXIMO A VENCER' as TenantStatus, daysLabel: diff === 0 ? 'Termina hoy' : `Faltan ${diff} días` };
  }
  return { status: 'ACTIVO' as TenantStatus, daysLabel: `Faltan ${diff} días` };
};

const deriveSignature = (source: Record<string, unknown>) => {
  const name = String(source.full_name ?? '');
  const end = String(source.contract_end ?? source.rawEnd ?? '');
  const unit = String(source.unit_id ?? (source.units as Record<string, unknown>)?.id ?? '');
  return `${name}-${end}-${unit}`;
};

const getTenantUnitId = (tenant: TenantWithMeta | null) => {
  if (!tenant) return '';
  if (tenant.unit_id) {
    return String(tenant.unit_id);
  }
  const unitRelation = tenant.units as Record<string, unknown> | undefined;
  if (unitRelation?.id) {
    return String(unitRelation.id);
  }
  return '';
};

const activeTenantsWithMeta = computed<TenantWithMeta[]>(() => {
  const now = new Date();
  return tenants.value.map((tenant) => {
    const rawEnd = String(tenant.contract_end ?? '');
    const { status, daysLabel } = computeStatusDetails(rawEnd, now);
    return {
      ...tenant,
      formattedStart: formatDate(tenant.contract_start as string | undefined),
      formattedEnd: formatDate(rawEnd),
      status,
      daysLabel,
      signature: deriveSignature({ ...tenant, rawEnd }),
      rawEnd
    } as TenantWithMeta;
  });
});

const metrics = computed(() => {
  const total = tenants.value.length;
  let active = 0;
  let upcoming = 0;
  let expired = 0;
  activeTenantsWithMeta.value.forEach((tenant) => {
    if (tenant.status === 'ACTIVO') active += 1;
    if (tenant.status === 'PRÓXIMO A VENCER') upcoming += 1;
    if (tenant.status === 'VENCIDO') expired += 1;
  });
  return { total, active, upcoming, expired };
});

const hasTenants = computed(() => metrics.value.total > 0);

const filteredActiveTenants = computed(() => {
  const query = tenantFilters.query.trim().toLowerCase();
  return activeTenantsWithMeta.value
    .filter((tenant) => {
      const matchesStatus = tenantFilters.status === 'ALL' || tenant.status === tenantFilters.status;
      const matchesName = !query || String(tenant.full_name ?? '').toLowerCase().includes(query);
      return matchesStatus && matchesName;
    })
    .sort((a, b) => {
      const dateA = a.rawEnd ? new Date(a.rawEnd).getTime() : 0;
      const dateB = b.rawEnd ? new Date(b.rawEnd).getTime() : 0;
      return tenantFilters.sort === 'end_asc' ? dateA - dateB : dateB - dateA;
    });
});

const archivedTenantsWithMeta = computed<TenantWithMeta[]>(() => {
  return archivedTenants.value.map((tenant) => {
    const rawEnd = String(tenant.contract_end ?? '');
    const archivedAt = String(tenant.archived_at ?? '');
    return {
      ...tenant,
      formattedStart: formatDate(tenant.contract_start as string | undefined),
      formattedEnd: formatDate(rawEnd),
      status: 'ARCHIVADO' as TenantStatus,
      daysLabel: archivedAt ? `Archivado el ${formatDate(archivedAt)}` : 'Archivado',
      signature: deriveSignature({ ...tenant, rawEnd }),
      rawEnd
    } as TenantWithMeta;
  });
});

const filteredArchivedTenants = computed(() => {
  const query = tenantFilters.query.trim().toLowerCase();
  if (!query) return archivedTenantsWithMeta.value;
  return archivedTenantsWithMeta.value.filter((tenant) =>
    String(tenant.full_name ?? '').toLowerCase().includes(query)
  );
});

const displayedTenants = computed(() => {
  return tenantViewMode.value === 'active' ? filteredActiveTenants.value : filteredArchivedTenants.value;
});

const detailTenantUnitId = computed(() => getTenantUnitId(detailTenant.value));

const detailTenantPendingPayments = computed(() => {
  if (!detailTenant.value?.id) return [];
  const tenantId = detailTenant.value.id;
  return payments.value.filter((payment) => {
    const status = payment.status;
    if (!status) return false;
    if (!pendingPaymentStatusSet.has(status)) return false;
    return payment.tenant_persons?.id === tenantId;
  });
});

const detailTenantOpenIncidents = computed(() => {
  const unitId = detailTenantUnitId.value;
  if (!unitId) return [];
  return incidents.value.filter((incident) => {
    const status = incident.status;
    if (!status) return false;
    if (!incidentOpenStatusSet.has(status)) return false;
    return incident.unit_id === unitId;
  });
});

const pendingPaymentCount = computed(() => detailTenantPendingPayments.value.length);
const openIncidentCount = computed(() => detailTenantOpenIncidents.value.length);
const hasTenantReminders = computed(() => pendingPaymentCount.value > 0 || openIncidentCount.value > 0);

const loadActiveTenants = async () => {
  try {
    const { data } = await apiClient.get('/tenants', {
      params: { status: 'active' }
    });
    tenants.value = data ?? [];
  } catch (error) {
    console.error(error);
  }
};

const loadArchivedTenants = async () => {
  try {
    const { data } = await apiClient.get('/tenants', {
      params: { status: 'archived' }
    });
    archivedTenants.value = data ?? [];
  } catch (error) {
    console.error(error);
  }
};

const refreshData = async () => {
  await Promise.all([loadActiveTenants(), loadArchivedTenants(), loadApartments()]);
};

const loadApartments = async () => {
  try {
    const { data } = await apiClient.get('/apartments');
    apartments.value = data ?? [];
  } catch (error) {
    console.error(error);
  }
};

const loadPayments = async () => {
  try {
    const response = await apiClient.get('/payments');
    payments.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
  }
};

const loadIncidents = async () => {
  try {
    const response = await apiClient.get('/incidents');
    incidents.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
  }
};

const highlightNewTenant = (signature: string) => {
  lastCreatedSignature.value = signature;
  if (highlightTimer.value) {
    clearTimeout(highlightTimer.value);
  }
  highlightTimer.value = window.setTimeout(() => {
    lastCreatedSignature.value = '';
    highlightTimer.value = null;
  }, 3200);
};

const modalInitialValues = computed<TenantFormValues | undefined>(() => {
  const tenant = tenantModalState.tenant;
  if (!tenant) return undefined;
  return {
    id: tenant.id,
    unit_id: String(tenant.unit_id ?? (tenant.units as Record<string, unknown>)?.id ?? ''),
    full_name: String(tenant.full_name ?? ''),
    identification: String(tenant.identification ?? ''),
    contract_start: String(tenant.contract_start ?? ''),
    contract_end: String(tenant.contract_end ?? '')
  };
});

const openTenantModal = (mode: 'create' | 'edit', tenant?: TenantWithMeta) => {
  tenantModalState.mode = mode;
  tenantModalState.tenant = tenant ?? null;
  tenantModalState.visible = true;
};

const handleModalClose = () => {
  if (saving.value) return;
  tenantModalState.visible = false;
  tenantModalState.tenant = null;
};

const buildTenantSubmitErrorMessage = (error: unknown, mode: 'create' | 'edit') => {
  const responseData = (error as AxiosError<{ errors?: string[]; message?: string }>)?.response?.data;
  if (Array.isArray(responseData?.errors) && responseData.errors.length) {
    return responseData.errors.join('\n');
  }
  if (responseData?.message) {
    return responseData.message;
  }
  return mode === 'edit' ? 'No se pudo actualizar el inquilino.' : 'No se pudo crear el inquilino.';
};

const handleTenantSubmit = async (payload: TenantFormValues) => {
  if (new Date(payload.contract_end) < new Date(payload.contract_start)) {
    window.alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
    return;
  }

  saving.value = true;
  let requestSucceeded = false;
  try {
    if (tenantModalState.mode === 'edit' && payload.id) {
      await apiClient.put(`/tenants/${payload.id}`, payload);
      detailTenant.value = null;
    } else {
      await apiClient.post('/tenants', payload);
      highlightNewTenant(`${payload.full_name}-${payload.contract_end}-${payload.unit_id}`);
    }
    await refreshData();
    requestSucceeded = true;
  } catch (error) {
    console.error(error);
    window.alert(buildTenantSubmitErrorMessage(error, tenantModalState.mode));
  } finally {
    saving.value = false;
    if (requestSucceeded) {
      tenantModalState.visible = false;
      tenantModalState.tenant = null;
    }
  }
};

const handleFiltersUpdate = (value: typeof tenantFilters) => {
  Object.assign(tenantFilters, value);
};

const openPdfBlob = (blob: Blob) => {
  const objectUrl = window.URL.createObjectURL(blob);
  window.open(objectUrl, '_blank', 'noopener');
  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 60_000);
};

const buildPdfBlob = (data: unknown) =>
  data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'application/pdf' });

const handleDownloadError = (context: string, error: unknown, notFoundMessage: string) => {
  console.error(`[TenantsView/${context}]`, error);
  const status = (error as AxiosError)?.response?.status;
  window.alert(status === 404 ? notFoundMessage : 'No se pudo descargar el contrato.');
};

const downloadContractTerminationPdf = async (tenantId?: string) => {
  if (!tenantId) return;
  try {
    const response = await apiClient.get(`/contracts/${tenantId}/pdf`, {
      responseType: 'blob',
      transformResponse: [(datum) => datum]
    });
    const blob = buildPdfBlob(response.data);
    openPdfBlob(blob);
  } catch (error) {
    handleDownloadError('downloadContractTerminationPdf', error, 'Documento de finalización no encontrado.');
  }
};

const downloadRentalContractPdf = async (tenantId?: string) => {
  if (!tenantId) return;
  try {
    const response = await apiClient.get(`/documents/tenant-contract/${tenantId}`, {
      responseType: 'blob',
      transformResponse: [(datum) => datum]
    });
    const blob = buildPdfBlob(response.data);
    openPdfBlob(blob);
  } catch (error) {
    handleDownloadError('downloadRentalContractPdf', error, 'Contrato de alquiler no encontrado.');
  }
};

const openFinalizeWizard = (tenant: TenantWithMeta) => {
  finalizeWizard.tenant = tenant;
  finalizeWizard.visible = true;
};

const openDetailPanel = async (tenant: TenantWithMeta) => {
  detailTenant.value = tenant;
  await nextTick();
  if (window.innerWidth < 1280) {
    detailPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const closeFinalizeWizard = () => {
  finalizeWizard.visible = false;
  finalizeWizard.tenant = null;
};

const handleContractFinalized = async (tenantId: string) => {
  closeFinalizeWizard();
  if (!tenantId) return;
  await downloadContractTerminationPdf(tenantId);
  try {
    await Promise.all([refreshData(), loadPayments(), loadIncidents()]);
  } catch (error) {
    console.error(error);
  }
  detailTenant.value = null;
};

const handleRowInteraction = (action: 'editar' | 'detalle' | 'pdf' | 'finalizar', tenant: TenantWithMeta) => {
  switch (action) {
    case 'editar':
      openTenantModal('edit', tenant);
      break;
    case 'detalle':
      void openDetailPanel(tenant);
      break;
    case 'pdf':
      downloadRentalContractPdf(tenant.id);
      break;
    case 'finalizar':
      if (tenant.status === 'ARCHIVADO') return;
      openFinalizeWizard(tenant);
      break;
  }
};

const closeDetailPanel = () => {
  detailTenant.value = null;
};

onMounted(() => {
  Promise.all([refreshData(), loadPayments(), loadIncidents()]).catch((error) => console.error(error));
});

watch(
  hasTenants,
  (value) => {
    if (value) completeStep('tenantAdded');
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (highlightTimer.value) {
    clearTimeout(highlightTimer.value);
    highlightTimer.value = null;
  }
});
</script>

<style scoped>
.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.detail-slide-enter-from,
.detail-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
