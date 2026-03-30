<template>
  <div class="min-h-screen bg-[#f6f3ee] text-slate-900">
    <div class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(31,79,70,0.13),_transparent_26%),radial-gradient(circle_at_88%_4%,_rgba(201,106,55,0.12),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(246,243,238,0))]"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="rounded-[32px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-[#d5cbc1] bg-[#fbf8f2] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">
              <SolidIcon name="message" class="h-3.5 w-3.5 text-[#c96a37]" />
              <span>Portal del inquilino</span>
            </div>
            <div>
              <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">Seguimiento del alquiler</h1>
              <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Consulta el estado del contrato y responde a comunicaciones formales con el propietario.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em]" :class="realtimeBadge.className">
              <span class="h-2.5 w-2.5 rounded-full" :class="realtimeBadge.dotClass"></span>
              <span>{{ realtimeBadge.label }}</span>
            </div>
            <UserButton :appearance="clerkUserButtonAppearance" />
          </div>
        </div>
      </header>

      <section v-if="loadError" class="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ loadError }}
      </section>

      <template v-else>
        <section class="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Mi contrato</p>
            <div v-if="profile" class="mt-4 space-y-4">
              <div>
                <h2 class="text-2xl font-semibold text-slate-900">{{ profile.tenant.fullName }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ profile.unit?.name ?? 'Unidad sin nombre' }}</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Inicio</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(profile.tenant.contractStart) }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Fin</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(profile.tenant.contractEnd) }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Dirección</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">
                    {{ [profile.unit?.address, profile.unit?.city, profile.unit?.postalCode].filter(Boolean).join(', ') || 'Sin dirección disponible' }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="mt-4 text-sm text-slate-500">Cargando datos del contrato…</div>
          </article>

          <section class="grid gap-4 sm:grid-cols-3">
            <article v-for="metric in metrics" :key="metric.id" class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ metric.helper }}</p>
            </article>
          </section>
        </section>

        <section class="mt-6 rounded-[32px] border border-[#d9d1c9] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,247,243,0.96))] p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Nueva comunicación</p>
              <h2 class="mt-1 text-xl font-semibold text-slate-900">Abrir expediente con el propietario</h2>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Crea un hilo formal para incidencias, pagos, documentación o consultas del alquiler.
              </p>
            </div>
          </div>

          <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="void createConversation()">
            <label class="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
              Asunto
              <input
                v-model="createForm.subject"
                type="text"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                maxlength="140"
                placeholder="Ej. Revisión de humedad en baño principal"
              />
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Categoría
              <select v-model="createForm.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Prioridad
              <select v-model="createForm.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
              Alcance
              <select v-model="createForm.scopeType" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="option in scopeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
              Mensaje inicial
              <textarea
                v-model="createForm.body"
                rows="5"
                class="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                placeholder="Describe el contexto, lo ocurrido y la acción que necesitas."
              ></textarea>
            </label>
            <p v-if="createError" class="md:col-span-2 text-sm text-rose-600">{{ createError }}</p>
            <div class="md:col-span-2 flex justify-end">
              <button
                type="submit"
                class="rounded-full bg-[#1f4f46] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1f4f46]/20 transition hover:bg-[#163a33] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="creatingConversation || !profile"
              >
                {{ creatingConversation ? 'Abriendo…' : 'Abrir conversación' }}
              </button>
            </div>
          </form>
        </section>

        <section class="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="grid gap-4 md:grid-cols-4">
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Estado
              <select v-model="filters.status" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Todos</option>
                <option value="OPEN">Abiertas</option>
                <option value="CLOSED">Cerradas</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Categoría
              <select v-model="filters.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Todas</option>
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Prioridad
              <select v-model="filters.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Todas</option>
                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Buscar
              <input v-model="filters.search" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Asunto o mensaje" />
            </label>
          </div>
        </section>

        <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] xl:items-start">
          <section class="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Mis comunicaciones</p>
                <h2 class="mt-1 text-xl font-semibold text-slate-900">Bandeja</h2>
              </div>
              <button type="button" class="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50" @click="void refreshData({ silent: false })">
                Refrescar
              </button>
            </div>

            <div v-if="loading && !conversationItems.length" class="p-5 text-sm text-slate-500">Cargando conversaciones…</div>
            <div v-else-if="!filteredConversations.length" class="p-5 text-sm text-slate-500">No hay conversaciones visibles.</div>
            <div v-else class="divide-y divide-slate-100">
              <button
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                type="button"
                class="block w-full px-5 py-4 text-left transition hover:bg-slate-50"
                :class="selectedConversationId === conversation.id ? 'bg-slate-50' : ''"
                @click="void selectConversation(conversation.id)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]" :class="statusClasses(conversation.status)">
                        {{ statusLabel(conversation.status) }}
                      </span>
                      <span class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]" :class="priorityClasses(conversation.priority)">
                        {{ priorityLabel(conversation.priority) }}
                      </span>
                      <span v-if="conversation.unreadCount > 0" class="rounded-full bg-[#1f4f46] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                        {{ conversation.unreadCount }} nueva<span v-if="conversation.unreadCount > 1">s</span>
                      </span>
                    </div>
                    <h3 class="mt-3 truncate text-base font-semibold text-slate-900">{{ conversation.subject }}</h3>
                    <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{{ conversation.lastMessagePreview || 'Sin mensajes recientes.' }}</p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{{ formatRelative(conversation.lastMessageAt || conversation.createdAt) }}</p>
                    <p class="mt-2 text-xs text-slate-500">{{ categoryLabel(conversation.category) }}</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <aside>
            <article v-if="selectedDetail" class="rounded-[32px] border border-[#d9d1c9] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,247,243,0.96))] p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Conversación activa</p>
                  <h2 class="mt-3 text-2xl font-semibold text-slate-900">{{ selectedDetail.conversation.subject }}</h2>
                  <p class="mt-2 text-sm text-slate-500">
                    {{ categoryLabel(selectedDetail.conversation.category) }} · {{ scopeLabel(selectedDetail.conversation.scopeType) }}
                  </p>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]" :class="statusClasses(selectedDetail.conversation.status)">
                  {{ statusLabel(selectedDetail.conversation.status) }}
                </span>
              </div>

              <div class="mt-5 max-h-[440px] space-y-3 overflow-y-auto pr-1">
                <article
                  v-for="message in selectedDetail.messages"
                  :key="message.id"
                  class="rounded-3xl border px-4 py-4 shadow-sm"
                  :class="message.sender.actorType === 'TENANT' ? 'border-[#d9d1c9] bg-[#fffaf5]' : 'border-slate-200 bg-white'"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ message.sender.displayName }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ formatDateTime(message.createdAt) }}</p>
                    </div>
                    <span v-if="message.priority" class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]" :class="priorityClasses(message.priority)">
                      {{ priorityLabel(message.priority) }}
                    </span>
                  </div>
                  <p class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{{ message.body }}</p>
                </article>
              </div>

              <form class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm" @submit.prevent="void sendReply()">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Responder</p>
                <textarea
                  v-model="replyBody"
                  rows="5"
                  class="mt-4 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                  :disabled="selectedDetail.conversation.status === 'CLOSED' || sendingReply"
                  placeholder="Escribe tu respuesta."
                ></textarea>
                <p v-if="replyError" class="mt-3 text-sm text-rose-600">{{ replyError }}</p>
                <div class="mt-4 flex justify-end">
                  <button
                    type="submit"
                    class="rounded-full bg-[#1f4f46] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1f4f46]/20 transition hover:bg-[#163a33] disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="sendingReply || selectedDetail.conversation.status === 'CLOSED'"
                  >
                    {{ sendingReply ? 'Enviando…' : 'Enviar respuesta' }}
                  </button>
                </div>
              </form>
            </article>
            <article v-else class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/80 p-6 shadow-sm xl:min-h-[320px]">
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Detalle</p>
              <h3 class="mt-3 text-xl font-semibold text-slate-900">Selecciona una conversación</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">Aquí podrás seguir el historial completo y responder al propietario.</p>
            </article>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { UserButton } from '@clerk/vue';
import SolidIcon from '../components/SolidIcon.vue';
import { clerkUserButtonAppearance } from '../services/clerkAppearance';
import tenantApiClient from '../services/tenantApiClient';
import type {
  CommunicationCategory,
  CommunicationConversationDetail,
  CommunicationConversationListItem,
  CommunicationPriority,
  CommunicationScopeType
} from '../types/communication';

type TenantPortalProfile = {
  accessId: string;
  ownerId: string;
  tenantPersonId: string;
  clerkUserId: string;
  tenant: {
    id: string;
    fullName: string;
    email: string | null;
    contractStart: string | null;
    contractEnd: string | null;
    status: string | null;
  };
  unit: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.PROD ? '/api' : 'http://localhost:4000');
const categoryOptions: Array<{ value: CommunicationCategory; label: string }> = [
  { value: 'INCIDENCE', label: 'Incidencia' },
  { value: 'PAYMENT', label: 'Pago' },
  { value: 'CONTRACT', label: 'Contrato' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'DOCUMENTATION', label: 'Documentación' },
  { value: 'GENERAL_NOTICE', label: 'Aviso general' },
  { value: 'QUESTION', label: 'Consulta' },
  { value: 'URGENT', label: 'Urgente' }
];
const priorityOptions: Array<{ value: CommunicationPriority; label: string }> = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];
const scopeOptions: Array<{ value: CommunicationScopeType; label: string }> = [
  { value: 'LEASE', label: 'Contrato actual' },
  { value: 'PROPERTY', label: 'Unidad o vivienda' },
  { value: 'GENERAL', label: 'Consulta general' }
];

const profile = ref<TenantPortalProfile | null>(null);
const conversationItems = ref<CommunicationConversationListItem[]>([]);
const selectedConversationId = ref('');
const selectedDetail = ref<CommunicationConversationDetail | null>(null);
const loading = ref(false);
const loadError = ref('');
const replyBody = ref('');
const replyError = ref('');
const sendingReply = ref(false);
const createError = ref('');
const creatingConversation = ref(false);
const realtimeStatus = ref<'connecting' | 'live' | 'offline'>('connecting');
const filters = reactive({ status: '', category: '', priority: '', search: '' });
const createForm = reactive<{
  subject: string;
  category: CommunicationCategory;
  priority: CommunicationPriority;
  scopeType: CommunicationScopeType;
  body: string;
}>({
  subject: '',
  category: 'INCIDENCE',
  priority: 'normal',
  scopeType: 'LEASE',
  body: ''
});

let communicationsEventSource: EventSource | null = null;
let reconnectTimeoutId: number | null = null;
let fallbackPollIntervalId: number | null = null;

const metrics = computed(() => [
  { id: 'total', label: 'Conversaciones', value: conversationItems.value.length, helper: 'Expedientes visibles en el portal.' },
  { id: 'unread', label: 'Con novedades', value: conversationItems.value.filter((item) => item.unreadCount > 0).length, helper: 'Mensajes pendientes de revisar.' },
  { id: 'open', label: 'Abiertas', value: conversationItems.value.filter((item) => item.status === 'OPEN').length, helper: 'Hilos activos con el propietario.' }
]);

const filteredConversations = computed(() => {
  const search = filters.search.trim().toLowerCase();
  return conversationItems.value.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (!search) return true;
    return [item.subject, item.lastMessagePreview, item.lastMessageAuthor].join(' ').toLowerCase().includes(search);
  });
});

const realtimeBadge = computed(() => {
  if (realtimeStatus.value === 'live') return { label: 'Live', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' };
  if (realtimeStatus.value === 'connecting') return { label: 'Conectando', className: 'border-amber-200 bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' };
  return { label: 'Offline', className: 'border-slate-200 bg-slate-50 text-slate-600', dotClass: 'bg-slate-400' };
});

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatRelative(value: string | null) {
  if (!value) return 'Sin fecha';
  const diffHours = Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000);
  if (diffHours < 1) return 'Hace <1h';
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(value);
}

function statusLabel(status: string) {
  return status === 'OPEN' ? 'Abierta' : 'Cerrada';
}

function statusClasses(status: string) {
  return status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600';
}

function priorityLabel(priority: string) {
  return priorityOptions.find((option) => option.value === priority)?.label ?? priority;
}

function priorityClasses(priority: string) {
  if (priority === 'urgent') return 'bg-rose-50 text-rose-700';
  if (priority === 'high') return 'bg-amber-50 text-amber-700';
  if (priority === 'low') return 'bg-sky-50 text-sky-700';
  return 'bg-slate-100 text-slate-600';
}

function categoryLabel(category: string) {
  return categoryOptions.find((option) => option.value === category)?.label ?? category;
}

function scopeLabel(scope: string) {
  if (scope === 'LEASE') return 'Contrato';
  if (scope === 'PROPERTY') return 'Propiedad';
  return 'General';
}

function buildStreamUrl() {
  const normalizedApiBase = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
  const baseUrl = /^https?:\/\//i.test(normalizedApiBase) ? normalizedApiBase : new URL(normalizedApiBase, window.location.origin).toString();
  return new URL('tenant-portal/communications/stream', baseUrl).toString();
}

async function loadProfile() {
  const { data } = await tenantApiClient.get('/me');
  profile.value = data as TenantPortalProfile;
}

async function loadConversations() {
  const { data } = await tenantApiClient.get('/communications/conversations', {
    params: {
      limit: 100,
      status: filters.status || undefined,
      category: filters.category || undefined,
      priority: filters.priority || undefined
    }
  });
  conversationItems.value = Array.isArray(data?.items) ? data.items : [];
}

async function loadConversationDetail(conversationId: string, options: { markRead?: boolean } = {}) {
  const { data } = await tenantApiClient.get(`/communications/conversations/${conversationId}`);
  selectedDetail.value = data as CommunicationConversationDetail;
  if (options.markRead !== false) {
    const hasUnread = selectedDetail.value.messages.some((message) => !message.readByCurrentActor && message.sender.actorType !== 'TENANT');
    if (hasUnread) {
      await tenantApiClient.post('/communications/messages/read', { conversationId });
      const item = conversationItems.value.find((conversation) => conversation.id === conversationId);
      if (item) item.unreadCount = 0;
      selectedDetail.value.messages = selectedDetail.value.messages.map((message) => ({ ...message, readByCurrentActor: true }));
    }
  }
}

async function refreshData(options: { silent?: boolean } = {}) {
  if (!options.silent) loading.value = true;
  loadError.value = '';
  try {
    await Promise.all([loadProfile(), loadConversations()]);
    if (!selectedConversationId.value && conversationItems.value.length) {
      selectedConversationId.value = conversationItems.value[0].id;
    }
    if (selectedConversationId.value) {
      await loadConversationDetail(selectedConversationId.value, { markRead: true });
    }
  } catch (error: any) {
    loadError.value = String(error?.response?.data?.message ?? 'No se pudo cargar el portal del inquilino.');
  } finally {
    loading.value = false;
  }
}

async function selectConversation(conversationId: string) {
  selectedConversationId.value = conversationId;
  await loadConversationDetail(conversationId, { markRead: true });
}

function clearReconnectTimeout() {
  if (reconnectTimeoutId !== null) {
    window.clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = null;
  }
}

function clearFallbackPolling() {
  if (fallbackPollIntervalId !== null) {
    window.clearInterval(fallbackPollIntervalId);
    fallbackPollIntervalId = null;
  }
}

function disconnectStream() {
  clearReconnectTimeout();
  if (communicationsEventSource) {
    communicationsEventSource.close();
    communicationsEventSource = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimeoutId !== null) return;
  reconnectTimeoutId = window.setTimeout(() => {
    reconnectTimeoutId = null;
    connectStream();
  }, 5000);
}

function connectStream() {
  disconnectStream();
  if (typeof EventSource === 'undefined') {
    realtimeStatus.value = 'offline';
    return;
  }
  realtimeStatus.value = 'connecting';
  const source = new EventSource(buildStreamUrl());
  communicationsEventSource = source;
  source.addEventListener('connected', () => {
    realtimeStatus.value = 'live';
    clearReconnectTimeout();
  });
  const sync = () => {
    realtimeStatus.value = 'live';
    void refreshData({ silent: true });
  };
  source.addEventListener('conversation-created', sync);
  source.addEventListener('message-created', sync);
  source.addEventListener('messages-read', sync);
  source.addEventListener('conversation-closed', sync);
  source.addEventListener('conversation-reopened', sync);
  source.onerror = () => {
    if (communicationsEventSource === source) {
      source.close();
      communicationsEventSource = null;
    }
    realtimeStatus.value = 'offline';
    scheduleReconnect();
  };
}

function startFallbackPolling() {
  clearFallbackPolling();
  fallbackPollIntervalId = window.setInterval(() => {
    void refreshData({ silent: true });
  }, 60000);
}

async function sendReply() {
  replyError.value = '';
  if (!selectedConversationId.value || !replyBody.value.trim()) {
    replyError.value = 'Escribe una respuesta antes de enviar.';
    return;
  }
  sendingReply.value = true;
  try {
    const { data } = await tenantApiClient.post(`/communications/conversations/${selectedConversationId.value}/messages`, {
      body: replyBody.value.trim(),
      visibility: 'EXTERNAL'
    });
    selectedDetail.value = data as CommunicationConversationDetail;
    replyBody.value = '';
    await loadConversations();
  } catch (error: any) {
    replyError.value = String(error?.response?.data?.message ?? 'No se pudo enviar la respuesta.');
  } finally {
    sendingReply.value = false;
  }
}

async function createConversation() {
  createError.value = '';
  if (!profile.value) {
    createError.value = 'El perfil del inquilino todavía no está disponible.';
    return;
  }
  if (!createForm.subject.trim() || !createForm.body.trim()) {
    createError.value = 'Completa el asunto y el mensaje inicial.';
    return;
  }

  const tenantPersonId = profile.value.tenantPersonId || profile.value.tenant.id;
  const unitId = profile.value.unit?.id ?? null;
  if ((createForm.scopeType === 'PROPERTY' || createForm.scopeType === 'LEASE') && !unitId) {
    createError.value = 'Tu contrato no tiene una unidad vinculada para abrir este tipo de conversación.';
    return;
  }

  creatingConversation.value = true;
  try {
    const { data } = await tenantApiClient.post('/communications/conversations', {
      subject: createForm.subject.trim(),
      tenantPersonId,
      unitId: createForm.scopeType === 'GENERAL' ? null : unitId,
      leaseId: createForm.scopeType === 'LEASE' ? tenantPersonId : null,
      scopeType: createForm.scopeType,
      category: createForm.category,
      priority: createForm.priority,
      initialMessage: createForm.body.trim()
    });

    const detail = data as CommunicationConversationDetail;
    selectedDetail.value = detail;
    selectedConversationId.value = detail.conversation.id;
    createForm.subject = '';
    createForm.category = 'INCIDENCE';
    createForm.priority = 'normal';
    createForm.scopeType = 'LEASE';
    createForm.body = '';
    await loadConversations();
  } catch (error: any) {
    createError.value = String(error?.response?.data?.message ?? 'No se pudo abrir la conversación.');
  } finally {
    creatingConversation.value = false;
  }
}

watch(() => [filters.status, filters.category, filters.priority], () => {
  void loadConversations();
});

onMounted(() => {
  void refreshData({ silent: false });
  connectStream();
  startFallbackPolling();
});

onBeforeUnmount(() => {
  disconnectStream();
  clearFallbackPolling();
});
</script>
