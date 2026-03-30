<template>
  <div class="space-y-6 pb-10">
    <section class="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-700">
              <SolidIcon name="message" class="h-3.5 w-3.5 text-[#c96a37]" />
              <span>Communications Pro</span>
            </div>
            <div class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em]" :class="realtimeBadge.className">
              <span class="h-2.5 w-2.5 rounded-full" :class="realtimeBadge.dotClass"></span>
              <span>{{ realtimeBadge.label }}</span>
            </div>
          </div>
          <div class="max-w-3xl">
            <h1 class="text-3xl font-semibold text-slate-900 sm:text-5xl">Mensajería profesional</h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Gestiona incidencias, pagos, documentos y avisos desde una bandeja trazable por contrato o propiedad.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <router-link
            to="/billing"
            class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Ver plan
          </router-link>
          <button
            type="button"
            class="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!isPro || loading || !tenantOptions.length"
            @click="openCompose"
          >
            Nueva conversación
          </button>
        </div>
      </div>
    </section>

    <section v-if="!isPro" class="rounded-[36px] border border-[#ead8ca] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(249,246,240,0.96))] p-6 shadow-sm sm:p-8">
      <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Feature premium</p>
      <h2 class="mt-4 text-3xl font-semibold text-slate-900">La bandeja profesional está incluida en PRO</h2>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Incluye conversaciones por contrato o propiedad, prioridad, trazabilidad, adjuntos, cierre y notificaciones.
      </p>
      <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="item in proFeatures" :key="item.title" class="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{{ item.title }}</p>
          <p class="mt-3 text-sm leading-6 text-slate-700">{{ item.body }}</p>
        </article>
      </div>
      <router-link
        to="/billing"
        class="mt-6 inline-flex rounded-full bg-[#c96a37] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:bg-[#b85d2d]"
      >
        Activar PRO
      </router-link>
    </section>

    <template v-else>
      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="metric in metrics"
          :key="metric.id"
          class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{{ metric.label }}</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ metric.helper }}</p>
        </article>
      </section>

      <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
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
            Visibilidad
            <select v-model="filters.unreadOnly" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option :value="false">Todas</option>
              <option :value="true">Solo no leídas</option>
            </select>
          </label>
          <label class="space-y-2 text-sm font-semibold text-slate-600">
            Buscar
            <input
              v-model="filters.search"
              type="text"
              placeholder="Asunto, inquilino o preview"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:items-start">
        <section class="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Inbox</p>
              <h2 class="mt-1 text-xl font-semibold text-slate-900">Conversaciones</h2>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50"
              @click="void refreshData({ silent: false, forceDetail: true })"
            >
              Refrescar
            </button>
          </div>

          <div v-if="loading && !conversationItems.length" class="p-5 text-sm text-slate-500">
            Cargando conversaciones…
          </div>

          <div v-else-if="!filteredConversations.length" class="p-5 text-sm text-slate-500">
            No hay conversaciones que coincidan con los filtros actuales.
          </div>

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
                    <span class="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {{ categoryLabel(conversation.category) }}
                    </span>
                    <span v-if="conversation.unreadCount > 0" class="rounded-full bg-[#1f4f46] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                      {{ conversation.unreadCount }} nueva<span v-if="conversation.unreadCount > 1">s</span>
                    </span>
                  </div>
                  <h3 class="mt-3 truncate text-base font-semibold text-slate-900">{{ conversation.subject }}</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ participantSummary(conversation.participants) }}
                  </p>
                  <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {{ conversation.lastMessagePreview || 'Sin mensajes recientes.' }}
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {{ formatRelative(conversation.lastMessageAt || conversation.createdAt) }}
                  </p>
                  <p class="mt-2 text-xs text-slate-500">
                    {{ scopeLabel(conversation.scopeType) }}
                  </p>
                  <p class="mt-1 text-xs text-slate-400">
                    {{ conversation.lastMessageAuthor || 'Sin autor' }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <aside class="xl:sticky xl:top-6">
          <article v-if="selectedDetail" class="rounded-[32px] border border-[#ead8ca] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(249,246,240,0.96))] p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Detalle activo</p>
                <h2 class="mt-3 text-2xl font-semibold text-slate-900">{{ selectedDetail.conversation.subject }}</h2>
                <p class="mt-2 text-sm text-slate-500">
                  {{ participantSummary(selectedDetail.conversation.participants) }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]" :class="statusClasses(selectedDetail.conversation.status)">
                  {{ statusLabel(selectedDetail.conversation.status) }}
                </span>
                <button
                  v-if="selectedDetail.conversation.status === 'OPEN'"
                  type="button"
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  @click="void closeSelectedConversation()"
                >
                  Cerrar
                </button>
                <button
                  v-else
                  type="button"
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  @click="void reopenSelectedConversation()"
                >
                  Reabrir
                </button>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Categoría</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ categoryLabel(selectedDetail.conversation.category) }}</p>
              </div>
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Prioridad</p>
                <p class="mt-2 text-base font-semibold" :class="priorityTextClasses(selectedDetail.conversation.priority)">{{ priorityLabel(selectedDetail.conversation.priority) }}</p>
              </div>
              <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Contexto</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ scopeLabel(selectedDetail.conversation.scopeType) }}</p>
              </div>
            </div>

            <div class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Historial</p>
                <p class="text-xs text-slate-500">{{ selectedDetail.messages.length }} mensajes</p>
              </div>
              <div class="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                <article
                  v-for="message in selectedDetail.messages"
                  :key="message.id"
                  class="rounded-3xl border px-4 py-4 shadow-sm"
                  :class="message.sender.actorType === 'OWNER' ? 'border-[#ead8ca] bg-[#fffaf5]' : 'border-slate-200 bg-white'"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ message.sender.displayName }}</p>
                      <p class="mt-1 text-xs text-slate-500">
                        {{ formatDateTime(message.createdAt) }} · {{ visibilityLabel(message.visibility) }}
                      </p>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-2">
                      <span
                        v-if="message.priority"
                        class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]"
                        :class="priorityClasses(message.priority)"
                      >
                        {{ priorityLabel(message.priority) }}
                      </span>
                      <span
                        v-if="message.category"
                        class="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500"
                      >
                        {{ categoryLabel(message.category) }}
                      </span>
                    </div>
                  </div>
                  <p class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{{ message.body }}</p>
                  <div v-if="message.attachments.length" class="mt-4 flex flex-wrap gap-2">
                    <a
                      v-for="attachment in message.attachments"
                      :key="attachment.id"
                      :href="attachment.url"
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                    >
                      <SolidIcon name="calendar" class="h-3.5 w-3.5" />
                      {{ attachment.name }}
                    </a>
                  </div>
                </article>
              </div>
            </div>

            <form class="mt-5 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm" @submit.prevent="void sendReply()">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Responder</p>
                <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <input v-model="replyForm.internal" type="checkbox" class="rounded border-slate-300 text-slate-900" />
                  Nota interna
                </label>
              </div>
              <textarea
                v-model="replyForm.body"
                rows="5"
                class="mt-4 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                :disabled="selectedDetail.conversation.status === 'CLOSED' || savingReply"
                placeholder="Escribe un mensaje claro y trazable para el expediente."
              ></textarea>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <label class="space-y-2 text-sm font-semibold text-slate-600">
                  Categoría
                  <select v-model="replyForm.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="">Sin cambio</option>
                    <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>
                <label class="space-y-2 text-sm font-semibold text-slate-600">
                  Prioridad
                  <select v-model="replyForm.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="">Sin cambio</option>
                    <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>
              </div>
              <p v-if="replyError" class="mt-3 text-sm text-rose-600">{{ replyError }}</p>
              <div class="mt-4 flex justify-end">
                <button
                  type="submit"
                  class="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="savingReply || selectedDetail.conversation.status === 'CLOSED'"
                >
                  {{ savingReply ? 'Enviando…' : 'Enviar mensaje' }}
                </button>
              </div>
            </form>
          </article>

          <article v-else class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/80 p-6 shadow-sm xl:min-h-[360px]">
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Detalle de conversación</p>
            <h3 class="mt-3 text-xl font-semibold text-slate-900">Selecciona una conversación para ver el historial</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              Verás participantes, mensajes, prioridad, categoría y el estado completo del hilo.
            </p>
          </article>
        </aside>
      </div>
    </template>

    <div v-if="composeState.open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div class="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c4d29]">Nueva conversación</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Abrir expediente de comunicación</h2>
          </div>
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600" @click="closeCompose">
            Cerrar
          </button>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="void submitCompose()">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Inquilino
              <select v-model="composeForm.tenantId" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Selecciona un inquilino</option>
                <option v-for="tenant in tenantOptions" :key="tenant.id" :value="tenant.id">
                  {{ tenant.fullName }} · {{ tenant.unitName }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Contexto
              <select v-model="composeForm.scopeType" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="GENERAL">General</option>
                <option value="PROPERTY">Propiedad</option>
                <option value="LEASE">Contrato</option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Categoría
              <select v-model="composeForm.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm font-semibold text-slate-600">
              Prioridad
              <select v-model="composeForm.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <label class="space-y-2 text-sm font-semibold text-slate-600">
            Asunto
            <input
              v-model="composeForm.subject"
              type="text"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Ej. Revisión de humedad en baño"
            />
          </label>

          <label class="space-y-2 text-sm font-semibold text-slate-600">
            Mensaje inicial
            <textarea
              v-model="composeForm.initialMessage"
              rows="6"
              class="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              placeholder="Redacta el contexto inicial del expediente."
            ></textarea>
          </label>

          <label class="space-y-2 text-sm font-semibold text-slate-600">
            Enlace de apoyo opcional
            <input
              v-model="composeForm.linkUrl"
              type="url"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>

          <p v-if="composeError" class="text-sm text-rose-600">{{ composeError }}</p>

          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600" @click="closeCompose">
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="savingCompose"
            >
              {{ savingCompose ? 'Creando…' : 'Crear conversación' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import SolidIcon from '../components/SolidIcon.vue';
import { useBilling } from '../composables/useBilling';
import apiClient from '../services/apiClient';
import type {
  CommunicationCategory,
  CommunicationConversationDetail,
  CommunicationConversationListItem,
  CommunicationPriority,
  CommunicationScopeType
} from '../types/communication';

type TenantOption = {
  id: string;
  fullName: string;
  unitId: string | null;
  unitName: string;
  contractStart: string | null;
  contractEnd: string | null;
};

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.PROD ? '/api' : 'http://localhost:4000');
const STREAM_RECONNECT_MS = 5000;
const FALLBACK_POLL_MS = 60000;

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

const proFeatures = [
  { title: 'Trazabilidad', body: 'Historial completo de cada expediente con lectura, cierre y reapertura.' },
  { title: 'Contexto', body: 'Vincula cada hilo a una propiedad o contrato para evitar mensajes sueltos.' },
  { title: 'Prioridad', body: 'Distingue incidencias operativas de avisos normales o urgencias.' },
  { title: 'Notificaciones', body: 'Badges, stream en tiempo real y base lista para email o recordatorios.' }
];

const { isPro, loadSummary } = useBilling();

const loading = ref(false);
const realtimeStatus = ref<'connecting' | 'live' | 'offline'>('connecting');
const conversationItems = ref<CommunicationConversationListItem[]>([]);
const selectedConversationId = ref<string>('');
const selectedDetail = ref<CommunicationConversationDetail | null>(null);
const tenantOptions = ref<TenantOption[]>([]);
const savingCompose = ref(false);
const savingReply = ref(false);
const composeError = ref('');
const replyError = ref('');

const filters = reactive({
  status: '',
  category: '',
  priority: '',
  unreadOnly: false,
  search: ''
});

const composeState = reactive({ open: false });
const composeForm = reactive({
  tenantId: '',
  scopeType: 'LEASE' as CommunicationScopeType,
  category: 'QUESTION' as CommunicationCategory,
  priority: 'normal' as CommunicationPriority,
  subject: '',
  initialMessage: '',
  linkUrl: ''
});

const replyForm = reactive({
  body: '',
  category: '',
  priority: '',
  internal: false
});

let communicationsEventSource: EventSource | null = null;
let reconnectTimeoutId: number | null = null;
let fallbackPollIntervalId: number | null = null;

const realtimeBadge = computed(() => {
  if (realtimeStatus.value === 'live') {
    return {
      label: 'Live',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dotClass: 'bg-emerald-500'
    };
  }
  if (realtimeStatus.value === 'connecting') {
    return {
      label: 'Conectando',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      dotClass: 'bg-amber-500'
    };
  }
  return {
    label: 'Offline',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    dotClass: 'bg-slate-400'
  };
});

const filteredConversations = computed(() => {
  const search = filters.search.trim().toLowerCase();
  return conversationItems.value.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.unreadOnly && item.unreadCount < 1) return false;
    if (!search) return true;
    const haystack = [
      item.subject,
      item.lastMessagePreview,
      item.lastMessageAuthor,
      ...item.participants.map((participant) => participant.displayName)
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(search);
  });
});

const metrics = computed(() => {
  const total = conversationItems.value.length;
  const open = conversationItems.value.filter((item) => item.status === 'OPEN').length;
  const unread = conversationItems.value.filter((item) => item.unreadCount > 0).length;
  const urgent = conversationItems.value.filter((item) => item.priority === 'urgent' && item.status === 'OPEN').length;

  return [
    { id: 'total', label: 'Total conversaciones', value: total, helper: 'Expedientes creados en la bandeja.' },
    { id: 'open', label: 'Abiertas', value: open, helper: 'Hilos aún activos o pendientes de cierre.' },
    { id: 'unread', label: 'Con novedades', value: unread, helper: 'Conversaciones con mensajes sin revisar.' },
    { id: 'urgent', label: 'Urgentes abiertas', value: urgent, helper: 'Prioridad alta que requiere acción.' }
  ];
});

const selectedTenant = computed(() => {
  return tenantOptions.value.find((tenant) => tenant.id === composeForm.tenantId) ?? null;
});

function buildStreamUrl() {
  const normalizedApiBase = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
  const baseUrl = /^https?:\/\//i.test(normalizedApiBase)
    ? normalizedApiBase
    : new URL(normalizedApiBase, window.location.origin).toString();
  return new URL('communications/stream', baseUrl).toString();
}

function formatDateTime(value: string | null) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatRelative(value: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 1) return 'Hace <1h';
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(date);
}

function statusLabel(status: string) {
  return status === 'OPEN' ? 'Abierta' : 'Cerrada';
}

function statusClasses(status: string) {
  return status === 'OPEN'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-slate-100 text-slate-600';
}

function priorityLabel(priority: string) {
  const match = priorityOptions.find((option) => option.value === priority);
  return match?.label ?? priority;
}

function priorityClasses(priority: string) {
  if (priority === 'urgent') return 'bg-rose-50 text-rose-700';
  if (priority === 'high') return 'bg-amber-50 text-amber-700';
  if (priority === 'low') return 'bg-sky-50 text-sky-700';
  return 'bg-slate-100 text-slate-600';
}

function priorityTextClasses(priority: string) {
  if (priority === 'urgent') return 'text-rose-600';
  if (priority === 'high') return 'text-amber-600';
  if (priority === 'low') return 'text-sky-600';
  return 'text-slate-900';
}

function categoryLabel(category: string) {
  const match = categoryOptions.find((option) => option.value === category);
  return match?.label ?? category;
}

function scopeLabel(scopeType: string) {
  if (scopeType === 'LEASE') return 'Contrato';
  if (scopeType === 'PROPERTY') return 'Propiedad';
  return 'General';
}

function visibilityLabel(visibility: string) {
  return visibility === 'INTERNAL' ? 'Interno' : 'Visible';
}

function participantSummary(participants: CommunicationConversationListItem['participants']) {
  return participants
    .filter((participant) => participant.actorType !== 'OWNER')
    .map((participant) => participant.displayName)
    .join(', ') || 'Sin participantes externos';
}

async function loadTenants() {
  const { data } = await apiClient.get('/tenants', { params: { status: 'active' } });
  tenantOptions.value = (Array.isArray(data) ? data : [])
    .map((tenant) => ({
      id: String(tenant.id ?? ''),
      fullName: String(tenant.full_name ?? 'Inquilino'),
      unitId: tenant.unit_id ? String(tenant.unit_id) : tenant.units?.id ? String(tenant.units.id) : null,
      unitName: String(tenant.units?.name ?? 'Sin unidad'),
      contractStart: tenant.contract_start ? String(tenant.contract_start) : null,
      contractEnd: tenant.contract_end ? String(tenant.contract_end) : null
    }))
    .filter((tenant) => tenant.id);
}

async function loadConversations() {
  const { data } = await apiClient.get('/communications/conversations', {
    params: {
      limit: 100,
      status: filters.status || undefined,
      category: filters.category || undefined,
      priority: filters.priority || undefined,
      unreadOnly: filters.unreadOnly || undefined
    }
  });
  conversationItems.value = Array.isArray(data?.items) ? data.items : [];
}

async function loadConversationDetail(conversationId: string, options: { markRead?: boolean } = {}) {
  const { data } = await apiClient.get(`/communications/conversations/${conversationId}`);
  selectedDetail.value = data as CommunicationConversationDetail;
  if (options.markRead !== false) {
    const hasUnread = selectedDetail.value.messages.some((message) => !message.readByCurrentActor && message.sender.actorType !== 'OWNER');
    if (hasUnread) {
      await apiClient.post('/communications/messages/read', { conversationId });
      const target = conversationItems.value.find((item) => item.id === conversationId);
      if (target) {
        target.unreadCount = 0;
      }
      selectedDetail.value.messages = selectedDetail.value.messages.map((message) => ({
        ...message,
        readByCurrentActor: true
      }));
    }
  }
}

async function refreshData(options: { silent?: boolean; forceDetail?: boolean } = {}) {
  if (!isPro.value) return;
  if (!options.silent) {
    loading.value = true;
  }
  try {
    await Promise.all([loadConversations(), loadTenants()]);
    if (!selectedConversationId.value && conversationItems.value.length) {
      selectedConversationId.value = conversationItems.value[0].id;
    }
    if (selectedConversationId.value) {
      const stillExists = conversationItems.value.some((item) => item.id === selectedConversationId.value);
      if (stillExists || options.forceDetail) {
        await loadConversationDetail(selectedConversationId.value, { markRead: true });
      } else {
        selectedConversationId.value = '';
        selectedDetail.value = null;
      }
    }
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
  }, STREAM_RECONNECT_MS);
}

function connectStream() {
  if (!isPro.value || typeof EventSource === 'undefined') {
    realtimeStatus.value = 'offline';
    return;
  }
  disconnectStream();
  realtimeStatus.value = 'connecting';
  const source = new EventSource(buildStreamUrl());
  communicationsEventSource = source;

  source.addEventListener('connected', () => {
    realtimeStatus.value = 'live';
    clearReconnectTimeout();
  });

  const sync = () => {
    realtimeStatus.value = 'live';
    void refreshData({ silent: true, forceDetail: true });
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
    void refreshData({ silent: true, forceDetail: true });
  }, FALLBACK_POLL_MS);
}

function openCompose() {
  composeError.value = '';
  composeState.open = true;
}

function closeCompose() {
  composeState.open = false;
  composeError.value = '';
}

async function submitCompose() {
  composeError.value = '';
  const tenant = selectedTenant.value;
  if (!tenant) {
    composeError.value = 'Selecciona un inquilino válido.';
    return;
  }
  if (!composeForm.subject.trim() || !composeForm.initialMessage.trim()) {
    composeError.value = 'Asunto y mensaje inicial son obligatorios.';
    return;
  }

  savingCompose.value = true;
  try {
    const attachments = composeForm.linkUrl.trim()
      ? [
          {
            type: 'LINK',
            name: 'Enlace adjunto',
            url: composeForm.linkUrl.trim()
          }
        ]
      : [];

    const { data } = await apiClient.post('/communications/conversations', {
      subject: composeForm.subject.trim(),
      tenantPersonId: tenant.id,
      unitId: composeForm.scopeType === 'GENERAL' ? null : tenant.unitId,
      leaseId: composeForm.scopeType === 'LEASE' ? tenant.id : null,
      scopeType: composeForm.scopeType,
      category: composeForm.category,
      priority: composeForm.priority,
      initialMessage: composeForm.initialMessage.trim(),
      attachments
    });

    closeCompose();
    composeForm.tenantId = '';
    composeForm.scopeType = 'LEASE';
    composeForm.category = 'QUESTION';
    composeForm.priority = 'normal';
    composeForm.subject = '';
    composeForm.initialMessage = '';
    composeForm.linkUrl = '';
    await refreshData({ silent: true, forceDetail: true });
    const conversationId = data?.conversation?.id ? String(data.conversation.id) : '';
    if (conversationId) {
      await selectConversation(conversationId);
    }
  } catch (error: any) {
    composeError.value = String(error?.response?.data?.message ?? 'No se pudo crear la conversación.');
  } finally {
    savingCompose.value = false;
  }
}

async function sendReply() {
  replyError.value = '';
  if (!selectedConversationId.value) return;
  if (!replyForm.body.trim()) {
    replyError.value = 'El mensaje no puede estar vacío.';
    return;
  }
  savingReply.value = true;
  try {
    const { data } = await apiClient.post(`/communications/conversations/${selectedConversationId.value}/messages`, {
      body: replyForm.body.trim(),
      visibility: replyForm.internal ? 'INTERNAL' : 'EXTERNAL',
      category: replyForm.category || null,
      priority: replyForm.priority || null
    });
    selectedDetail.value = data as CommunicationConversationDetail;
    replyForm.body = '';
    replyForm.category = '';
    replyForm.priority = '';
    replyForm.internal = false;
    await loadConversations();
  } catch (error: any) {
    replyError.value = String(error?.response?.data?.message ?? 'No se pudo enviar el mensaje.');
  } finally {
    savingReply.value = false;
  }
}

async function closeSelectedConversation() {
  if (!selectedConversationId.value) return;
  await apiClient.post(`/communications/conversations/${selectedConversationId.value}/close`);
  await refreshData({ silent: true, forceDetail: true });
}

async function reopenSelectedConversation() {
  if (!selectedConversationId.value) return;
  await apiClient.post(`/communications/conversations/${selectedConversationId.value}/reopen`);
  await refreshData({ silent: true, forceDetail: true });
}

watch(isPro, (value) => {
  if (!value) {
    disconnectStream();
    selectedConversationId.value = '';
    selectedDetail.value = null;
    conversationItems.value = [];
    return;
  }
  void refreshData({ silent: false, forceDetail: true });
  connectStream();
}, { immediate: true });

watch(
  () => [filters.status, filters.category, filters.priority, filters.unreadOnly],
  () => {
    if (!isPro.value) return;
    void loadConversations();
  }
);

onMounted(() => {
  loadSummary().catch((error) => console.error(error));
  if (isPro.value) {
    void refreshData({ silent: false, forceDetail: true });
    connectStream();
  }
  startFallbackPolling();
});

onBeforeUnmount(() => {
  disconnectStream();
  clearFallbackPolling();
});
</script>
