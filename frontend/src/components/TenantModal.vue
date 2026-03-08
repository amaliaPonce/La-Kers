<template>
  <transition name="fade-scale">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6"
      aria-modal="true"
      role="dialog"
    >
      <div class="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
        <header class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-slate-400">{{ headerLabel }}</p>
            <h3 class="text-xl font-semibold text-slate-900">{{ title }}</h3>
            <p class="text-sm text-slate-500">{{ subtext }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
            @click="handleClose"
          >
            ✕
          </button>
        </header>
        <form class="space-y-4 px-6 py-6" @submit.prevent="handleSubmit">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Apartamento</label>
              <select
                v-model="internalForm.unit_id"
                class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                required
              >
                <option value="" disabled>Seleccionar unidad</option>
                <option v-for="apartment in apartments" :key="apartment.id" :value="apartment.id">
                  {{ apartment.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Nombre completo</label>
              <input
                v-model="internalForm.full_name"
                type="text"
                class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                placeholder="Ej. Andrea López"
                required
              />
            </div>
            <div>
              <label class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">DNI / identificación</label>
              <input
                v-model="internalForm.identification"
                type="text"
                class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                placeholder="Ej. 12345678"
                required
              />
            </div>
            <div>
              <label class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Inicio contrato</label>
              <input
                v-model="internalForm.contract_start"
                type="date"
                class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Fin contrato</label>
              <input
                v-model="internalForm.contract_end"
                type="date"
                class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              @click="handleClose"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="saving"
            >
              {{ saving ? 'Guardando...' : submitLabel }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

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

const headerLabel = computed(() => (props.mode === 'edit' ? 'Editar' : 'Nuevo'));
const title = computed(() => (props.mode === 'edit' ? 'Actualizar datos del inquilino' : 'Registrar nuevo contrato'));
const subtext = computed(() =>
  props.mode === 'edit'
    ? 'Ajusta los detalles del contrato y confirma los datos obligatorios.'
    : 'Completa los campos para registrar el inquilino en la unidad seleccionada.'
);
const submitLabel = computed(() => (props.mode === 'edit' ? 'Actualizar inquilino' : 'Guardar inquilino'));

const getDefaultForm = (): TenantFormValues => ({
  unit_id: '',
  full_name: '',
  identification: '',
  contract_start: '',
  contract_end: ''
});

const internalForm = reactive<TenantFormValues>(getDefaultForm());

const populateForm = () => {
  const defaults = props.initialValues ?? {};
  Object.assign(internalForm, {
    ...getDefaultForm(),
    unit_id: defaults.unit_id ?? '',
    full_name: defaults.full_name ?? '',
    identification: defaults.identification ?? '',
    contract_start: defaults.contract_start ?? '',
    contract_end: defaults.contract_end ?? ''
  });
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      populateForm();
    } else {
      Object.assign(internalForm, getDefaultForm());
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

const handleSubmit = () => {
  emit('submit', {
    ...internalForm,
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
</style>
