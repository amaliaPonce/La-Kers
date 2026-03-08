<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex min-h-screen items-start justify-center overflow-auto"
      aria-modal="true"
      role="dialog"
    >
      <div class="absolute inset-0 bg-slate-950/80" @click="closeWizard"></div>
      <div class="relative mx-4 mt-10 w-full max-w-5xl rounded-[32px] bg-white shadow-2xl" @click.stop>
        <header class="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
              Paso {{ activeStep + 1 }} de {{ steps.length }}
            </p>
            <h2 class="text-2xl font-semibold text-slate-900">
              Finalizar contrato {{ tenant?.full_name ?? '' }}
            </h2>
            <p class="text-sm text-slate-500">
              Revisa pagos e incidencias antes de generar el documento de entrega de llaves.
            </p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            @click="closeWizard"
          >
            Cerrar
          </button>
        </header>
        <section class="border-b border-slate-100 px-6 py-4">
          <div class="flex flex-wrap gap-3">
            <button
              v-for="(step, index) in steps"
              :key="step.label"
              type="button"
              class="flex-1 min-w-[140px] rounded-2xl border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] transition"
              :class="{
                'border-slate-900 bg-slate-900 text-white': index === activeStep,
                'border-slate-200 bg-slate-50 text-slate-500': index !== activeStep
              }"
            >
              <span class="block text-[0.55rem]">{{ index + 1 }}</span>
              <span class="mt-1 text-xs text-current">{{ step.label }}</span>
            </button>
          </div>
        </section>
        <section class="space-y-6 px-6 py-6">
          <div v-if="activeStep === 0" class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Meses registrados</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ paymentSummary.monthsContracted }}</p>
              </article>
              <article class="rounded-2xl border border-slate-100 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Total devengado</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ formatCurrency(paymentSummary.totalAccrued) }}</p>
              </article>
              <article class="rounded-2xl border border-slate-100 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pagado</p>
                <p class="mt-2 text-lg font-semibold text-emerald-600">{{ formatCurrency(paymentSummary.totalPaid) }}</p>
              </article>
              <article class="rounded-2xl border border-slate-100 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pendiente</p>
                <p class="mt-2 text-lg font-semibold text-rose-600">{{ formatCurrency(paymentSummary.outstanding) }}</p>
              </article>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900">Pagos recientes</h3>
                <div class="flex items-center gap-3 text-xs text-slate-500">
                  <span>{{ paymentSummary.pendingCount }} pendientes</span>
                  <span>·</span>
                  <span>{{ paymentSummary.lateCount }} en mora</span>
                </div>
              </div>
              <div v-if="recentPayments.length" class="mt-4 space-y-4">
                <article
                  v-for="payment in recentPayments"
                  :key="payment.id"
                  class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-slate-900">
                        {{ formatDateValue(payment.due_date ?? payment.paid_date) }}
                      </p>
                      <p class="text-xs text-slate-500">{{ payment.month }} / {{ payment.year }}</p>
                    </div>
                    <PaymentStatusBadge :status="payment.status" />
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <p class="text-lg font-semibold text-slate-900">{{ formatCurrency(payment.amount ?? 0) }}</p>
                    <p class="text-xs text-slate-500">{{ payment.status === 'PAID' ? 'Abonado' : 'Pendiente' }}</p>
                  </div>
                </article>
              </div>
              <p v-else class="mt-4 text-sm text-slate-500">No hay pagos registrados para este contrato.</p>
            </div>
          </div>
          <div v-else-if="activeStep === 1" class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-3">
              <article class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Incidencias abiertas</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ openIncidentsCount }}</p>
              </article>
              <article class="rounded-2xl border border-slate-100 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Coste estimado</p>
                <p class="mt-2 text-lg font-semibold text-rose-600">{{ formatCurrency(incidentCostTotal) }}</p>
              </article>
              <article class="rounded-2xl border border-slate-100 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Última actualización</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ formatDateValue(latestIncidentDate) }}</p>
              </article>
            </div>
            <div class="space-y-3">
              <article
                v-for="incident in incidentPreview"
                :key="incident.id"
                class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-semibold text-slate-900">{{ incident.title ?? 'Incidencia sin título' }}</h4>
                  <span class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {{ incident.status ?? 'Desconocido' }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-slate-600">{{ incident.description ?? 'Sin descripción adicional' }}</p>
                <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{{ formatDateValue(incident.created_at) }}</span>
                  <span>{{ formatCurrency(incident.cost ?? 0) }}</span>
                </div>
              </article>
            </div>
            <p v-if="!incidentPreview.length" class="text-sm text-slate-500">
              No se han registrado incidencias para este apartamento.
            </p>
          </div>
          <div v-else class="space-y-6">
            <div class="grid gap-6 lg:grid-cols-[1fr,1fr]">
              <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Datos de cierre</p>
                <div class="mt-4 grid gap-4">
                  <label class="text-sm font-semibold text-slate-600">
                    Fecha de finalización
                    <input
                      v-model="form.finalizationDate"
                      type="date"
                      class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </label>
                  <label class="text-sm font-semibold text-slate-600">
                    Monto de la fianza
                    <input
                      v-model.number="form.depositAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </label>
                  <label class="text-sm font-semibold text-slate-600">
                    Estado de la fianza
                    <select
                      v-model="form.depositStatus"
                      class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    >
                      <option v-for="option in depositStatusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>
                  <label class="text-sm font-semibold text-slate-600">
                    Firma responsable
                    <input
                      v-model="form.signer"
                      type="text"
                      placeholder="Nombre y cargo"
                      class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <p class="mt-1 text-[0.7rem] text-slate-500">Documento firmado digitalmente por la persona responsable.</p>
                  </label>
                </div>
              </article>
              <article class="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Resumen de revisión</p>
                <div class="mt-4 space-y-3 text-sm text-slate-600">
                  <div class="flex items-center justify-between">
                    <span>Meses registrados</span>
                    <span class="font-semibold text-slate-900">{{ paymentSummary.monthsContracted }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Saldo pendiente</span>
                    <span class="font-semibold text-rose-600">{{ formatCurrency(paymentSummary.outstanding) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Incidencias abiertas</span>
                    <span class="font-semibold text-slate-900">{{ openIncidentsCount }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Coste estimado</span>
                    <span class="font-semibold text-rose-600">{{ formatCurrency(incidentCostTotal) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Última revisión</span>
                    <span>{{ formatDateValue(latestIncidentDate) }}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p v-if="errorMessage" class="text-sm font-semibold text-rose-600">{{ errorMessage }}</p>
          <div class="ml-auto flex items-center gap-3">
            <button
              v-if="activeStep > 0"
              type="button"
              class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
              @click="activeStep = Math.max(0, activeStep - 1)"
            >
              Atrás
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="primaryButtonDisabled"
              @click="handlePrimaryAction"
            >
              <span>{{ primaryButtonLabel }}</span>
              <span v-if="isFinalizing" class="ml-2 text-xs">Generando...</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import PaymentStatusBadge from './PaymentStatusBadge.vue';
import apiClient from '../services/apiClient';
import type { Payment } from '../types/payment';
import type { TenantWithMeta } from '../types/tenant';
import type { Incident } from '../types/incident';

const props = defineProps<{
  visible: boolean;
  tenant?: TenantWithMeta | null;
  payments: Payment[];
  incidents: Incident[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'finalized', tenantId: string): void;
}>();

const tenant = computed(() => props.tenant ?? null);

const steps = [
  { label: 'Resumen económico' },
  { label: 'Estado de la vivienda' },
  { label: 'Confirmación y firma' }
] as const;

const depositStatusOptions = [
  { value: 'pendiente', label: 'Pendiente de devolución' },
  { value: 'devuelta', label: 'Devuelta íntegramente' },
  { value: 'parcial', label: 'Devuelta parcialmente' }
] as const;

type DepositStatus = (typeof depositStatusOptions)[number]['value'];

const activeStep = ref(0);
const isFinalizing = ref(false);
const errorMessage = ref('');

const form = reactive({
  finalizationDate: new Date().toISOString().split('T')[0],
  depositAmount: null as number | null,
  depositStatus: 'pendiente' as DepositStatus,
  signer: ''
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const normalizeDepositStatus = (value?: string | null): DepositStatus => {
  const normalized = String(value ?? 'pendiente').trim().toLowerCase();
  return depositStatusOptions.some((option) => option.value === (normalized as DepositStatus))
    ? (normalized as DepositStatus)
    : 'pendiente';
};

const extractNumber = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resetFormForTenant = () => {
  activeStep.value = 0;
  errorMessage.value = '';
  form.finalizationDate = new Date().toISOString().split('T')[0];
  form.depositAmount = extractNumber(props.tenant?.deposit_amount ?? props.tenant?.depositAmount) ?? null;
  form.depositStatus = normalizeDepositStatus(
    String(props.tenant?.deposit_status ?? props.tenant?.depositStatus ?? '')
  );
  form.signer = '';
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetFormForTenant();
    } else {
      activeStep.value = 0;
      errorMessage.value = '';
      isFinalizing.value = false;
    }
  }
);

watch(
  () => props.tenant,
  (tenant) => {
    if (props.visible && tenant) {
      resetFormForTenant();
    }
  }
);

const filteredPayments = computed(() => {
  if (!props.tenant?.id) return [];
  return props.payments
    .filter((payment) => payment.tenant_person_id === props.tenant?.id)
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.due_date ?? a.paid_date ?? '').getTime();
      const dateB = new Date(b.due_date ?? b.paid_date ?? '').getTime();
      return dateB - dateA;
    });
});

const paymentSummary = computed(() => {
  const payments = filteredPayments.value;
  const months = new Set<string>();
  let totalAccrued = 0;
  let totalPaid = 0;
  let lastPaymentDate: string | null = null;

  payments.forEach((payment) => {
    const key = `${payment.year ?? ''}-${payment.month ?? ''}`;
    if (payment.year && payment.month) months.add(key);
    const amount = Number(payment.amount ?? 0);
    totalAccrued += amount;
    if (payment.status === 'PAID') {
      totalPaid += amount;
      if (payment.paid_date) {
        const parsed = new Date(payment.paid_date);
        if (!Number.isNaN(parsed.getTime())) {
          if (!lastPaymentDate || parsed > new Date(lastPaymentDate)) {
            lastPaymentDate = payment.paid_date;
          }
        }
      }
    }
  });

  return {
    monthsContracted: months.size,
    totalAccrued,
    totalPaid,
    outstanding: totalAccrued - totalPaid,
    lastPaymentDate,
    pendingCount: payments.filter((payment) => payment.status === 'PENDING').length,
    lateCount: payments.filter((payment) => payment.status === 'LATE').length
  };
});

const recentPayments = computed(() => filteredPayments.value.slice(0, 4));

const incidentsForUnit = computed(() => {
  if (!props.tenant?.unit_id) return [];
  return props.incidents
    .filter((incident) => incident.unit_id === props.tenant?.unit_id)
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.created_at ?? '').getTime();
      const dateB = new Date(b.created_at ?? '').getTime();
      return dateB - dateA;
    });
});

const openIncidentsCount = computed(() =>
  incidentsForUnit.value.filter((incident) => incident.status !== 'CLOSED').length
);
const incidentCostTotal = computed(() =>
  incidentsForUnit.value
    .filter((incident) => incident.status !== 'CLOSED')
    .reduce((acc, incident) => acc + Number(incident.cost ?? 0), 0)
);
const incidentPreview = computed(() => incidentsForUnit.value.slice(0, 3));
const latestIncidentDate = computed(() => incidentsForUnit.value[0]?.created_at);

const signatureValid = computed(() => Boolean(form.signer.trim()));
const finalStepIndex = steps.length - 1;
const isFinalStep = computed(() => activeStep.value === finalStepIndex);
const primaryButtonLabel = computed(() => (isFinalStep.value ? 'Confirmar y generar documento' : 'Continuar'));
const primaryButtonDisabled = computed(
  () => isFinalizing.value || (isFinalStep.value && !signatureValid.value)
);

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '—';
  return currencyFormatter.format(value);
};

const formatDateValue = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return dateFormatter.format(parsed);
};

const closeWizard = () => {
  emit('close');
};

const handlePrimaryAction = () => {
  if (isFinalStep.value) {
    finalizeContract();
    return;
  }
  activeStep.value = Math.min(finalStepIndex, activeStep.value + 1);
};

const finalizeContract = async () => {
  if (!props.tenant?.id) return;
  errorMessage.value = '';
  isFinalizing.value = true;
  try {
    await apiClient.post(`/contracts/${props.tenant.id}/finalize`, {
      finalizationDate: form.finalizationDate,
      depositAmount: Number(form.depositAmount ?? 0),
      depositStatus: form.depositStatus
    });
    emit('finalized', props.tenant.id);
  } catch (error) {
    console.error('[FinalizeContractWizard]', error);
    errorMessage.value = 'No se pudo completar la finalización. Intenta nuevamente.';
  } finally {
    isFinalizing.value = false;
  }
};
</script>
