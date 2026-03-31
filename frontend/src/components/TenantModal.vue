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
                  Formulario reducido a los datos realmente útiles para dar de alta el contrato.
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
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Identidad</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Datos principales</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5">
                      <span class="field-label">Tipo de inquilino</span>
                      <select v-model="form.tenantType" class="field-input">
                        <option v-for="option in tenantTypes" :key="option" :value="option">{{ option }}</option>
                      </select>
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Documento</span>
                      <select v-model="form.identificationType" class="field-input">
                        <option value="">Seleccionar</option>
                        <option v-for="option in identificationTypes" :key="option" :value="option">{{ option }}</option>
                      </select>
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Nombre *</span>
                      <input v-model="form.firstName" type="text" class="field-input" placeholder="Nombre" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Apellido *</span>
                      <input v-model="form.lastName" type="text" class="field-input" placeholder="Apellido" />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Número de identificación *</span>
                      <input v-model="form.identificationNumber" type="text" class="field-input" placeholder="12345678A" />
                    </label>
                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Contacto</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Canales principales</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5">
                      <span class="field-label">Email</span>
                      <input v-model="form.email" type="email" class="field-input" placeholder="inquilino@email.com" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Móvil</span>
                      <input v-model="form.mobile" type="tel" class="field-input" placeholder="612 34 56 78" />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Dirección</span>
                      <input v-model="form.address" type="text" class="field-input" placeholder="Dirección del inquilino" />
                    </label>
                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Contrato</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Unidad y fechas</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-3">
                    <label class="space-y-1.5">
                      <span class="field-label">Unidad *</span>
                      <select v-model="form.unit_id" class="field-input">
                        <option value="">Seleccionar unidad</option>
                        <option v-for="apartment in apartments" :key="apartment.id" :value="String(apartment.id)">
                          {{ apartment.name }}
                        </option>
                      </select>
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Inicio *</span>
                      <input v-model="form.contract_start" type="date" class="field-input" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Fin *</span>
                      <input v-model="form.contract_end" type="date" class="field-input" />
                    </label>
                  </div>
                </section>
              </form>

              <aside class="space-y-4 xl:sticky xl:top-0 xl:self-start">
                <section class="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,251,248,0.94))] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#1f4f46]">Resumen</p>
                  <h4 class="mt-1.5 text-lg font-semibold text-slate-900">{{ draftTenantName }}</h4>
                  <p class="mt-1.5 text-[11px] text-slate-500">{{ summaryIdentity }}</p>

                  <div class="mt-4 grid gap-2.5">
                    <article
                      v-for="item in draftSummary"
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
                <p v-if="submitError" class="text-[11px] font-medium text-rose-600 sm:text-xs">{{ submitError }}</p>
                <p v-else class="text-[11px] text-slate-500 sm:text-xs">Alta mínima y clara. El resto se puede ampliar después si hace falta.</p>
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
                  type="button"
                  class="rounded-full bg-[#1f4f46] px-4 py-2 text-[11px] font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#173c36] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                  :disabled="saving"
                  @click="handleSubmit"
                >
                  {{ saving ? 'Guardando...' : submitLabel }}
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

type TenantFormValues = {
  id?: string;
  unit_id: string;
  full_name: string;
  identification: string;
  contract_start: string;
  contract_end: string;
};

const props = defineProps<{
  visible: boolean;
  apartments: Array<Record<string, unknown>>;
  saving: boolean;
  mode?: 'create' | 'edit';
  initialValues?: TenantFormValues;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: TenantFormValues): void;
  (e: 'close'): void;
}>();

const tenantTypes = ['Individual', 'Empresa'] as const;
const identificationTypes = ['DNI', 'NIE', 'Pasaporte', 'Otro'] as const;

const getDefaultForm = () => ({
  tenantType: 'Individual',
  firstName: '',
  lastName: '',
  identificationType: '',
  identificationNumber: '',
  email: '',
  mobile: '',
  address: '',
  unit_id: '',
  contract_start: '',
  contract_end: ''
});

const form = reactive(getDefaultForm());
const submitError = ref('');

const splitFullName = (value?: string) => {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1]
  };
};

const populateForm = () => {
  const defaults = props.initialValues ?? {};
  const nameParts = splitFullName(defaults.full_name);

  Object.assign(form, getDefaultForm(), {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    identificationNumber: defaults.identification ?? '',
    unit_id: defaults.unit_id ?? '',
    contract_start: defaults.contract_start ?? '',
    contract_end: defaults.contract_end ?? ''
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

const title = computed(() => (props.mode === 'edit' ? 'Editar inquilino' : 'Nuevo inquilino'));
const submitLabel = computed(() => (props.mode === 'edit' ? 'Actualizar inquilino' : 'Guardar inquilino'));
const draftTenantName = computed(() => [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ') || 'Nuevo inquilino');
const summaryIdentity = computed(() => {
  return form.identificationNumber.trim()
    ? `${form.identificationType || 'Identificación'} · ${form.identificationNumber.trim()}`
    : 'Sin identificación completada todavía.';
});

const resolveUnitName = (unitId?: string) => {
  if (!unitId) return 'Sin asignar';
  const apartment = props.apartments.find((item) => String(item.id) === String(unitId));
  return String(apartment?.name ?? 'Unidad no encontrada');
};

const draftSummary = computed(() => [
  {
    label: 'Unidad',
    value: resolveUnitName(form.unit_id),
    detail: 'Unidad asignada al contrato'
  },
  {
    label: 'Fechas',
    value: form.contract_start && form.contract_end ? `${form.contract_start} - ${form.contract_end}` : 'Sin fechas',
    detail: 'Inicio y fin del contrato'
  },
  {
    label: 'Contacto',
    value: form.email.trim() || 'Sin email',
    detail: form.mobile.trim() || 'Sin móvil'
  }
]);

const handleSubmit = () => {
  submitError.value = '';

  if (!form.firstName.trim()) {
    submitError.value = 'El nombre es obligatorio.';
    return;
  }
  if (!form.lastName.trim()) {
    submitError.value = 'El apellido es obligatorio.';
    return;
  }
  if (!form.identificationNumber.trim()) {
    submitError.value = 'La identificación es obligatoria.';
    return;
  }
  if (!form.unit_id) {
    submitError.value = 'La unidad es obligatoria.';
    return;
  }
  if (!form.contract_start || !form.contract_end) {
    submitError.value = 'Debes completar las fechas del contrato.';
    return;
  }
  if (new Date(form.contract_end) < new Date(form.contract_start)) {
    submitError.value = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    return;
  }

  emit('submit', {
    unit_id: form.unit_id,
    full_name: draftTenantName.value,
    identification: form.identificationNumber.trim(),
    contract_start: form.contract_start,
    contract_end: form.contract_end,
    ...(props.initialValues?.id ? { id: props.initialValues.id } : {})
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

.field-input {
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

.field-input:focus {
  border-color: rgba(31, 79, 70, 0.45);
  box-shadow: 0 0 0 4px rgba(31, 79, 70, 0.08);
}
</style>
