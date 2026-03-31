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
          class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold text-white shadow-lg transition"
          :class="canCreateApartment
            ? 'bg-black hover:-translate-y-0.5 hover:bg-slate-800'
            : 'cursor-not-allowed bg-slate-300 shadow-none'"
          data-onboarding="create-property"
          @click="handleCreateApartment"
        >
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 3v10m5-5H3" />
          </svg>
          {{ canCreateApartment ? 'Nuevo apartamento' : 'Necesitas Pro para añadir más' }}
        </button>
      </div>
      <div
        v-if="billingSummary"
        class="mt-6 rounded-[28px] border p-5 shadow-sm"
        :class="isAtLimit
          ? 'border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,247,237,0.98))]'
          : isProPlan
            ? 'border-emerald-200 bg-[linear-gradient(180deg,rgba(240,253,250,0.96),rgba(255,255,255,0.98))]'
            : 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))]'"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                :class="isProPlan ? 'bg-[#1f4f46] text-white' : 'bg-[#f3ede4] text-[#8c4d29]'"
              >
                {{ isProPlan ? 'Plan Pro' : 'Plan gratis' }}
              </span>
              <span
                v-if="isAtLimit"
                class="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800"
              >
                Límite alcanzado
              </span>
              <span
                v-else-if="isNearLimit"
                class="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700"
              >
                Queda poco margen
              </span>
            </div>
            <h2 class="mt-3 text-xl font-semibold text-slate-900">{{ apartmentPlanHeadline }}</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{{ apartmentPlanMessage }}</p>
          </div>
          <div class="min-w-0 lg:w-[320px]">
            <div class="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Uso actual</span>
              <span>{{ billingSummary.usage.unitCount }} / {{ billingSummary.usage.unitLimit }}</span>
            </div>
            <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-white/90">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="isProPlan ? 'bg-[#1f4f46]' : isAtLimit ? 'bg-amber-500' : 'bg-[#c96a37]'"
                :style="{ width: `${billingUsagePercentage}%` }"
              ></div>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button
                v-if="!isProPlan"
                type="button"
                class="rounded-full bg-[#1f4f46] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173c36]"
                @click="router.push('/billing')"
              >
                Ver planes
              </button>
              <button
                v-else
                type="button"
                class="rounded-full border border-[#cfe3dc] bg-white px-4 py-2 text-sm font-semibold text-[#1f4f46] transition hover:border-[#b7d4c9]"
                @click="router.push('/billing')"
              >
                Gestionar Pro
              </button>
            </div>
          </div>
        </div>
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
      <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,320px)] xl:items-start">
        <div class="order-2 space-y-4 xl:order-1">
          <EmptyPropertiesState
            v-if="!hasApartments"
            eyebrow="Propiedades"
            title="Aún no tienes propiedades"
            description="Empieza creando tu primera propiedad para activar el panel."
            cta-label="Crear primera propiedad"
            @action="handleCreateApartment"
          />
          <div v-else-if="filteredApartments.length" class="overflow-hidden rounded-[28px] border border-[#eadfd2] bg-white">
            <div class="hidden border-b border-[#efe7dd] bg-[#fbf8f2] px-4 py-3 md:grid md:grid-cols-[minmax(0,1.75fr)_minmax(140px,0.6fr)_minmax(150px,0.65fr)_minmax(160px,auto)] md:items-center md:gap-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Unidad</p>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Renta</p>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
              <p class="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Acciones</p>
            </div>
            <transition-group
              name="apartment-list"
              tag="div"
              class="divide-y divide-[#efe7dd]"
            >
              <ApartmentRow
                v-for="apartment in filteredApartments"
                :key="apartment.id"
                :apartment="apartment"
                :occupant="getOccupant(apartment.id as string)"
                :derived-status="deriveStatus(apartment)"
                :selected="selectedApartment?.id === apartment.id"
                @detail="handleDetail"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </transition-group>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200/80 bg-slate-50/60 p-6 text-center text-slate-500"
          >
            <p class="text-lg font-semibold text-slate-800">No hay apartamentos que coincidan</p>
            <p class="text-sm">Ajusta los filtros o crea un nuevo apartamento para empezar a ver métricas aquí.</p>
          </div>
        </div>

        <aside ref="detailPanelRef" class="order-1 scroll-mt-24 xl:order-2 xl:sticky xl:top-6">
          <transition name="detail-slide" mode="out-in">
            <article
              v-if="selectedApartment"
              key="selected-apartment"
              class="rounded-[32px] border border-[#ead8ca] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(249,246,240,0.96))] p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Ficha activa</p>
                  <div>
                    <h3 class="text-2xl font-semibold text-slate-900">{{ selectedApartment.name }}</h3>
                    <p class="mt-1 text-sm text-slate-500">{{ selectedApartmentAddress }}</p>
                  </div>
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

              <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Renta mensual</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(selectedApartment.monthly_rent) }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Creado</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(selectedApartment.created_at) }}</p>
                </div>
                <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm sm:col-span-2 xl:col-span-1">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Inquilino</p>
                  <p
                    class="mt-2 text-base font-semibold"
                    :class="selectedApartmentHasTenant ? 'text-emerald-600' : 'text-rose-500'"
                  >
                    {{ selectedApartmentHasTenant ? selectedApartmentOccupant?.full_name ?? '—' : 'Sin asignar' }}
                  </p>
                  <p v-if="selectedApartmentHasTenant" class="mt-1 text-xs text-slate-500">
                    Contrato: {{ selectedApartmentOccupant?.contract_start ?? '—' }} →
                    {{ selectedApartmentOccupant?.contract_end ?? '—' }}
                  </p>
                </div>
              </div>

              <div class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Datos para contratos</p>
                    <p class="mt-2 text-base font-semibold text-slate-900">{{ selectedContractProfileTitle }}</p>
                  </div>
                  <span
                    class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    :class="selectedApartmentHasContractProfile ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ selectedApartmentHasContractProfile ? 'Perfil propio' : 'Fallback general' }}
                  </span>
                </div>
                <div v-if="selectedApartmentHasContractProfile" class="mt-3 space-y-2 text-sm text-slate-600">
                  <p><span class="font-semibold text-slate-900">DNI/NIF:</span> {{ selectedContractProfileIdentification }}</p>
                  <p><span class="font-semibold text-slate-900">Domicilio:</span> {{ selectedContractProfileAddress }}</p>
                </div>
                <p v-else class="mt-3 text-sm leading-6 text-slate-600">
                  Este apartamento todavía no tiene un titular contractual propio. Los PDFs usarán la configuración general del arrendador.
                </p>
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

            <article
              v-else
              key="empty-detail"
              class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/80 p-6 shadow-sm xl:min-h-[320px]"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Ficha del apartamento</p>
              <h3 class="mt-3 text-xl font-semibold text-slate-900">Selecciona una unidad para ver su detalle</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                La ficha queda visible aquí mientras revisas la lista, para comparar sin perder contexto.
              </p>
            </article>
          </transition>
        </aside>
      </div>
    </section>

    <ApartmentModal
      :visible="modalVisible"
      :mode="modalMode"
      :apartment="modalApartment"
      :loading="modalLoading"
      :server-error="modalServerError"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CompactMetricCard from '../components/CompactMetricCard.vue';
import ApartmentFilters from '../components/ApartmentFilters.vue';
import ApartmentRow from '../components/ApartmentRow.vue';
import ApartmentModal from '../components/ApartmentModal.vue';
import { useBilling } from '../composables/useBilling';
import EmptyPropertiesState from '../components/empty-states/EmptyPropertiesState.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { useOnboarding } from '../composables/useOnboarding';
import apiClient from '../services/apiClient';

const router = useRouter();
const {
  summary: billingSummary,
  isPro: isProPlan,
  isAtLimit,
  isNearLimit,
  usagePercentage: billingUsagePercentage,
  loadSummary: loadBillingSummary
} = useBilling();
const apartments = ref<Record<string, unknown>[]>([]);
const tenants = ref<Record<string, unknown>[]>([]);
const filters = reactive<{ search: string; status: string; sort: 'asc' | 'desc' }>({
  search: '',
  status: 'ALL',
  sort: 'asc'
});
const selectedApartment = ref<Record<string, unknown> | null>(null);
const detailPanelRef = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const modalApartment = ref<Record<string, unknown> | null>(null);
const modalLoading = ref(false);
const modalServerError = ref('');
const { completeStep } = useOnboarding();

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

const selectedApartmentAddress = computed(() => {
  const address = String(selectedApartment.value?.address ?? '').trim();
  const city = String(selectedApartment.value?.city ?? '').trim();
  const postalCode = String(selectedApartment.value?.postal_code ?? '').trim();
  const parts = [address, city, postalCode].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Dirección no registrada';
});

const selectedApartmentHasContractProfile = computed(() => {
  const name = String(selectedApartment.value?.contract_landlord_name ?? '').trim();
  const identification = String(selectedApartment.value?.contract_landlord_identification ?? '').trim();
  const address = String(selectedApartment.value?.contract_landlord_address ?? '').trim();
  return Boolean(name && identification && address);
});

const selectedContractProfileTitle = computed(() => {
  const name = String(selectedApartment.value?.contract_landlord_name ?? '').trim();
  return name || 'Configuración general del arrendador';
});

const selectedContractProfileIdentification = computed(() => {
  return String(selectedApartment.value?.contract_landlord_identification ?? '').trim() || '—';
});

const selectedContractProfileAddress = computed(() => {
  return String(selectedApartment.value?.contract_landlord_address ?? '').trim() || '—';
});

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
const hasApartments = computed(() => totalApartments.value > 0);
const canCreateApartment = computed(() => billingSummary.value?.usage.canAddMoreUnits ?? true);

const apartmentPlanHeadline = computed(() => {
  if (!billingSummary.value) return 'Cargando estado del plan.';
  if (isProPlan.value) {
    return 'Tu cartera ya está operando con margen Pro.';
  }
  if (isAtLimit.value) {
    return 'Has agotado la capacidad del plan gratis.';
  }
  if (isNearLimit.value) {
    return 'Estás muy cerca del tope del plan gratis.';
  }
  return 'Todavía estás dentro del plan gratis.';
});

const apartmentPlanMessage = computed(() => {
  if (!billingSummary.value) return 'En cuanto cargue el billing verás el uso y el límite aplicable.';
  const { unitCount, unitLimit, remainingUnits } = billingSummary.value.usage;
  if (isProPlan.value) {
    return `Ahora usas ${unitCount} de ${unitLimit} inmuebles disponibles. Puedes seguir creciendo sin tocar el límite gratis.`;
  }
  if (isAtLimit.value) {
    return `Ya usas ${unitCount} de ${unitLimit} inmuebles. La siguiente alta queda bloqueada hasta activar Pro.`;
  }
  return `Ahora mismo usas ${unitCount} de ${unitLimit} inmuebles y te quedan ${remainingUnits} huecos antes de necesitar Pro.`;
});

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
    const address = String(apartment.address ?? '').toLowerCase();
    const city = String(apartment.city ?? '').toLowerCase();
    const matchesSearch = !keyword || name.includes(keyword) || address.includes(keyword) || city.includes(keyword);
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
  await Promise.all([loadApartments(), loadTenants(), loadBillingSummary({ force: true })]);
};

const handleFilterUpdate = (payload: { search: string; status: string; sort: 'asc' | 'desc' }) => {
  filters.search = payload.search;
  filters.status = payload.status;
  filters.sort = payload.sort;
};

const openModal = (mode: 'create' | 'edit', apartment: Record<string, unknown> | null = null) => {
  modalMode.value = mode;
  modalApartment.value = apartment;
  modalServerError.value = '';
  modalVisible.value = true;
};

const handleCreateApartment = () => {
  if (!canCreateApartment.value) {
    router.push('/billing');
    return;
  }

  openModal('create');
};

const handleModalClose = () => {
  modalVisible.value = false;
  modalApartment.value = null;
  modalServerError.value = '';
};

const handleModalSubmit = async (payload: {
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
}) => {
  modalLoading.value = true;
  modalServerError.value = '';
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
    if (axios.isAxiosError(error)) {
      modalServerError.value =
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : Array.isArray(error.response?.data?.errors)
            ? error.response.data.errors.join(', ')
            : 'No se pudo guardar la propiedad.';
    } else {
      modalServerError.value = 'No se pudo guardar la propiedad.';
    }
  } finally {
    modalLoading.value = false;
  }
};

const handleDetail = async (apartment: Record<string, unknown>) => {
  selectedApartment.value = apartment;
  await nextTick();

  if (window.innerWidth < 1280) {
    detailPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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

watch(
  hasApartments,
  (value) => {
    if (value) completeStep('propertyCreated');
  },
  { immediate: true }
);

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
