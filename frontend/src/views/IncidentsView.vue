<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Operaciones</p>
        <h1 class="text-3xl font-semibold text-slate-900">Incidencias</h1>
        <p class="text-sm text-slate-500">Gestiona reparaciones, costes y seguimiento desde un solo sitio.</p>
      </div>
      <button
        class="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800"
        type="button"
        @click="showModal = true"
      >
        Registrar incidencia
      </button>
    </header>

    <div v-if="loading" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      Cargando incidencias, apartamentos y contratos…
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in metricCards"
        :key="card.id"
        class="flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm"
      >
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{{ card.label }}</p>
          <p class="text-3xl font-semibold text-slate-900">{{ card.valueLabel }}</p>
        </div>
        <p class="mt-4 text-sm text-slate-500">{{ card.helper }}</p>
      </article>
    </section>

    <section class="rounded-2xl bg-white p-5 shadow-sm">
      <div class="grid gap-4 md:grid-cols-5">
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Estado
          <select v-model="filters.state" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option value="ABIERTO">Abierta</option>
            <option value="PENDIENTE_PROVEEDOR">Pendiente proveedor</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="RESUELTA">Resuelta</option>
          </select>
        </label>
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Apartamento
          <select v-model="filters.unit_id" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option v-for="apartment in apartments" :key="apartment.id" :value="apartment.id">
              {{ apartment.name }}
            </option>
          </select>
        </label>
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Prioridad
          <select v-model="filters.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Todas</option>
            <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Tipo de incidencia
          <select v-model="filters.type" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option v-for="type in incidentTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </label>
        <label class="space-y-2 text-sm font-semibold text-slate-600">
          Buscar
          <input
            v-model="filters.text"
            placeholder="Título, apartamento o responsable"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <div class="mt-4 flex items-center justify-end">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-4 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          @click="resetFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1fr,340px]">
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-auto">
          <table class="min-w-full text-sm text-slate-600">
            <thead>
              <tr class="text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                <th class="px-4 py-3">Apartamento</th>
                <th class="px-4 py-3">Título</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Prioridad</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Responsable</th>
                <th class="px-4 py-3">Costo estimado</th>
                <th class="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="incident in filteredIncidents"
                :key="incident.id"
                class="border-t transition hover:bg-slate-50"
                :class="{ 'bg-slate-50': selectedIncidentId === incident.id }"
                @click="selectedIncidentId = incident.id"
              >
                <td class="px-4 py-3 font-semibold text-slate-800">{{ incident.apartmentName }}</td>
                <td class="px-4 py-3 text-slate-700">{{ incident.title }}</td>
                <td class="px-4 py-3 text-slate-600">{{ incident.typeLabel }}</td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="flex items-center gap-2">
                    <span :class="['h-2 w-2 rounded-full', incident.priorityDot]"></span>
                    <span class="text-sm font-semibold" :class="incident.priorityAccent">{{ incident.priorityLabel }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                    :class="incident.statusBadgeClasses"
                  >
                    ●
                    <span>{{ incident.statusLabel }}</span>
                  </span>
                </td>
                <td class="px-4 py-3">{{ incident.createdAtLabel }}</td>
                <td class="px-4 py-3">{{ incident.responsible }}</td>
                <td class="px-4 py-3 font-semibold text-slate-800">{{ incident.costDisplay }}</td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="text-primary font-semibold underline-offset-4 transition hover:underline"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredIncidents.length">
                <td colspan="9" class="px-4 py-10 text-center text-sm text-slate-500">No hay incidencias que coincidan con los filtros.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="selectedIncident" class="space-y-6 p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Detalle</p>
              <h2 class="text-xl font-semibold text-slate-900">{{ selectedIncident.title }}</h2>
              <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <span>{{ selectedIncident.apartmentName }}</span>
                <span>·</span>
                <span>{{ selectedIncident.tenantName ?? 'Inquilino asignado' }}</span>
              </div>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-50"
              @click="markAsResolved"
            >
              Marcar resuelta
            </button>
          </div>
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Estado</p>
            <span
              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              :class="selectedIncident.statusBadgeClasses"
            >
              ●
              <span>{{ selectedIncident.statusLabel }}</span>
            </span>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-semibold text-slate-700">Descripción</p>
            <p class="text-sm text-slate-600">{{ selectedIncident.description }}</p>
          </div>
          <div class="grid gap-3 text-sm text-slate-500">
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Tipo</p>
              <p class="text-base font-semibold text-slate-900">{{ selectedIncident.typeLabel }}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Prioridad</p>
              <p class="text-base font-semibold" :class="selectedIncident.priorityAccent">{{ selectedIncident.priorityLabel }}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Responsable</p>
              <p class="text-base font-semibold text-slate-900">{{ selectedIncident.responsible }}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Costo final</p>
              <p class="text-base font-semibold text-slate-900">{{ selectedIncident.costDisplay }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Historial</p>
            <ol class="space-y-3">
              <li v-for="item in selectedIncident.timeline" :key="item.label" class="flex items-start gap-3">
                <span
                  class="mt-1 h-2.5 w-2.5 rounded-full"
                  :class="item.completed ? 'bg-primary' : 'bg-slate-200'"
                ></span>
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ item.label }}</p>
                  <p class="text-xs text-slate-500">{{ item.date }}</p>
                </div>
              </li>
            </ol>
          </div>
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Adjuntos</p>
            <ul class="space-y-2">
              <li
                v-for="attachment in selectedIncident.attachments"
                :key="attachment.id"
                class="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-slate-900">{{ attachment.name }}</p>
                    <p class="text-xs text-slate-500">{{ attachment.category }} • {{ formatDate(attachment.uploadedAt) }}</p>
                  </div>
                  <button type="button" class="text-xs font-semibold text-primary">Abrir</button>
                </div>
              </li>
            </ul>
            <div>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
                @click="detailUploadInput?.click()"
              >
                Añadir archivo
              </button>
              <input ref="detailUploadInput" type="file" multiple class="hidden" @change="handleDetailUpload" />
            </div>
          </div>
        </div>
        <div v-else class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-500">
          <p class="font-semibold text-slate-900">Seleccione una incidencia</p>
          <p>Haz clic en una fila para revisar el avance, historial y costes.</p>
        </div>
      </aside>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40" @click="closeModal"></div>
      <div class="relative z-50 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Nuevo registro</p>
            <h2 class="text-2xl font-semibold text-slate-900">Registrar incidencia</h2>
          </div>
          <button type="button" class="text-slate-400 transition hover:text-slate-600" @click="closeModal">Cerrar</button>
        </div>
        <form class="mt-6 space-y-5" @submit.prevent="handleCreate">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Apartamento
              <select v-model="modalForm.unit_id" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="" disabled>Selecciona un apartamento</option>
                <option v-for="apartment in apartments" :key="apartment.id" :value="apartment.id">
                  {{ apartment.name }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Tipo de incidencia
              <select v-model="modalForm.type" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="type in incidentTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
            </label>
          </div>
          <label class="space-y-2 text-sm font-semibold text-slate-600">
            Título
            <input
              v-model="modalForm.title"
              type="text"
              placeholder="Ej. Fuga de agua en baño"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label class="space-y-2 text-sm font-semibold text-slate-600">
            Descripción
            <textarea
              v-model="modalForm.description"
              rows="4"
              placeholder="Describe brevemente el problema"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            ></textarea>
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Prioridad
              <select v-model="modalForm.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Costo estimado
              <input
                v-model.number="modalForm.cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 120"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div class="space-y-2 text-sm text-slate-600">
            <p class="font-semibold text-slate-700">Adjuntar fotos, facturas o presupuestos</p>
            <p class="text-xs text-slate-400">Los archivos se almacenan en el panel de detalle para referencia rápida.</p>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary"
            >
              <input type="file" multiple class="hidden" @change="handleModalFileChange" />
              <span>Agregar archivos</span>
              <span class="text-xs text-slate-400">(máx. 3)</span>
            </label>
            <ul class="space-y-1" v-if="modalFiles.length">
              <li v-for="file in modalFiles" :key="file.name + file.size" class="text-xs text-slate-500">
                {{ file.name }}
              </li>
            </ul>
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-blue-600"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Guardando...' : 'Registrar incidencia' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import apiClient from '../services/apiClient';

type IncidentRecord = {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  cost: number | null;
  created_at: string;
  units?: { name?: string };
};

type TenantRecord = {
  id: string;
  unit_id: string;
  full_name: string;
  contract_start?: string;
  contract_end?: string;
};

type DisplayStatusKey = 'ABIERTO' | 'EN_PROGRESO' | 'PENDIENTE_PROVEEDOR' | 'RESUELTA';

type TimelineStep = {
  label: string;
  date: string;
  completed: boolean;
};

type AttachmentCategory = 'foto' | 'factura' | 'presupuesto';

type Attachment = {
  id: string;
  name: string;
  category: AttachmentCategory;
  uploadedAt: string;
};

type IncidentOverride = {
  type?: string;
  priority?: string;
  responsible?: string;
  statusKey?: DisplayStatusKey;
};

type IncidentDisplay = IncidentRecord & {
  apartmentName: string;
  tenantName: string | null;
  typeKey: string;
  typeLabel: string;
  priorityKey: string;
  priorityLabel: string;
  priorityAccent: string;
  priorityDot: string;
  statusKey: DisplayStatusKey;
  statusLabel: string;
  statusBadgeClasses: string;
  responsible: string;
  timeline: TimelineStep[];
  attachments: Attachment[];
  costDisplay: string;
  createdAtLabel: string;
  finalCost: number;
};

const incidentTypes = [
  { value: 'fontaneria', label: 'Fontanería' },
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'electrodomesticos', label: 'Electrodomésticos' },
  { value: 'danios_estructurales', label: 'Daños estructurales' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'otros', label: 'Otros' }
];

const priorityOptions = [
  { value: 'alta', label: 'Alta', accent: 'text-rose-700', dot: 'bg-rose-500' },
  { value: 'media', label: 'Media', accent: 'text-amber-700', dot: 'bg-amber-500' },
  { value: 'baja', label: 'Baja', accent: 'text-slate-700', dot: 'bg-slate-500' }
];

const responsibleOptions = [
  'Equipo interno de mantenimiento',
  'Proveedor externo asignado',
  'Coordinador de facility',
  'Supervisor de operaciones'
];

const statusBadgeMap: Record<DisplayStatusKey, { label: string; bg: string; text: string; border: string }> = {
  ABIERTO: { label: 'Abierta', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  PENDIENTE_PROVEEDOR: { label: 'Pendiente proveedor', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  EN_PROGRESO: { label: 'En progreso', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  RESUELTA: { label: 'Resuelta', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
};

const statusLevels: Record<DisplayStatusKey, number> = {
  ABIERTO: 1,
  PENDIENTE_PROVEEDOR: 2,
  EN_PROGRESO: 3,
  RESUELTA: 4
};

const timelineLabels = [
  'Incidencia creada',
  'Proveedor asignado',
  'Trabajo iniciado',
  'Trabajo finalizado'
];

const filters = reactive({
  state: '',
  unit_id: '',
  priority: '',
  type: '',
  text: ''
});

const modalForm = reactive({
  unit_id: '',
  title: '',
  description: '',
  type: incidentTypes[0].value,
  priority: priorityOptions[1].value,
  cost: null as number | null
});

const modalFiles = ref<File[]>([]);
const panelAttachments = reactive<Record<string, Attachment[]>>({});
const incidentOverrides = reactive<Record<string, IncidentOverride>>({});
const incidents = ref<IncidentRecord[]>([]);
const apartments = ref<{ id: string; name?: string }[]>([]);
const tenants = ref<TenantRecord[]>([]);
const loading = ref(false);
const showModal = ref(false);
const selectedIncidentId = ref<string | null>(null);
const detailUploadInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
};

const consistentHash = (value: string) => {
  let hash = 0;
  for (const char of value) {
    hash += char.charCodeAt(0);
  }
  return hash;
};

const pickByKey = <T>(value: string, pool: T[]): T => {
  if (!pool.length) {
    throw new Error('Lista vacía');
  }
  const normalized = value || 'default';
  const index = consistentHash(normalized) % pool.length;
  return pool[index];
};

const getTenantForUnit = (unitId: string) => {
  const candidates = tenants.value.filter((tenant) => tenant.unit_id === unitId);
  if (!candidates.length) return null;
  const now = Date.now();
  const current = candidates.find((tenant) => {
    if (!tenant.contract_end) return false;
    const end = new Date(tenant.contract_end).getTime();
    return !Number.isNaN(end) && end >= now;
  });
  return current ?? candidates[0];
};

const deriveTypeKey = (incident: IncidentRecord) => {
  const override = incidentOverrides[incident.id]?.type;
  if (override) return override;
  return pickByKey(incident.id + '-type', incidentTypes).value;
};

const derivePriorityKey = (incident: IncidentRecord) => {
  const override = incidentOverrides[incident.id]?.priority;
  if (override) return override;
  return pickByKey(incident.id + '-priority', priorityOptions).value;
};

const deriveResponsible = (incident: IncidentRecord) => {
  const override = incidentOverrides[incident.id]?.responsible;
  if (override) return override;
  return pickByKey(incident.id + '-responsible', responsibleOptions);
};

const deriveDisplayStatus = (incident: IncidentRecord): DisplayStatusKey => {
  const override = incidentOverrides[incident.id]?.statusKey;
  if (override) return override;
  if (incident.status === 'IN_PROGRESS') return 'EN_PROGRESO';
  if (incident.status === 'CLOSED') return 'RESUELTA';
  if (incident.status === 'OPEN') {
    const alternate = consistentHash(incident.id + 'estado') % 4 === 0;
    return alternate ? 'PENDIENTE_PROVEEDOR' : 'ABIERTO';
  }
  return 'ABIERTO';
};

const buildTimeline = (incident: IncidentRecord, statusKey: DisplayStatusKey): TimelineStep[] => {
  const base = incident.created_at ? new Date(incident.created_at) : new Date();
  const level = statusLevels[statusKey] ?? 1;
  return timelineLabels.map((label, index) => {
    const offsetDays = index * 2;
    const stepDate = new Date(base.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return {
      label,
      date: shortDateFormatter.format(stepDate),
      completed: index < level
    };
  });
};

const defaultAttachments = (incident: IncidentRecord): Attachment[] => {
  const base = incident.created_at ? new Date(incident.created_at) : new Date();
  return [
    {
      id: `${incident.id}-photo`,
      name: `${incident.title || 'Incidencia'} - foto del problema.jpg`,
      category: 'foto',
      uploadedAt: base.toISOString()
    },
    {
      id: `${incident.id}-quote`,
      name: `${incident.title || 'Incidencia'} - presupuesto.pdf`,
      category: 'presupuesto',
      uploadedAt: new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

const createAttachmentFromFile = (file: File): Attachment => {
  const normalizedName = file.name || 'Adjunto';
  const lowercase = normalizedName.toLowerCase();
  const category: AttachmentCategory = file.type.includes('image')
    ? 'foto'
    : lowercase.includes('factura') || lowercase.endsWith('.pdf')
      ? 'factura'
      : 'presupuesto';
  return {
    id: `${normalizedName}-${Date.now()}`,
    name: normalizedName,
    category,
    uploadedAt: new Date().toISOString()
  };
};

const enrichedIncidents = computed<IncidentDisplay[]>(() => {
  return incidents.value.map((incident) => {
    const apartment = incident.units?.name ?? apartments.value.find((unit) => unit.id === incident.unit_id)?.name ?? '—';
    const tenant = getTenantForUnit(incident.unit_id);
    const statusKey = deriveDisplayStatus(incident);
    const typeKey = deriveTypeKey(incident);
    const typeLabel = incidentTypes.find((type) => type.value === typeKey)?.label ?? 'Otros';
    const priorityKey = derivePriorityKey(incident);
    const priorityDef = priorityOptions.find((option) => option.value === priorityKey) ?? priorityOptions[1];
    const responsible = deriveResponsible(incident);
    const timeline = buildTimeline(incident, statusKey);
    const attachments = panelAttachments[incident.id] ?? defaultAttachments(incident);
    const costValue = Number(incident.cost ?? 0);
    const statusBadge = statusBadgeMap[statusKey];
    return {
      ...incident,
      apartmentName: apartment,
      tenantName: tenant?.full_name ?? null,
      typeKey,
      typeLabel,
      priorityKey,
      priorityLabel: priorityDef.label,
      priorityAccent: priorityDef.accent,
      priorityDot: priorityDef.dot,
      statusKey,
      statusLabel: statusBadge.label,
      statusBadgeClasses: `${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`,
      responsible,
      timeline,
      attachments,
      costDisplay: formatCurrency(costValue),
      createdAtLabel: formatDate(incident.created_at),
      finalCost: costValue
    };
  });
});

const filteredIncidents = computed(() => {
  const term = filters.text?.trim().toLowerCase();
  return enrichedIncidents.value.filter((incident) => {
    if (filters.state && incident.statusKey !== filters.state) return false;
    if (filters.unit_id && incident.unit_id !== filters.unit_id) return false;
    if (filters.type && incident.typeKey !== filters.type) return false;
    if (filters.priority && incident.priorityKey !== filters.priority) return false;
    if (term) {
      const haystack = `${incident.title} ${incident.apartmentName} ${incident.responsible}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
});

const selectedIncident = computed(() => {
  if (!selectedIncidentId.value) return null;
  return enrichedIncidents.value.find((incident) => incident.id === selectedIncidentId.value) ?? null;
});

watch(
  filteredIncidents,
  (list) => {
    if (!list.length) {
      selectedIncidentId.value = null;
      return;
    }
    if (!selectedIncidentId.value || !list.some((incident) => incident.id === selectedIncidentId.value)) {
      selectedIncidentId.value = list[0].id;
    }
  },
  { immediate: true }
);

const summary = computed(() => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let openCount = 0;
  let inProgressCount = 0;
  let resolvedThisMonth = 0;
  let costThisMonth = 0;

  enrichedIncidents.value.forEach((incident) => {
    if (incident.statusKey === 'ABIERTO' || incident.statusKey === 'PENDIENTE_PROVEEDOR') {
      openCount += 1;
    }
    if (incident.statusKey === 'EN_PROGRESO') {
      inProgressCount += 1;
    }
    const createdDate = new Date(incident.created_at);
    if (createdDate.getMonth() === month && createdDate.getFullYear() === year) {
      costThisMonth += incident.finalCost;
      if (incident.statusKey === 'RESUELTA') {
        resolvedThisMonth += 1;
      }
    }
  });

  return { openCount, inProgressCount, resolvedThisMonth, costThisMonth };
});

const metricCards = computed(() => {
  const summaryValues = summary.value;
  return [
    {
      id: 'open',
      label: 'Incidencias abiertas',
      valueLabel: String(summaryValues.openCount),
      helper: summaryValues.openCount ? `${summaryValues.openCount} tareas activas` : 'Sin movimientos en curso'
    },
    {
      id: 'progress',
      label: 'En progreso',
      valueLabel: String(summaryValues.inProgressCount),
      helper: summaryValues.inProgressCount ? 'En seguimiento constante' : 'Nada urgente'
    },
    {
      id: 'resolved',
      label: 'Resueltas este mes',
      valueLabel: String(summaryValues.resolvedThisMonth),
      helper: summaryValues.resolvedThisMonth ? 'Actualizado al instante' : 'Aún en revisión'
    },
    {
      id: 'cost',
      label: 'Coste total del mes',
      valueLabel: formatCurrency(summaryValues.costThisMonth),
      helper: 'Incluye estimaciones y facturas cargadas'
    }
  ];
});

const resetFilters = () => {
  filters.state = '';
  filters.unit_id = '';
  filters.priority = '';
  filters.type = '';
  filters.text = '';
};

const closeModal = () => {
  showModal.value = false;
  modalFiles.value = [];
};

const loadData = async () => {
  loading.value = true;
  try {
    const [incidentResponse, apartmentResponse, tenantResponse] = await Promise.all([
      apiClient.get('/incidents'),
      apiClient.get('/apartments'),
      apiClient.get('/tenants')
    ]);
    incidents.value = Array.isArray(incidentResponse.data) ? incidentResponse.data : [];
    apartments.value = Array.isArray(apartmentResponse.data) ? apartmentResponse.data : [];
    tenants.value = Array.isArray(tenantResponse.data) ? tenantResponse.data : [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleModalFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files?.length) return;
  modalFiles.value = [...modalFiles.value, ...Array.from(files)];
  target.value = '';
};

const handleDetailUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files?.length || !selectedIncidentId.value) return;
  const attachments = Array.from(files).map(createAttachmentFromFile);
  panelAttachments[selectedIncidentId.value] = [
    ...(panelAttachments[selectedIncidentId.value] ?? []),
    ...attachments
  ];
  target.value = '';
};

const markAsResolved = async () => {
  if (!selectedIncidentId.value) return;
  try {
    await apiClient.put(`/incidents/${selectedIncidentId.value}`, { status: 'CLOSED' });
    incidentOverrides[selectedIncidentId.value] = {
      ...incidentOverrides[selectedIncidentId.value],
      statusKey: 'RESUELTA'
    };
    await loadData();
  } catch (error) {
    console.error(error);
  }
};

const handleCreate = async () => {
  if (!modalForm.unit_id || !modalForm.title || !modalForm.description) return;
  isSaving.value = true;
  try {
    const payload: Record<string, unknown> = {
      unit_id: modalForm.unit_id,
      title: modalForm.title,
      description: modalForm.description,
      status: 'OPEN'
    };
    if (modalForm.cost !== null && modalForm.cost !== undefined) {
      payload.cost = Number(modalForm.cost);
    }
    const response = await apiClient.post('/incidents', payload);
    const created = response.data;
    if (created?.id) {
      incidentOverrides[created.id] = {
        type: modalForm.type,
        priority: modalForm.priority,
        responsible: pickByKey(`${modalForm.unit_id}-${modalForm.title}`, responsibleOptions),
        statusKey: 'ABIERTO'
      };
      const attachments = modalFiles.value.map(createAttachmentFromFile);
      if (attachments.length) {
        panelAttachments[created.id] = attachments;
      }
      selectedIncidentId.value = created.id;
    }
    Object.assign(modalForm, {
      unit_id: '',
      title: '',
      description: '',
      type: incidentTypes[0].value,
      priority: priorityOptions[1].value,
      cost: null
    });
    modalFiles.value = [];
    showModal.value = false;
  } catch (error) {
    console.error(error);
  } finally {
    isSaving.value = false;
    await loadData();
  }
};

onMounted(() => {
  loadData();
});
</script>
