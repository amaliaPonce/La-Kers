<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
          @click="handleClose"
        ></div>
        <div
          class="relative w-full max-w-2xl transform rounded-3xl bg-white p-6 shadow-2xl transition-transform duration-300"
          @click.stop
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Apartamento</p>
              <h3 class="text-2xl font-semibold text-slate-900">{{ modalTitle }}</h3>
            </div>
            <button
              type="button"
              class="text-slate-400 transition hover:text-slate-600"
              @click="handleClose"
              aria-label="Cerrar modal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-sm text-slate-500">Define la información base y controla el estado en segundos.</p>
          <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="text-sm font-semibold text-slate-600">
                Nombre
                <input
                  v-model="localForm.name"
                  type="text"
                  required
                  class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition focus:border-primary focus:ring focus:ring-primary/50"
                />
              </label>
              <label class="text-sm font-semibold text-slate-600">
                Renta mensual
                <input
                  v-model.number="localForm.monthly_rent"
                  type="number"
                  min="0"
                  step="10"
                  required
                  class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition focus:border-primary focus:ring focus:ring-primary/50"
                />
              </label>
            </div>
            <label class="flex flex-col text-sm font-semibold text-slate-600">
              Estado
              <select
                v-model="localForm.status"
                class="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition focus:border-primary focus:ring focus:ring-primary/50"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                @click="handleClose"
              >
                Cancelar
              </button>
              <button
                :disabled="loading"
                type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-600"
              >
                <span>{{ loading ? 'Guardando...' : primaryLabel }}</span>
                <svg v-if="!loading" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
  mode: 'create' | 'edit';
  apartment?: Record<string, unknown> | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { id?: string; name: string; monthly_rent: number; status: string }): void;
}>();

const statusOptions = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'OCCUPIED', label: 'Ocupado' },
  { value: 'RESERVED', label: 'Reservado' }
];

const localForm = reactive({
  name: '',
  monthly_rent: 0,
  status: 'AVAILABLE'
});

const resetForm = () => {
  localForm.name = '';
  localForm.monthly_rent = 0;
  localForm.status = 'AVAILABLE';
};

const syncForm = () => {
  if (props.apartment) {
    localForm.name = String(props.apartment.name ?? '');
    localForm.monthly_rent = Number(props.apartment.monthly_rent ?? 0);
    localForm.status = (props.apartment.status as string) ?? 'AVAILABLE';
    return;
  }
  resetForm();
};

watch(
  () => props.apartment,
  () => {
    if (props.visible) {
      syncForm();
    }
  },
  { immediate: true }
);

watch(
  () => props.visible,
  (value) => {
    if (value && props.apartment) {
      syncForm();
    }
    if (!value) {
      resetForm();
    }
  }
);

const modalTitle = computed(() => (props.mode === 'edit' ? 'Actualizar apartamento' : 'Nuevo apartamento'));
const primaryLabel = computed(() => (props.mode === 'edit' ? 'Actualizar' : 'Guardar'));
const loading = computed(() => props.loading ?? false);

const handleClose = () => emit('close');
const handleSubmit = () => {
  emit('submit', {
    id: props.apartment?.id as string | undefined,
    name: localForm.name,
    monthly_rent: localForm.monthly_rent,
    status: localForm.status
  });
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
