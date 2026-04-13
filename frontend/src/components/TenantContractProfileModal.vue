<template>
  <Teleport to="body">
    <transition name="fade-scale">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-6"
        aria-modal="true"
        role="dialog"
      >
        <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" @click="handleClose"></div>

        <div class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-[#f8f5ef] shadow-2xl">
          <header class="border-b border-[#e7ddd1] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(249,246,240,0.94))] px-4 py-4 sm:px-6">
            <div class="flex items-start justify-between gap-4">
              <div class="max-w-2xl">
                <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Inquilinos</p>
                <h3 class="mt-1.5 text-lg font-semibold text-slate-900 sm:text-xl">{{ title }}</h3>
                <p class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
                  Estos datos quedan listos para completar contratos PDF sin tocar la plantilla actual.
                </p>
              </div>
              <button
                type="button"
                class="rounded-full border border-[#ead8ca] bg-white/85 p-2.5 text-slate-500 transition hover:border-[#d8c4b4] hover:text-slate-900"
                @click="handleClose"
              >
                ✕
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <form class="space-y-4" @submit.prevent="handleSubmit">
                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Empresa</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Identificación fiscal</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Razón social *</span>
                      <input v-model="form.company_name" type="text" class="field-input" placeholder="Inversiones Centro S.L." />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Nombre comercial</span>
                      <input v-model="form.trade_name" type="text" class="field-input" placeholder="Centro Living" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">CIF / NIF *</span>
                      <input v-model="form.tax_id" type="text" class="field-input" placeholder="B12345678" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Teléfono</span>
                      <input v-model="form.company_phone" type="tel" class="field-input" placeholder="600 123 123" />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Email</span>
                      <input v-model="form.company_email" type="email" class="field-input" placeholder="legal@empresa.es" />
                    </label>
                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Dirección fiscal</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Domicilio</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Calle y número *</span>
                      <input v-model="form.fiscal_address_line_1" type="text" class="field-input" placeholder="Calle Real 10" />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Piso, puerta, etc.</span>
                      <input v-model="form.fiscal_address_line_2" type="text" class="field-input" placeholder="3A" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Código postal *</span>
                      <input v-model="form.fiscal_postal_code" type="text" class="field-input" placeholder="14001" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Ciudad *</span>
                      <input v-model="form.fiscal_city" type="text" class="field-input" placeholder="Córdoba" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Provincia</span>
                      <input v-model="form.fiscal_province" type="text" class="field-input" placeholder="Córdoba" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">País *</span>
                      <input v-model="form.fiscal_country" type="text" class="field-input" placeholder="España" />
                    </label>
                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Representante legal</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Firma y cargo</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Nombre completo *</span>
                      <input v-model="form.legal_representative_name" type="text" class="field-input" placeholder="María López" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">DNI / NIE *</span>
                      <input v-model="form.legal_representative_id" type="text" class="field-input" placeholder="12345678Z" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Cargo</span>
                      <input v-model="form.legal_representative_role" type="text" class="field-input" placeholder="Administradora" />
                    </label>
                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Datos adicionales</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Contrato</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5">
                    <label class="space-y-1.5">
                      <span class="field-label">IBAN</span>
                      <input v-model="form.iban" type="text" class="field-input" placeholder="ES91 2100 0418 4502 0005 1332" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Observaciones</span>
                      <textarea
                        v-model="form.contract_notes"
                        rows="4"
                        class="field-textarea"
                        placeholder="Notas útiles para preparar el contrato."
                      ></textarea>
                    </label>
                  </div>
                </section>
              </form>

              <aside class="space-y-4 xl:sticky xl:top-0 xl:self-start">
                <section class="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,251,248,0.94))] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#1f4f46]">Resumen</p>
                  <h4 class="mt-1.5 text-lg font-semibold text-slate-900">{{ companyHeading }}</h4>
                  <p class="mt-1.5 text-[11px] text-slate-500">{{ fiscalSummary }}</p>

                  <div class="mt-4 grid gap-2.5">
                    <article
                      v-for="item in summaryCards"
                      :key="item.label"
                      class="rounded-[18px] border border-white/70 bg-white/90 p-3 shadow-sm"
                    >
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ item.label }}</p>
                      <p class="mt-1.5 text-sm font-semibold text-slate-900">{{ item.value }}</p>
                      <p class="mt-1 text-[11px] text-slate-500">{{ item.detail }}</p>
                    </article>
                  </div>
                </section>
              </aside>
            </div>
          </div>

          <footer class="border-t border-[#e7ddd1] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(249,246,240,0.94))] px-4 py-3.5 sm:px-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p v-if="combinedError" class="text-[11px] font-medium text-rose-600 sm:text-xs">{{ combinedError }}</p>
                <p v-else class="text-[11px] text-slate-500 sm:text-xs">Se guardan por inquilino y quedan disponibles para el contrato PDF.</p>
              </div>
              <div class="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  class="rounded-full border border-slate-300 px-4 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:text-xs"
                  @click="handleClose"
                >
                  Cancelar
                </button>
                <button
                  :disabled="saving || loading"
                  type="button"
                  class="rounded-full bg-[#1f4f46] px-4 py-2 text-[11px] font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#173c36] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                  @click="handleSubmit"
                >
                  {{ saving ? 'Guardando...' : primaryLabel }}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  createEmptyTenantContractProfilePayload,
  type TenantContractProfilePayload,
  type TenantContractProfileRecord
} from '../types/tenantContractProfile';

const props = defineProps<{
  visible: boolean;
  tenantName?: string;
  loading?: boolean;
  saving?: boolean;
  serverError?: string;
  initialValues?: TenantContractProfileRecord | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: TenantContractProfilePayload): void;
}>();

const form = reactive(createEmptyTenantContractProfilePayload());
const submitError = ref('');

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidIban = (value: string) => {
  const normalized = value.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized) && normalized.length >= 15 && normalized.length <= 34;
};

const populateForm = () => {
  Object.assign(form, createEmptyTenantContractProfilePayload(), {
    company_name: props.initialValues?.company_name ?? '',
    trade_name: props.initialValues?.trade_name ?? '',
    tax_id: props.initialValues?.tax_id ?? '',
    company_email: props.initialValues?.company_email ?? '',
    company_phone: props.initialValues?.company_phone ?? '',
    fiscal_address_line_1: props.initialValues?.fiscal_address_line_1 ?? '',
    fiscal_address_line_2: props.initialValues?.fiscal_address_line_2 ?? '',
    fiscal_postal_code: props.initialValues?.fiscal_postal_code ?? '',
    fiscal_city: props.initialValues?.fiscal_city ?? '',
    fiscal_province: props.initialValues?.fiscal_province ?? '',
    fiscal_country: props.initialValues?.fiscal_country ?? '',
    legal_representative_name: props.initialValues?.legal_representative_name ?? '',
    legal_representative_id: props.initialValues?.legal_representative_id ?? '',
    legal_representative_role: props.initialValues?.legal_representative_role ?? '',
    iban: props.initialValues?.iban ?? '',
    contract_notes: props.initialValues?.contract_notes ?? ''
  });
  submitError.value = '';
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      populateForm();
    }
  }
);

watch(
  () => props.initialValues,
  () => {
    if (props.visible) {
      populateForm();
    }
  },
  { deep: true }
);

const title = computed(() => `Datos de contrato · ${props.tenantName ?? 'Inquilino'}`);
const primaryLabel = computed(() => (props.initialValues ? 'Guardar cambios' : 'Guardar datos'));
const combinedError = computed(() => submitError.value || props.serverError || '');
const companyHeading = computed(() => form.company_name.trim() || 'Datos de empresa pendientes');
const fiscalSummary = computed(() => {
  const city = form.fiscal_city.trim();
  const country = form.fiscal_country.trim();
  return [city, country].filter(Boolean).join(', ') || 'Completa el domicilio fiscal para usarlo en contratos.';
});

const summaryCards = computed(() => [
  {
    label: 'Fiscal',
    value: form.tax_id.trim() || 'Sin CIF/NIF',
    detail: form.company_email.trim() || 'Sin email de empresa'
  },
  {
    label: 'Representante',
    value: form.legal_representative_name.trim() || 'Sin representante',
    detail: form.legal_representative_role.trim() || form.legal_representative_id.trim() || 'Sin cargo'
  },
  {
    label: 'Contrato',
    value: form.iban.trim() || 'Sin IBAN',
    detail: form.contract_notes.trim() || 'Sin observaciones'
  }
]);

const handleSubmit = () => {
  submitError.value = '';

  if (!form.company_name.trim()) {
    submitError.value = 'La razón social es obligatoria.';
    return;
  }
  if (!form.tax_id.trim()) {
    submitError.value = 'El CIF/NIF es obligatorio.';
    return;
  }
  if (form.company_email.trim() && !isValidEmail(form.company_email.trim())) {
    submitError.value = 'El email de empresa no es válido.';
    return;
  }
  if (!form.fiscal_address_line_1.trim()) {
    submitError.value = 'La calle y número fiscal son obligatorios.';
    return;
  }
  if (!form.fiscal_postal_code.trim()) {
    submitError.value = 'El código postal fiscal es obligatorio.';
    return;
  }
  if (!form.fiscal_city.trim()) {
    submitError.value = 'La ciudad fiscal es obligatoria.';
    return;
  }
  if (!form.fiscal_country.trim()) {
    submitError.value = 'El país fiscal es obligatorio.';
    return;
  }
  if (!form.legal_representative_name.trim()) {
    submitError.value = 'El nombre del representante legal es obligatorio.';
    return;
  }
  if (!form.legal_representative_id.trim()) {
    submitError.value = 'El DNI/NIE del representante legal es obligatorio.';
    return;
  }
  if (form.iban.trim() && !isValidIban(form.iban.trim())) {
    submitError.value = 'El IBAN no tiene un formato válido.';
    return;
  }

  emit('submit', {
    company_name: form.company_name.trim(),
    trade_name: form.trade_name.trim(),
    tax_id: form.tax_id.trim(),
    company_email: form.company_email.trim(),
    company_phone: form.company_phone.trim(),
    fiscal_address_line_1: form.fiscal_address_line_1.trim(),
    fiscal_address_line_2: form.fiscal_address_line_2.trim(),
    fiscal_postal_code: form.fiscal_postal_code.trim(),
    fiscal_city: form.fiscal_city.trim(),
    fiscal_province: form.fiscal_province.trim(),
    fiscal_country: form.fiscal_country.trim(),
    legal_representative_name: form.legal_representative_name.trim(),
    legal_representative_id: form.legal_representative_id.trim(),
    legal_representative_role: form.legal_representative_role.trim(),
    iban: form.iban.trim(),
    contract_notes: form.contract_notes.trim()
  });
};

const handleClose = () => {
  if (!props.saving) {
    emit('close');
  }
};
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.field-label {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.field-input,
.field-textarea {
  width: 100%;
  border-radius: 1.1rem;
  border: 1px solid rgb(232 225 216);
  background: linear-gradient(180deg, rgba(252, 250, 247, 0.96), rgba(255, 255, 255, 0.96));
  padding: 0.68rem 0.82rem;
  font-size: 0.8rem;
  color: rgb(15 23 42);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-input:focus,
.field-textarea:focus {
  border-color: rgba(31, 79, 70, 0.45);
  box-shadow: 0 0 0 4px rgba(31, 79, 70, 0.08);
}

.field-textarea {
  resize: vertical;
  min-height: 7rem;
}
</style>
