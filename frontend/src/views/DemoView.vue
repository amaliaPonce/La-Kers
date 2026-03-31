<template>
  <div class="landing-shell relative overflow-hidden bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.12),_transparent_32%),radial-gradient(circle_at_80%_10%,_rgba(15,118,110,0.08),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(248,245,239,0))]"></div>

    <header class="relative z-10 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <router-link to="/" class="landing-brand flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
          <img :src="brandLogo" alt="La-Kers" class="h-16 w-auto object-contain drop-shadow-[0_10px_24px_rgba(31,79,70,0.12)]" />
          <span class="hidden text-sm font-semibold uppercase tracking-[0.24em] text-[#1f4f46] sm:inline">Demo</span>
        </router-link>

        <nav class="flex flex-wrap items-center gap-3 text-sm sm:justify-end">
          <router-link
            to="/"
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Volver a inicio
          </router-link>
          <router-link
            to="/sign-up"
            class="rounded-full bg-[#c96a37] px-4 py-2 text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
          >
            Crear cuenta
          </router-link>
        </nav>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section class="space-y-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1f4f46]">Demo del producto</p>
        <h1 class="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
          Explora la estructura del panel antes de entrar.
        </h1>
        <p class="max-w-3xl text-lg leading-8 text-slate-600">
          Cambia entre propiedades, inquilinos y pagos. Selecciona una fila y verás la ficha lateral con acciones rápidas.
        </p>
      </section>

      <section class="rounded-[40px] border border-[#d8ddd8] bg-[linear-gradient(180deg,#f6f7f3_0%,#efede6_100%)] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-6">
        <div class="overflow-hidden rounded-[32px] border border-[#d7ddd8] bg-[#f8f5ef] shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div class="border-b border-[#e7e0d6] bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-center gap-3">
                <img :src="brandLogo" alt="La-Kers" class="h-11 w-auto object-contain drop-shadow-[0_8px_18px_rgba(31,79,70,0.08)]" />
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Zona autenticada</p>
                  <h2 class="mt-1 text-xl font-semibold text-slate-900">{{ landingDemoConfig.title }}</h2>
                  <p class="text-sm text-slate-500">{{ landingDemoConfig.subtitle }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="view in landingDemoViews"
                  :key="view.id"
                  type="button"
                  class="rounded-full px-4 py-2 text-sm font-semibold transition"
                  :class="landingDemoView === view.id
                    ? 'bg-[#1f4f46] text-white shadow-md shadow-[#1f4f46]/15'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                  @click="selectLandingDemoView(view.id)"
                >
                  {{ view.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div class="border-b border-[#e7e0d6] bg-white xl:border-r xl:border-b-0">
              <div class="hidden border-b border-[#efe7dd] bg-[#fbf8f2] px-4 py-3 md:grid md:items-center md:gap-4" :class="landingDemoConfig.headerGrid">
                <p
                  v-for="column in landingDemoConfig.columns"
                  :key="column"
                  class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
                  :class="column === 'Acciones' ? 'text-right' : ''"
                >
                  {{ column }}
                </p>
              </div>

              <div class="divide-y divide-[#efe7dd]">
                <article
                  v-for="row in landingDemoRows"
                  :key="row.id"
                  class="cursor-pointer px-4 py-4 transition-colors"
                  :class="landingDemoSelectedId === row.id ? 'bg-[#fff8f3]' : 'bg-white hover:bg-[#fbf8f2]'"
                  @click="selectLandingDemoRow(row.id)"
                >
                  <div v-if="landingDemoView === 'apartments'" class="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(140px,0.6fr)_minmax(150px,0.65fr)] md:items-center">
                    <div class="space-y-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-[15px] font-semibold leading-5 text-slate-900">{{ row.name }}</p>
                        <span
                          v-if="landingDemoSelectedId === row.id"
                          class="inline-flex items-center rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c4d29]"
                        >
                          Activo
                        </span>
                      </div>
                      <p class="text-xs text-slate-400">{{ row.address }}</p>
                      <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inquilino</span>
                        <p class="text-sm font-semibold text-slate-700">{{ row.occupant }}</p>
                      </div>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Renta</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ row.rent }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
                      <div class="mt-1">
                        <StatusBadge :status="row.status" />
                      </div>
                    </div>
                  </div>

                  <div v-else-if="landingDemoView === 'tenants'" class="grid gap-4 md:grid-cols-[minmax(0,1.8fr)_minmax(220px,1fr)_minmax(120px,0.7fr)] md:items-center">
                    <div class="space-y-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-[15px] font-semibold leading-5 text-slate-900">{{ row.fullName }}</p>
                        <span
                          v-if="landingDemoSelectedId === row.id"
                          class="inline-flex items-center rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c4d29]"
                        >
                          Activo
                        </span>
                      </div>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span>DNI: {{ row.identification }}</span>
                        <span class="hidden text-slate-300 md:inline">•</span>
                        <span class="font-medium text-slate-500">{{ row.apartment }}</span>
                      </div>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Contrato</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ row.start }} → {{ row.end }}</p>
                      <p class="mt-1 text-xs text-slate-400">{{ row.daysLabel }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
                      <div class="mt-1">
                        <TenantStatusBadge :status="row.status" />
                      </div>
                    </div>
                  </div>

                  <div v-else class="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(160px,0.8fr)_minmax(220px,1fr)] md:items-center">
                    <div class="space-y-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-[15px] font-semibold leading-5 text-slate-900">{{ row.tenant }}</p>
                        <span
                          v-if="landingDemoSelectedId === row.id"
                          class="inline-flex items-center rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c4d29]"
                        >
                          Activo
                        </span>
                      </div>
                      <p class="text-xs text-slate-400">{{ row.apartment }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Periodo</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ row.month }}</p>
                      <p class="mt-1 text-xs text-slate-400">Vence {{ row.dueLabel }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
                      <div class="mt-1 flex flex-wrap items-center gap-2">
                        <PaymentStatusBadge :status="row.status" />
                        <span class="text-sm font-semibold text-slate-900">{{ row.amount }}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <aside class="bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(249,246,240,0.96))] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Ficha activa</p>

              <template v-if="landingDemoView === 'apartments'">
                <div class="mt-4 space-y-4">
                  <div>
                    <h3 class="text-2xl font-semibold text-slate-900">{{ landingDemoSelectedRow.name }}</h3>
                    <p class="mt-1 text-sm text-slate-500">{{ landingDemoSelectedRow.address }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Renta</p>
                    <p class="mt-2 text-2xl font-semibold text-slate-900">{{ landingDemoSelectedRow.rent }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Inquilino</p>
                    <p class="mt-2 text-base font-semibold text-slate-900">{{ landingDemoSelectedRow.occupant }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
                    <div class="mt-2">
                      <StatusBadge :status="landingDemoSelectedRow.status" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="landingDemoView === 'tenants'">
                <div class="mt-4 space-y-4">
                  <div>
                    <h3 class="text-2xl font-semibold text-slate-900">{{ landingDemoSelectedRow.fullName }}</h3>
                    <p class="mt-1 text-sm text-slate-500">DNI: {{ landingDemoSelectedRow.identification }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Apartamento</p>
                    <p class="mt-2 text-base font-semibold text-slate-900">{{ landingDemoSelectedRow.apartment }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Contrato</p>
                    <p class="mt-2 text-base font-semibold text-slate-900">{{ landingDemoSelectedRow.start }} → {{ landingDemoSelectedRow.end }}</p>
                    <p class="mt-1 text-sm text-slate-500">{{ landingDemoSelectedRow.daysLabel }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
                    <div class="mt-2">
                      <TenantStatusBadge :status="landingDemoSelectedRow.status" />
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="rounded-full bg-[#1f4f46] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173c36]"
                      @click="runLandingDemoPrimaryAction"
                    >
                      {{ landingDemoConfig.primaryAction }}
                    </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="mt-4 space-y-4">
                  <div>
                    <h3 class="text-2xl font-semibold text-slate-900">{{ landingDemoSelectedRow.tenant }}</h3>
                    <p class="mt-1 text-sm text-slate-500">{{ landingDemoSelectedRow.apartment }} · {{ landingDemoSelectedRow.month }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Importe</p>
                    <p class="mt-2 text-2xl font-semibold text-slate-900">{{ landingDemoSelectedRow.amount }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
                    <div class="mt-2">
                      <PaymentStatusBadge :status="landingDemoSelectedRow.status" />
                    </div>
                    <p class="mt-2 text-sm text-slate-500">Método: {{ landingDemoSelectedRow.method }}</p>
                  </div>
                  <div class="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Vencimiento</p>
                    <p class="mt-2 text-base font-semibold text-slate-900">{{ landingDemoSelectedRow.dueLabel }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="rounded-full bg-[#1f4f46] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173c36]"
                      @click="runLandingDemoPrimaryAction"
                    >
                      {{ landingDemoConfig.primaryAction }}
                    </button>
                  </div>
                </div>
              </template>

              <div class="mt-5 rounded-2xl border border-[#d9cdbc] bg-[#fbf8f2] p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Movimiento de demo</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ landingDemoEvent }}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import brandLogo from '../assets/logo.png';
import StatusBadge from '../components/StatusBadge.vue';
import TenantStatusBadge from '../components/TenantStatusBadge.vue';
import PaymentStatusBadge from '../components/PaymentStatusBadge.vue';

const landingDemoViews = [
  { id: 'apartments', label: 'Propiedades' },
  { id: 'tenants', label: 'Inquilinos' },
  { id: 'payments', label: 'Pagos' }
];

const createLandingDemoState = () => ({
  apartments: [
    {
      id: 'apt-1',
      name: 'Apartamento 4',
      address: 'C. Maestre Escuela, 61',
      occupant: 'Sin inquilino asignado',
      rent: '490,00 € / mes',
      status: 'AVAILABLE'
    },
    {
      id: 'apt-2',
      name: 'Apartamento 1',
      address: 'C. Maestre Escuela, 61',
      occupant: 'Amalia Ponce Toledo',
      rent: '490,00 € / mes',
      status: 'OCCUPIED'
    },
    {
      id: 'apt-3',
      name: 'Apartamento 2',
      address: 'C. Maestre Escuela, 61',
      occupant: 'Lucía Roldán',
      rent: '530,00 € / mes',
      status: 'OCCUPIED'
    }
  ],
  tenants: [
    {
      id: 'tenant-1',
      fullName: 'Amalia Ponce Toledo',
      identification: '45736597Q',
      apartment: 'Apartamento 1',
      start: '01 mar 2026',
      end: '01 mar 2027',
      daysLabel: 'Faltan 339 días',
      status: 'ACTIVO'
    },
    {
      id: 'tenant-2',
      fullName: 'Lucía Roldán',
      identification: '52918473M',
      apartment: 'Apartamento 2',
      start: '15 ene 2026',
      end: '15 ene 2027',
      daysLabel: 'Faltan 293 días',
      status: 'ACTIVO'
    },
    {
      id: 'tenant-3',
      fullName: 'Javier Mena',
      identification: '31856420B',
      apartment: 'Estudio 3A',
      start: '01 oct 2025',
      end: '01 abr 2026',
      daysLabel: 'Vence en 5 días',
      status: 'PRÓXIMO A VENCER'
    }
  ],
  payments: [
    {
      id: 'payment-1',
      tenant: 'Amalia Ponce Toledo',
      apartment: 'Apartamento 1',
      month: 'Marzo 2026',
      amount: '490,00 €',
      dueLabel: '05 mar 2026',
      method: 'Pendiente',
      status: 'PENDING'
    },
    {
      id: 'payment-2',
      tenant: 'Lucía Roldán',
      apartment: 'Apartamento 2',
      month: 'Marzo 2026',
      amount: '530,00 €',
      dueLabel: '03 mar 2026',
      method: 'Pendiente',
      status: 'LATE'
    },
    {
      id: 'payment-3',
      tenant: 'Javier Mena',
      apartment: 'Estudio 3A',
      month: 'Marzo 2026',
      amount: '450,00 €',
      dueLabel: '01 mar 2026',
      method: 'Banco',
      status: 'PAID'
    }
  ]
});

const landingDemoView = ref('apartments');
const landingDemoState = ref(createLandingDemoState());
const landingDemoSelected = ref({
  apartments: 'apt-1',
  tenants: 'tenant-1',
  payments: 'payment-1'
});
const landingDemoEvent = ref('La demo arranca en Propiedades. Selecciona una fila para ver su ficha.');

const landingDemoConfig = computed(() => {
  const selectedRow = landingDemoSelectedRow.value;

  if (landingDemoView.value === 'tenants') {
    return {
      title: 'Inquilinos',
      subtitle: 'Seguimiento de contratos activos.',
      columns: ['Inquilino', 'Contrato', 'Estado'],
      headerGrid: 'md:grid-cols-[minmax(0,1.8fr)_minmax(220px,1fr)_minmax(120px,0.7fr)]',
      primaryAction: selectedRow?.status === 'ARCHIVADO' ? 'Descargar contrato' : 'Finalizar contrato'
    };
  }

  if (landingDemoView.value === 'payments') {
    return {
      title: 'Pagos',
      subtitle: 'Cobros del mes y estado actual.',
      columns: ['Inquilino', 'Periodo', 'Estado'],
      headerGrid: 'md:grid-cols-[minmax(0,1.5fr)_minmax(160px,0.8fr)_minmax(220px,1fr)]',
      primaryAction: selectedRow?.status === 'PAID' ? 'Generar recibo' : 'Marcar como pagado'
    };
  }

  return {
    title: 'Propiedades',
    subtitle: 'Inventario y estado de cada unidad.',
    columns: ['Unidad', 'Renta', 'Estado'],
    headerGrid: 'md:grid-cols-[minmax(0,1.7fr)_minmax(140px,0.6fr)_minmax(150px,0.65fr)]',
    primaryAction: 'Abrir edición'
  };
});

const landingDemoRows = computed(() => landingDemoState.value[landingDemoView.value]);
const landingDemoSelectedId = computed(() => landingDemoSelected.value[landingDemoView.value]);
const landingDemoSelectedRow = computed(
  () => landingDemoRows.value.find((row) => row.id === landingDemoSelectedId.value) ?? landingDemoRows.value[0]
);

const selectLandingDemoView = (viewId) => {
  landingDemoView.value = viewId;
  landingDemoEvent.value =
    viewId === 'apartments'
      ? 'Vista cambiada a Propiedades.'
      : viewId === 'tenants'
        ? 'Vista cambiada a Inquilinos.'
        : 'Vista cambiada a Pagos.';
};

const selectLandingDemoRow = (rowId) => {
  landingDemoSelected.value = {
    ...landingDemoSelected.value,
    [landingDemoView.value]: rowId
  };

  const selectedRow = landingDemoRows.value.find((row) => row.id === rowId);
  if (!selectedRow) return;

  landingDemoEvent.value =
    landingDemoView.value === 'apartments'
      ? `Ficha abierta para ${selectedRow.name}.`
      : landingDemoView.value === 'tenants'
        ? `Ficha abierta para ${selectedRow.fullName}.`
        : `Ficha abierta para el pago de ${selectedRow.tenant}.`;
};

const runLandingDemoPrimaryAction = () => {
  const selectedRow = landingDemoSelectedRow.value;
  if (!selectedRow) return;

  if (landingDemoView.value === 'apartments') {
    landingDemoEvent.value = `Se abriría la edición de ${selectedRow.name}.`;
    return;
  }

  if (landingDemoView.value === 'tenants') {
    if (selectedRow.status !== 'ARCHIVADO') {
      selectedRow.status = 'ARCHIVADO';
      selectedRow.daysLabel = 'Contrato archivado';
      landingDemoEvent.value = `El contrato de ${selectedRow.fullName} quedó archivado en la demo.`;
      return;
    }

    landingDemoEvent.value = `Se descargaría el PDF contractual de ${selectedRow.fullName}.`;
    return;
  }

  if (selectedRow.status !== 'PAID') {
    selectedRow.status = 'PAID';
    selectedRow.method = 'Banco';
    selectedRow.dueLabel = 'Cobrado hoy';
    landingDemoEvent.value = `El cobro de ${selectedRow.tenant} quedó marcado como pagado.`;
    return;
  }

  landingDemoEvent.value = `Se generaría el recibo PDF del pago de ${selectedRow.tenant}.`;
};
</script>

<style scoped>
.landing-shell {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.landing-brand {
  font-size: 1.28rem;
  letter-spacing: -0.05em;
  font-weight: 700;
}

.landing-shell h1,
.landing-shell h2,
.landing-shell h3 {
  letter-spacing: -0.06em;
  font-weight: 700;
}

.landing-shell h1 {
  line-height: 0.95;
}

.landing-shell h2 {
  line-height: 0.98;
}

.landing-shell p,
.landing-shell li,
.landing-shell a,
.landing-shell span,
.landing-shell button {
  font-family: inherit;
}
</style>
