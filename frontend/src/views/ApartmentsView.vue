<template>
  <div class="space-y-8 pb-6">
    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Control de unidades</p>
          <h1 class="text-3xl font-semibold text-slate-900">Apartamentos</h1>
          <p class="text-sm text-slate-500">Métricas clave y rentas consolidadas para tener el pulso de tu portafolio.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          @click="openModal('create')"
        >
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 3v10m5-5H3" />
          </svg>
          Nuevo apartamento
        </button>
      </div>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <CompactMetricCard
          label="Disponibles"
          :value="statusSummary.AVAILABLE"
          accent="emerald"
          subtext="Listas para nuevos contratos"
        />
        <CompactMetricCard
          label="Ocupados"
          :value="statusSummary.OCCUPIED"
          accent="rose"
          subtext="Ingresos activos"
        />
        <CompactMetricCard
          label="Renta mensual potencial"
          :value="formatCurrency(monthlyPotential)"
          accent="blue"
          subtext="Suma de todas las unidades"
        />
        <CompactMetricCard
          label="Renta mensual activa"
          :value="formatCurrency(monthlyActive)"
          accent="emerald"
          subtext="Solo apartamentos ocupados"
        />
      </div>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">Lista principal</p>
          <h2 class="text-2xl font-semibold text-slate-900">Gestión de apartamentos</h2>
          <p class="text-sm text-slate-500">Filtra, ordena y dispara acciones rápidas con una interfaz clara.</p>
        </div>
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Total {{ totalApartments }}</span>
      </div>
      <div class="mt-4">
        <ApartmentFilters @update="handleFilterUpdate" />
      </div>
      <div class="mt-6 space-y-4">
        <transition-group
          v-if="filteredApartments.length"
          name="apartment-list"
          tag="div"
          class="space-y-4"
        >
          <ApartmentRow
            v-for="apartment in filteredApartments"
            :key="apartment.id"
            :apartment="apartment"
            :occupant="getOccupant(apartment.id as string)"
            :derived-status="deriveStatus(apartment)"
            @detail="handleDetail"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </transition-group>
        <div
          v-else
          class="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200/80 bg-slate-50/60 p-6 text-center text-slate-500"
        >
          <p class="text-lg font-semibold text-slate-800">No hay apartamentos que coincidan</p>
          <p class="text-sm">Ajusta los filtros o crea un nuevo apartamento para empezar a ver métricas aquí.</p>
        </div>
        <transition name="detail-slide">
          <article
            v-if="selectedApartment"
            class="rounded-3xl border border-slate-100 bg-slate-50/60 p-5 shadow-lg"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">Detalle seleccionado</p>
                <h3 class="text-xl font-semibold text-slate-900">{{ selectedApartment.name }}</h3>
              </div>
              <div class="flex items-center gap-2">
                <StatusBadge :status="selectedDerivedStatus" />
                <button
                  type="button"
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  @click="closeDetail"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div class="mt-5 grid gap-6 md:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">Renta mensual</p>
                <p class="text-2xl font-semibold text-slate-900">{{ formatCurrency(selectedApartment.monthly_rent) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">Creado</p>
                <p class="text-base font-semibold text-slate-900">{{ formatDate(selectedApartment.created_at) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">Inquilino asignado</p>
                <p
                  class="text-base font-semibold"
                  :class="selectedApartmentHasTenant ? 'text-emerald-600' : 'text-rose-500'"
                >
                  {{ selectedApartmentHasTenant ? selectedApartmentOccupant?.full_name ?? '—' : 'No' }}
                </p>
                <p v-if="selectedApartmentHasTenant" class="text-xs text-slate-500">
                  Contrato: {{ selectedApartmentOccupant?.contract_start ?? '—' }} →
                  {{ selectedApartmentOccupant?.contract_end ?? '—' }}
                </p>
              </div>
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                @click="handleEdit(selectedApartment)"
              >
                Editar
              </button>
              <button
                type="button"
                class="rounded-2xl border border-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                @click="handleDelete(selectedApartment)"
              >
                Eliminar
              </button>
            </div>
          </article>
        </transition>
      </div>
    </section>

    <ApartmentModal
      :visible="modalVisible"
      :mode="modalMode"
      :apartment="modalApartment"
      :loading="modalLoading"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import CompactMetricCard from '../components/CompactMetricCard.vue';
import ApartmentFilters from '../components/ApartmentFilters.vue';
import ApartmentRow from '../components/ApartmentRow.vue';
import ApartmentModal from '../components/ApartmentModal.vue';
import StatusBadge from '../components/StatusBadge.vue';
import apiClient from '../services/apiClient';

const apartments = ref<Record<string, unknown>[]>([]);
const tenants = ref<Record<string, unknown>[]>([]);
const filters = reactive<{ search: string; status: string; sort: 'asc' | 'desc' }>({
  search: '',
  status: 'ALL',
  sort: 'asc'
});
const selectedApartment = ref<Record<string, unknown> | null>(null);
const modalVisible = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const modalApartment = ref<Record<string, unknown> | null>(null);
const modalLoading = ref(false);

const statusOptions = ['AVAILABLE', 'OCCUPIED', 'RESERVED'] as const;
type ApartmentStatus = (typeof statusOptions)[number];

const tenantsByUnit = computed(() => {
  return tenants.value.reduce<Record<string, Record<string, unknown>[]>>((acc, tenant) => {
    const unitId = String(tenant.unit_id ?? '');
    if (!unitId) return acc;
    acc[unitId] = acc[unitId] ?? [];
    acc[unitId].push(tenant);
    return acc;
  }, {});
});

const hasTenantForUnit = (id?: string | null) => {
  if (!id) return false;
  return Boolean(tenantsByUnit.value[id]?.length);
};

const getOccupant = (id?: string | null) => {
  if (!id) return null;
  return tenantsByUnit.value[id]?.[0] ?? null;
};

const normalizeApartmentStatus = (value: unknown): ApartmentStatus | null => {
  const normalized = String(value ?? '').toUpperCase();
  return statusOptions.includes(normalized as ApartmentStatus) ? (normalized as ApartmentStatus) : null;
};

const deriveStatus = (apartment: Record<string, unknown>): ApartmentStatus => {
  const assigned = hasTenantForUnit(apartment.id as string | null);
  if (assigned) {
    return 'OCCUPIED';
  }

  const storedStatus = normalizeApartmentStatus(apartment.status);
  return storedStatus ?? 'AVAILABLE';
};

const selectedApartmentOccupant = computed(() => {
  return getOccupant(selectedApartment.value?.id as string | null);
});

const selectedApartmentHasTenant = computed(() => Boolean(selectedApartmentOccupant.value));

const selectedDerivedStatus = computed(
  () => (selectedApartment.value ? deriveStatus(selectedApartment.value) : 'AVAILABLE')
);

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'short',
  day: '2-digit'
});

const formatCurrency = (value: unknown) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return currencyFormatter.format(0);
  return currencyFormatter.format(amount);
};

const formatDate = (value: unknown) => {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
};

const statusSummary = computed(() => {
  return apartments.value.reduce(
    (acc, apartment) => {
      const status = deriveStatus(apartment);
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {
      AVAILABLE: 0,
      OCCUPIED: 0,
      RESERVED: 0
    } as Record<ApartmentStatus, number>
  );
});

const totalApartments = computed(() => apartments.value.length);

const monthlyPotential = computed(() => {
  return apartments.value.reduce((total, apartment) => {
    return total + Number(apartment.monthly_rent ?? 0);
  }, 0);
});

const monthlyActive = computed(() => {
  return apartments.value.reduce((total, apartment) => {
    if (deriveStatus(apartment) === 'OCCUPIED') {
      return total + Number(apartment.monthly_rent ?? 0);
    }
    return total;
  }, 0);
});

const filteredApartments = computed(() => {
  const keyword = filters.search.trim().toLowerCase();
  const targetStatus = filters.status;
  const sortOrder = filters.sort;

  const filtered = apartments.value.filter((apartment) => {
    const derivedStatusValue = deriveStatus(apartment);
    const matchesStatus = targetStatus === 'ALL' || derivedStatusValue === targetStatus;
    const name = String(apartment.name ?? '').toLowerCase();
    const description = String(apartment.description ?? '').toLowerCase();
    const matchesSearch = !keyword || name.includes(keyword) || description.includes(keyword);
    return matchesStatus && matchesSearch;
  });

  return filtered.sort((a, b) => {
    const aRent = Number(a.monthly_rent ?? 0);
    const bRent = Number(b.monthly_rent ?? 0);
    if (sortOrder === 'asc') return aRent - bRent;
    return bRent - aRent;
  });
});

const loadTenants = async () => {
  try {
    const { data } = await apiClient.get('/tenants');
    tenants.value = data ?? [];
  } catch (error) {
    console.error(error);
  }
};

const loadApartments = async () => {
  try {
    const { data } = await apiClient.get('/apartments');
    apartments.value = data ?? [];
    refreshSelection();
  } catch (error) {
    console.error(error);
  }
};

const refreshSelection = () => {
  if (!selectedApartment.value) return;
  const refreshed = apartments.value.find((apartment) => apartment.id === selectedApartment.value?.id);
  selectedApartment.value = refreshed ?? null;
};

const refreshData = async () => {
  await Promise.all([loadApartments(), loadTenants()]);
};

const handleFilterUpdate = (payload: { search: string; status: string; sort: 'asc' | 'desc' }) => {
  filters.search = payload.search;
  filters.status = payload.status;
  filters.sort = payload.sort;
};

const openModal = (mode: 'create' | 'edit', apartment: Record<string, unknown> | null = null) => {
  modalMode.value = mode;
  modalApartment.value = apartment;
  modalVisible.value = true;
};

const handleModalClose = () => {
  modalVisible.value = false;
  modalApartment.value = null;
};

const handleModalSubmit = async (payload: { id?: string; name: string; monthly_rent: number; status: string }) => {
  modalLoading.value = true;
  try {
    if (modalMode.value === 'create') {
      await apiClient.post('/apartments', payload);
    } else if (payload.id) {
      await apiClient.put(`/apartments/${payload.id}`, payload);
    }
    modalVisible.value = false;
    await refreshData();
  } catch (error) {
    console.error(error);
  } finally {
    modalLoading.value = false;
  }
};

const handleDetail = (apartment: Record<string, unknown>) => {
  selectedApartment.value = apartment;
};

const handleEdit = (apartment: Record<string, unknown>) => {
  openModal('edit', apartment);
};

const handleDelete = async (apartment: Record<string, unknown>) => {
  if (!apartment.id) return;
  const confirmed = window.confirm('¿Deseas eliminar este apartamento?');
  if (!confirmed) return;

  try {
    await apiClient.delete(`/apartments/${apartment.id}`);
    if (selectedApartment.value?.id === apartment.id) {
      selectedApartment.value = null;
    }
    await refreshData();
  } catch (error) {
    console.error(error);
  }
};

const closeDetail = () => {
  selectedApartment.value = null;
};

onMounted(() => {
  refreshData().catch((error) => console.error(error));
});
</script>

<style scoped>
.apartment-list-enter-active,
.apartment-list-leave-active {
  transition: all 0.25s ease;
}
.apartment-list-enter-from,
.apartment-list-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.99);
}
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
