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
                <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1f4f46]">Propiedades</p>
                <h3 class="mt-1.5 text-lg font-semibold text-slate-900 sm:text-xl">{{ modalTitle }}</h3>
                <p class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
                  Formulario reducido a los datos necesarios para crear o editar una unidad.
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
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Unidad</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Datos principales</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5">
                      <span class="field-label">Tipo *</span>
                      <select v-model="form.propertyType" class="field-input">
                        <option v-for="option in propertyTypes" :key="option" :value="option">{{ option }}</option>
                      </select>
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">ID *</span>
                      <input v-model="form.identifier" type="text" class="field-input" placeholder="Apartamento 1" />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Dirección *</span>
                      <input v-model="form.address1" type="text" class="field-input" placeholder="C. Escritora Maria Goyri, s/n" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Ciudad *</span>
                      <input v-model="form.city" type="text" class="field-input" placeholder="Córdoba" />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Código postal *</span>
                      <input v-model="form.postalCode" type="text" class="field-input" placeholder="14005" />
                    </label>
                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Alquiler</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Estado y renta</h4>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5">
                      <span class="field-label">Estado</span>
                      <select v-model="form.rentalStatus" class="field-input">
                        <option v-for="option in rentalStatuses" :key="option" :value="option">{{ option }}</option>
                      </select>
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">Alquiler</span>
                      <div class="currency-shell">
                        <span class="currency-prefix">EUR</span>
                        <input v-model="form.rent" type="number" min="0" step="0.01" class="currency-input" placeholder="950" />
                      </div>
                    </label>

                  </div>
                </section>

                <section class="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8c4d29]">Contratos PDF</p>
                    <h4 class="mt-1.5 text-lg font-semibold text-slate-900">Datos del arrendador</h4>
                    <p class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
                      Se usarán en los contratos de esta unidad. Si lo dejas vacío, el sistema seguirá usando la configuración general.
                    </p>
                  </div>

                  <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Nombre o razón social</span>
                      <input
                        v-model="form.contractLandlordName"
                        type="text"
                        class="field-input"
                        placeholder="María López / Inversiones Centro S.L."
                      />
                    </label>

                    <label class="space-y-1.5">
                      <span class="field-label">DNI / NIF</span>
                      <input
                        v-model="form.contractLandlordIdentification"
                        type="text"
                        class="field-input"
                        placeholder="12345678Z"
                      />
                    </label>

                    <label class="space-y-1.5 lg:col-span-2">
                      <span class="field-label">Domicilio</span>
                      <textarea
                        v-model="form.contractLandlordAddress"
                        rows="3"
                        class="field-textarea"
                        placeholder="Calle Real 10, 14001 Córdoba"
                      ></textarea>
                    </label>
                  </div>
                </section>
              </form>

              <aside class="space-y-4 xl:sticky xl:top-0 xl:self-start">
                <section class="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,251,248,0.94))] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#1f4f46]">Resumen</p>
                  <h4 class="mt-1.5 text-lg font-semibold text-slate-900">{{ draftUnitName }}</h4>
                  <p class="mt-1.5 text-[11px] text-slate-500">{{ summaryAddress }}</p>

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
                <p v-if="combinedError" class="text-[11px] font-medium text-rose-600 sm:text-xs">{{ combinedError }}</p>
                <p v-else class="text-[11px] text-slate-500 sm:text-xs">Alta mínima: identificación, ubicación, estado y renta.</p>
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
                  :disabled="loading"
                  type="button"
                  class="rounded-full bg-[#1f4f46] px-4 py-2 text-[11px] font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#173c36] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                  @click="handleSubmit"
                >
                  {{ loading ? 'Guardando...' : primaryLabel }}
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

const props = defineProps<{
  visible: boolean;
  mode: 'create' | 'edit';
  apartment?: Record<string, unknown> | null;
  loading?: boolean;
  serverError?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: {
    id?: string;
    name: string;
    monthly_rent: number;
    status: string;
    address?: string;
    city?: string;
    postal_code?: string;
    contract_landlord_name?: string;
    contract_landlord_identification?: string;
    contract_landlord_address?: string;
  }): void;
}>();

const propertyTypes = [
  'Apartamento',
  'Adosado',
  'Almacén',
  'Casa',
  'Depósito',
  'Espacio comercial',
  'Estudio',
  'Garaje',
  'Habitación',
  'Hotel',
  'Nave industrial',
  'Oficina',
  'Oficina compartida',
  'Estacionamiento',
  'Sótano',
  'Tienda',
  'Trastero',
  'Vivienda unifamiliar',
  'Otro'
] as const;

const rentalStatuses = [
  'Automático',
  'Disponible',
  'Alquilado',
  'Preaviso / Salida',
  'Búsqueda de inquilinos',
  'No Disponible',
  'Refacción'
] as const;

const form = reactive({
  propertyType: 'Apartamento',
  identifier: '',
  address1: '',
  city: '',
  postalCode: '',
  rentalStatus: 'Automático',
  rent: '',
  contractLandlordName: '',
  contractLandlordIdentification: '',
  contractLandlordAddress: ''
});

const submitError = ref('');

const syncForm = () => {
  submitError.value = '';

  form.propertyType = 'Apartamento';
  form.identifier = String(props.apartment?.name ?? '');
  form.address1 = String(props.apartment?.address ?? '');
  form.city = String(props.apartment?.city ?? '');
  form.postalCode = String(props.apartment?.postal_code ?? '');
  form.rentalStatus = mapApiStatusToRentalStatus(String(props.apartment?.status ?? 'AVAILABLE'));
  form.rent = String(props.apartment?.monthly_rent ?? '');
  form.contractLandlordName = String(props.apartment?.contract_landlord_name ?? '');
  form.contractLandlordIdentification = String(props.apartment?.contract_landlord_identification ?? '');
  form.contractLandlordAddress = String(props.apartment?.contract_landlord_address ?? '');
};

watch(
  () => props.visible,
  (value) => {
    if (value) {
      syncForm();
    }
  }
);

watch(
  () => props.apartment,
  () => {
    if (props.visible) {
      syncForm();
    }
  },
  { deep: true }
);

const mapRentalStatusToApi = (value: string) => {
  switch (value) {
    case 'Alquilado':
    case 'Preaviso / Salida':
      return 'OCCUPIED';
    case 'No Disponible':
    case 'Refacción':
      return 'RESERVED';
    default:
      return 'AVAILABLE';
  }
};

const mapApiStatusToRentalStatus = (value: string) => {
  switch (value.toUpperCase()) {
    case 'OCCUPIED':
      return 'Alquilado';
    case 'RESERVED':
      return 'No Disponible';
    default:
      return 'Disponible';
  }
};

const draftUnitName = computed(() => form.identifier.trim() || `${form.propertyType} pendiente`);

const summaryAddress = computed(() => {
  const parts = [form.address1.trim(), form.city.trim(), form.postalCode.trim()].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Sin dirección completada todavía.';
});

const draftSummary = computed(() => [
  {
    label: 'Tipo',
    value: form.propertyType,
    detail: 'Clasificación principal de la unidad'
  },
  {
    label: 'Estado',
    value: form.rentalStatus,
    detail: `Se guardará como ${mapRentalStatusToApi(form.rentalStatus)}`
  },
  {
    label: 'Renta',
    value: form.rent ? `${Number(form.rent).toLocaleString('es-ES')} EUR` : '0 EUR',
    detail: 'Importe mensual actual'
  },
  {
    label: 'Contratos',
    value: form.contractLandlordName.trim() ? form.contractLandlordName.trim() : 'Configuración general',
    detail: form.contractLandlordName.trim() ? 'Perfil específico de este apartamento' : 'Sin perfil propio guardado'
  }
]);

const modalTitle = computed(() => (props.mode === 'edit' ? 'Editar propiedad' : 'Nueva propiedad'));
const primaryLabel = computed(() => (props.mode === 'edit' ? 'Actualizar propiedad' : 'Guardar propiedad'));
const loading = computed(() => props.loading ?? false);
const combinedError = computed(() => submitError.value || props.serverError || '');

const handleClose = () => {
  if (!loading.value) {
    emit('close');
  }
};

const handleSubmit = () => {
  submitError.value = '';

  if (!form.identifier.trim()) {
    submitError.value = 'El ID de la unidad es obligatorio.';
    return;
  }
  if (!form.address1.trim()) {
    submitError.value = 'La dirección principal es obligatoria.';
    return;
  }
  if (!form.city.trim()) {
    submitError.value = 'La ciudad es obligatoria.';
    return;
  }
  if (!form.postalCode.trim()) {
    submitError.value = 'El código postal es obligatorio.';
    return;
  }

  const contractFields = [
    form.contractLandlordName.trim(),
    form.contractLandlordIdentification.trim(),
    form.contractLandlordAddress.trim()
  ];
  const hasAnyContractField = contractFields.some(Boolean);
  const hasAllContractFields = contractFields.every(Boolean);

  if (hasAnyContractField && !hasAllContractFields) {
    submitError.value = 'Completa nombre, DNI/NIF y domicilio del arrendador o deja los tres vacíos.';
    return;
  }

  emit('submit', {
    id: props.apartment?.id as string | undefined,
    name: draftUnitName.value,
    monthly_rent: Number(form.rent || 0),
    status: mapRentalStatusToApi(form.rentalStatus),
    address: form.address1.trim() || undefined,
    city: form.city.trim() || undefined,
    postal_code: form.postalCode.trim() || undefined,
    contract_landlord_name: form.contractLandlordName.trim() || undefined,
    contract_landlord_identification: form.contractLandlordIdentification.trim() || undefined,
    contract_landlord_address: form.contractLandlordAddress.trim() || undefined
  });
};
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.field-label {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.field-input,
.field-textarea {
  width: 100%;
  border-radius: 1.2rem;
  border: 1px solid rgb(232 225 216);
  background: linear-gradient(180deg, rgba(252, 250, 247, 0.96), rgba(255, 255, 255, 0.96));
  padding: 0.7rem 0.9rem;
  font-size: 0.82rem;
  color: rgb(15 23 42);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-textarea {
  min-height: 6rem;
  resize: vertical;
}

.field-input:focus,
.field-textarea:focus,
.currency-input:focus {
  border-color: rgba(31, 79, 70, 0.45);
  box-shadow: 0 0 0 4px rgba(31, 79, 70, 0.08);
}

.currency-shell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 1.2rem;
  border: 1px solid rgb(232 225 216);
  background: linear-gradient(180deg, rgba(252, 250, 247, 0.96), rgba(255, 255, 255, 0.96));
  padding: 0.65rem 0.9rem;
}

.currency-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgb(241 245 249);
  padding: 0.3rem 0.55rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgb(100 116 139);
  text-transform: uppercase;
}

.currency-input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  font-size: 0.82rem;
  color: rgb(15 23 42);
  outline: none;
}
</style>
