<template>
  <div class="space-y-6 pb-10">
    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Documentación</p>
          <h1 class="text-3xl font-semibold text-slate-900">Contratos y recibos</h1>
          <p class="text-sm text-slate-500">Localiza PDFs operativos sin salir del panel ni rebuscar en carpetas separadas.</p>
        </div>
        <div class="rounded-2xl border border-[#d8e4de] bg-[#f3faf6] px-4 py-3 text-sm text-[#1f4f46]">
          {{ documents.length ? `${documents.length} documentos listos` : 'Aún no hay documentos generados' }}
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="metric in metricCards"
          :key="metric.id"
          class="rounded-[28px] border border-slate-100 bg-slate-50/80 p-5"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{{ metric.label }}</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ metric.helper }}</p>
        </article>
      </div>
    </section>

    <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div class="grid gap-4 md:grid-cols-3">
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Tipo
          <select v-model="filters.type" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option value="CONTRACT">Contratos</option>
            <option value="RECEIPT">Recibos</option>
          </select>
        </label>
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Estado
          <select v-model="filters.state" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="ARCHIVADO">Archivado</option>
            <option value="COBRADO">Cobrado</option>
          </select>
        </label>
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Buscar
          <input
            v-model="filters.query"
            type="text"
            placeholder="Inquilino, apartamento o periodo"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </div>
    </section>

    <div
      v-if="loading"
      class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500"
    >
      Cargando contratos y recibos…
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <section class="order-2 rounded-[32px] border border-slate-200 bg-white shadow-sm xl:order-1">
        <div class="divide-y divide-slate-100">
          <article
            v-for="document in filteredDocuments"
            :key="document.id"
            class="cursor-pointer px-5 py-5 transition hover:bg-slate-50/80"
            :class="{ 'bg-slate-50/90': selectedDocument?.id === document.id }"
            @click="selectDocument(document.id)"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="truncate text-lg font-semibold text-slate-900">{{ document.title }}</p>
                  <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]"
                    :class="document.stateClasses"
                  >
                    {{ document.stateLabel }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-slate-500">{{ document.subtitle }}</p>
                <div class="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <span>{{ document.typeLabel }}</span>
                  <span>{{ document.unitLabel }}</span>
                  <span>{{ document.dateLabel }}</span>
                </div>
              </div>

              <button
                type="button"
                class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                @click.stop="openDocument(document)"
              >
                {{ document.ctaLabel }}
              </button>
            </div>
          </article>

          <div v-if="!filteredDocuments.length" class="px-5 py-10 text-center">
            <p class="text-lg font-semibold text-slate-900">No hay documentos que coincidan</p>
            <p class="mt-2 text-sm text-slate-500">Ajusta los filtros o genera actividad nueva desde pagos e inquilinos.</p>
          </div>
        </div>
      </section>

      <aside ref="detailPanelRef" class="order-1 scroll-mt-24 xl:order-2 xl:sticky xl:top-6">
        <transition name="detail-slide" mode="out-in">
          <article
            v-if="selectedDocument"
            key="document-detail"
            class="rounded-[32px] border border-[#ead8ca] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(249,246,240,0.96))] p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Ficha activa</p>
                <div>
                  <h2 class="text-2xl font-semibold text-slate-900">{{ selectedDocument.title }}</h2>
                  <p class="mt-1 text-sm text-slate-500">{{ selectedDocument.subtitle }}</p>
                </div>
              </div>
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                @click="selectedDocumentId = null"
              >
                Cerrar
              </button>
            </div>

            <div class="mt-5 grid gap-3">
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Tipo</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ selectedDocument.typeLabel }}</p>
              </div>
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Unidad</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ selectedDocument.unitLabel }}</p>
              </div>
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Referencia</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ selectedDocument.referenceLabel }}</p>
              </div>
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Fecha</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ selectedDocument.dateLabel }}</p>
              </div>
            </div>

            <div class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Contexto</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ selectedDocument.context }}</p>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                @click="openDocument(selectedDocument)"
              >
                {{ selectedDocument.ctaLabel }}
              </button>
              <router-link
                :to="selectedDocument.relatedRoute"
                class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                {{ selectedDocument.relatedLabel }}
              </router-link>
            </div>
          </article>

          <article
            v-else
            key="document-empty-detail"
            class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/80 p-6 shadow-sm xl:min-h-[320px]"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Ficha del documento</p>
            <h3 class="mt-3 text-xl font-semibold text-slate-900">Selecciona un documento para ver su detalle</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              Aquí quedan localizados contratos y recibos con acceso directo al PDF y al flujo que los originó.
            </p>
          </article>
        </transition>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import type { AxiosError } from 'axios';
import apiClient from '../services/apiClient';
import type { Payment } from '../types/payment';

type TenantRecord = Record<string, unknown> & {
  id?: string;
  full_name?: string;
  contract_start?: string;
  contract_end?: string;
  archived_at?: string;
  unit_id?: string;
  units?: { name?: string; id?: string };
};

type DocumentType = 'CONTRACT' | 'RECEIPT';
type DocumentState = 'ACTIVO' | 'ARCHIVADO' | 'COBRADO';

type DocumentItem = {
  id: string;
  entityId: string;
  type: DocumentType;
  typeLabel: string;
  title: string;
  subtitle: string;
  unitLabel: string;
  referenceLabel: string;
  state: DocumentState;
  stateLabel: string;
  stateClasses: string;
  dateLabel: string;
  context: string;
  ctaLabel: string;
  relatedRoute: string;
  relatedLabel: string;
  searchText: string;
};

const activeTenants = ref<TenantRecord[]>([]);
const archivedTenants = ref<TenantRecord[]>([]);
const payments = ref<Payment[]>([]);
const loading = ref(false);
const selectedDocumentId = ref<string | null>(null);
const detailPanelRef = ref<HTMLElement | null>(null);

const filters = reactive({
  type: '',
  state: '',
  query: ''
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return dateFormatter.format(parsed);
};

const formatMonth = (month?: number, year?: number) => {
  if (!month || !year) return 'Periodo no disponible';
  return monthFormatter.format(new Date(year, month - 1, 1));
};

const buildPdfBlob = (data: unknown) =>
  data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'application/pdf' });

const openPdfBlob = (blob: Blob) => {
  const objectUrl = window.URL.createObjectURL(blob);
  window.open(objectUrl, '_blank', 'noopener');
  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 60_000);
};

const handleDownloadError = (context: string, error: unknown, fallbackMessage: string) => {
  console.error(`[DocumentsView/${context}]`, error);
  const status = (error as AxiosError)?.response?.status;
  window.alert(status === 404 ? 'Documento no encontrado.' : fallbackMessage);
};

const openContract = async (tenantId: string) => {
  try {
    const response = await apiClient.get(`/documents/tenant-contract/${tenantId}`, {
      responseType: 'blob',
      transformResponse: [(datum) => datum]
    });
    openPdfBlob(buildPdfBlob(response.data));
  } catch (error) {
    handleDownloadError('openContract', error, 'No se pudo abrir el contrato.');
  }
};

const openReceipt = async (paymentId: string) => {
  try {
    const response = await apiClient.post(`/documents/receipt/${paymentId}`, {}, {
      responseType: 'blob',
      transformResponse: [(datum) => datum]
    });
    openPdfBlob(buildPdfBlob(response.data));
  } catch (error) {
    handleDownloadError('openReceipt', error, 'No se pudo abrir el recibo.');
  }
};

const documents = computed<DocumentItem[]>(() => {
  const contractDocuments = [
    ...activeTenants.value.map((tenant) => {
      const tenantId = String(tenant.id ?? '');
      const tenantName = String(tenant.full_name ?? 'Contrato sin nombre');
      const unitLabel = String(tenant.units?.name ?? 'Unidad sin nombre');
      return {
        id: `contract-${tenantId}`,
        entityId: tenantId,
        type: 'CONTRACT' as const,
        typeLabel: 'Contrato',
        title: tenantName,
        subtitle: `${unitLabel} · Contrato activo`,
        unitLabel,
        referenceLabel: `Contrato de ${tenantName}`,
        state: 'ACTIVO' as const,
        stateLabel: 'Activo',
        stateClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dateLabel: `Inicio ${formatDate(String(tenant.contract_start ?? ''))}`,
        context: 'Contrato operativo listo para consulta o descarga desde la ficha documental.',
        ctaLabel: 'Abrir contrato',
        relatedRoute: '/tenants',
        relatedLabel: 'Ir a contratos',
        searchText: `${tenantName} ${unitLabel} ${tenant.contract_start ?? ''} contrato activo`.toLowerCase()
      };
    }),
    ...archivedTenants.value.map((tenant) => {
      const tenantId = String(tenant.id ?? '');
      const tenantName = String(tenant.full_name ?? 'Contrato archivado');
      const unitLabel = String(tenant.units?.name ?? 'Unidad sin nombre');
      return {
        id: `contract-archived-${tenantId}`,
        entityId: tenantId,
        type: 'CONTRACT' as const,
        typeLabel: 'Contrato',
        title: tenantName,
        subtitle: `${unitLabel} · Contrato archivado`,
        unitLabel,
        referenceLabel: `Contrato archivado de ${tenantName}`,
        state: 'ARCHIVADO' as const,
        stateLabel: 'Archivado',
        stateClasses: 'border-slate-200 bg-slate-100 text-slate-600',
        dateLabel: `Archivado ${formatDate(String(tenant.archived_at ?? tenant.contract_end ?? ''))}`,
        context: 'Contrato histórico conservado para consultas posteriores o revisión de cierre.',
        ctaLabel: 'Abrir contrato',
        relatedRoute: '/tenants',
        relatedLabel: 'Ir a contratos',
        searchText: `${tenantName} ${unitLabel} ${tenant.archived_at ?? ''} contrato archivado`.toLowerCase()
      };
    })
  ];

  const receiptDocuments = payments.value
    .filter((payment) => payment.status === 'PAID')
    .map((payment) => {
      const paymentId = String(payment.id ?? '');
      const tenantName = String(payment.tenant_persons?.full_name ?? 'Inquilino sin nombre');
      const unitLabel = String(payment.units?.name ?? 'Unidad sin nombre');
      const periodLabel = formatMonth(payment.month, payment.year);
      return {
        id: `receipt-${paymentId}`,
        entityId: paymentId,
        type: 'RECEIPT' as const,
        typeLabel: 'Recibo',
        title: `Recibo de ${tenantName}`,
        subtitle: `${unitLabel} · ${periodLabel}`,
        unitLabel,
        referenceLabel: `${tenantName} · ${periodLabel}`,
        state: 'COBRADO' as const,
        stateLabel: 'Cobrado',
        stateClasses: 'border-[#ead8ca] bg-[#fff4ea] text-[#8c4d29]',
        dateLabel: `Pago ${formatDate(payment.paid_date ?? payment.due_date)}`,
        context: 'Recibo disponible para pagos confirmados, listo para abrir o compartir.',
        ctaLabel: 'Abrir recibo',
        relatedRoute: '/payments',
        relatedLabel: 'Ir a pagos',
        searchText: `${tenantName} ${unitLabel} ${periodLabel} recibo cobrado`.toLowerCase()
      };
    });

  return [...contractDocuments, ...receiptDocuments];
});

const filteredDocuments = computed(() => {
  const query = filters.query.trim().toLowerCase();
  return documents.value.filter((document) => {
    if (filters.type && document.type !== filters.type) return false;
    if (filters.state && document.state !== filters.state) return false;
    if (query && !document.searchText.includes(query)) return false;
    return true;
  });
});

const selectedDocument = computed(() => {
  if (!selectedDocumentId.value) return null;
  return filteredDocuments.value.find((document) => document.id === selectedDocumentId.value)
    ?? documents.value.find((document) => document.id === selectedDocumentId.value)
    ?? null;
});

const metricCards = computed(() => [
  {
    id: 'contracts-active',
    label: 'Contratos activos',
    value: String(activeTenants.value.length),
    helper: 'Documentación viva vinculada a inquilinos actuales'
  },
  {
    id: 'contracts-archived',
    label: 'Archivados',
    value: String(archivedTenants.value.length),
    helper: 'Histórico localizado para cierres y consultas'
  },
  {
    id: 'receipts-ready',
    label: 'Recibos listos',
    value: String(payments.value.filter((payment) => payment.status === 'PAID').length),
    helper: 'Solo aparecen cobros ya confirmados'
  },
  {
    id: 'documents-total',
    label: 'Total localizado',
    value: String(documents.value.length),
    helper: 'Contratos y recibos accesibles desde una sola vista'
  }
]);

watch(
  filteredDocuments,
  (list) => {
    if (!list.length) {
      selectedDocumentId.value = null;
      return;
    }
    if (!selectedDocumentId.value || !list.some((document) => document.id === selectedDocumentId.value)) {
      selectedDocumentId.value = list[0].id;
    }
  },
  { immediate: true }
);

const loadData = async () => {
  loading.value = true;
  try {
    const [activeTenantsResponse, archivedTenantsResponse, paymentsResponse] = await Promise.all([
      apiClient.get('/tenants', { params: { status: 'active' } }),
      apiClient.get('/tenants', { params: { status: 'archived' } }),
      apiClient.get('/payments')
    ]);
    activeTenants.value = Array.isArray(activeTenantsResponse.data) ? activeTenantsResponse.data : [];
    archivedTenants.value = Array.isArray(archivedTenantsResponse.data) ? archivedTenantsResponse.data : [];
    payments.value = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const selectDocument = async (id: string) => {
  selectedDocumentId.value = id;
  await nextTick();
  if (window.innerWidth < 1280) {
    detailPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const openDocument = async (document: DocumentItem) => {
  if (document.type === 'CONTRACT') {
    await openContract(document.entityId);
    return;
  }
  await openReceipt(document.entityId);
};

onMounted(() => {
  loadData().catch((error) => console.error(error));
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
