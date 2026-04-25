<template>
  <div class="min-h-screen bg-[#f6f3ee] text-slate-900">
    <div class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(31,79,70,0.15),_transparent_26%),radial-gradient(circle_at_88%_4%,_rgba(201,106,55,0.12),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(246,243,238,0))]"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="rounded-[32px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-[#d5cbc1] bg-[#fbf8f2] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f4f46]">
              <SolidIcon name="home" class="h-3.5 w-3.5 text-[#c96a37]" />
              <span>Portal del inquilino</span>
            </div>
            <div>
              <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">Tu alquiler, en un sitio útil</h1>
              <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Consulta contrato, pagos, documentos e incidencias sin salir del portal.
              </p>
            </div>
          </div>

          <UserButton v-if="tenantPortalEnabled" :appearance="clerkUserButtonAppearance" />
        </div>
      </header>

      <section v-if="!tenantPortalEnabled" class="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
        El portal del inquilino está desactivado en modo mínimo.
      </section>

      <section v-else-if="loadError" class="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ loadError }}
      </section>

      <section v-else-if="loading && !overview" class="mt-6 rounded-[28px] border border-[#d9d1c9] bg-white px-5 py-8 text-sm text-slate-600 shadow-sm">
        Cargando portal del inquilino…
      </section>

      <template v-else-if="overview">
        <section class="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Resumen</p>
            <div class="mt-4 space-y-4">
              <div>
                <h2 class="text-2xl font-semibold text-slate-900">{{ overview.tenant.fullName }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ overview.unit?.name ?? 'Unidad sin nombre' }}</p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Estado del contrato</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ contractStatusLabel }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Correo vinculado</p>
                  <p class="mt-2 break-all text-base font-semibold text-slate-900">{{ overview.tenant.email ?? 'Sin correo' }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Inicio</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(overview.tenant.contractStart) }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Fin</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ formatDate(overview.tenant.contractEnd) }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Dirección</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">
                    {{ fullAddress }}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <section class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article
              v-for="metric in summaryMetrics"
              :key="metric.id"
              class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ metric.helper }}</p>
            </article>
          </section>
        </section>

        <section
          v-if="renewalNotice?.visible"
          class="mt-6 rounded-[32px] border px-5 py-5 shadow-sm"
          :class="renewalBannerClasses"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em]">Renovación</p>
              <h2 class="mt-1 text-xl font-semibold">
                El contrato vence en {{ renewalNotice.daysRemaining }} {{ renewalNotice.daysRemaining === 1 ? 'día' : 'días' }}
              </h2>
              <p class="mt-2 text-sm leading-6">
                Fin de contrato: {{ formatDate(renewalNotice.contractEnd) }}. Este aviso aparece {{ renewalNotice.thresholdDays }} días antes del vencimiento.
              </p>
            </div>
            <div class="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
              Aviso activo
            </div>
          </div>
        </section>

        <section
          v-if="premiumActive"
          class="mt-6 rounded-[32px] border border-[#d9d1c9] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,247,243,0.96))] p-5 shadow-sm"
        >
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Portal premium</p>
              <h2 class="mt-1 text-xl font-semibold text-slate-900">Pagos, documentos e incidencias activados</h2>
              <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Este propietario tiene disponible la experiencia premium del portal del inquilino.
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-[#1f4f46] px-4 py-2 text-sm font-semibold text-[#1f4f46] transition hover:bg-[#edf6f2]"
              :disabled="loading"
              @click="refreshData"
            >
              Actualizar
            </button>
          </div>
        </section>

        <section
          v-else
          class="mt-6 rounded-[32px] border border-[#d9d1c9] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,247,243,0.96))] p-5 shadow-sm"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c4d29]">Portal básico</p>
          <h2 class="mt-1 text-xl font-semibold text-slate-900">Información esencial disponible</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {{ premiumFallbackMessage }}
          </p>
        </section>

        <template v-if="premiumActive">
          <section class="mt-6 grid gap-6 xl:grid-cols-2">
            <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Pagos pendientes</p>
                  <h2 class="mt-1 text-2xl font-semibold text-slate-900">{{ pendingPayments.length }}</h2>
                  <p class="mt-2 text-sm text-slate-500">Pendientes y atrasados, con su vencimiento y estado.</p>
                </div>
                <div class="rounded-2xl border border-[#eadfd2] bg-[#fbf8f2] px-4 py-3 text-right">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Pendiente total</p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">{{ formatCurrency(paymentSummary.outstandingAmount) }}</p>
                </div>
              </div>

              <div class="mt-5 space-y-3">
                <article
                  v-for="payment in pendingPayments"
                  :key="payment.id"
                  class="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-base font-semibold text-slate-900">{{ formatPaymentPeriod(payment) }}</p>
                        <span class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]" :class="paymentStatusClasses(payment.status)">
                          {{ paymentStatusLabel(payment.status) }}
                        </span>
                      </div>
                      <p class="mt-1 text-sm text-slate-500">{{ payment.unitName ?? overview.unit?.name ?? 'Tu vivienda' }}</p>
                    </div>
                    <p class="text-xl font-semibold text-slate-900">{{ formatCurrency(payment.amount) }}</p>
                  </div>
                  <div class="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Vencimiento</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatDate(payment.dueDate) }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Método</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ paymentMethodLabel(payment.paymentMethod) }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Estado</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ paymentStatusLabel(payment.status) }}</p>
                    </div>
                  </div>
                </article>

                <div v-if="!pendingPayments.length" class="rounded-3xl border border-dashed border-[#d8cec2] bg-[#fbf8f2] p-5 text-sm text-slate-500">
                  No tienes pagos pendientes ahora mismo.
                </div>
              </div>
            </article>

            <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Histórico de pagos</p>
                  <h2 class="mt-1 text-2xl font-semibold text-slate-900">{{ paymentHistory.length }}</h2>
                  <p class="mt-2 text-sm text-slate-500">Pagos abonados con fecha, método y acceso al recibo.</p>
                </div>
                <div class="rounded-2xl border border-[#d8e4de] bg-[#f3faf6] px-4 py-3 text-right">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Pagado</p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">{{ formatCurrency(paymentSummary.paidAmount) }}</p>
                </div>
              </div>

              <div class="mt-5 space-y-3">
                <article
                  v-for="payment in paymentHistory"
                  :key="payment.id"
                  class="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-base font-semibold text-slate-900">{{ formatPaymentPeriod(payment) }}</p>
                        <span class="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                          Pagado
                        </span>
                      </div>
                      <p class="mt-1 text-sm text-slate-500">{{ payment.unitName ?? overview.unit?.name ?? 'Tu vivienda' }}</p>
                    </div>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div class="text-left sm:text-right">
                        <p class="text-xl font-semibold text-slate-900">{{ formatCurrency(payment.amount) }}</p>
                        <p class="mt-1 text-sm text-slate-500">{{ formatDate(payment.paidDate) }} · {{ paymentMethodLabel(payment.paymentMethod) }}</p>
                      </div>
                      <button
                        type="button"
                        class="rounded-2xl border border-[#1f4f46] px-4 py-2 text-sm font-semibold text-[#1f4f46] transition hover:bg-[#edf6f2]"
                        :disabled="downloadingKey === payment.id"
                        @click="downloadFile(payment.receiptDownloadUrl, `recibo-${payment.id}.pdf`, payment.id)"
                      >
                        {{ downloadingKey === payment.id ? 'Descargando…' : 'Descargar recibo' }}
                      </button>
                    </div>
                  </div>
                </article>

                <div v-if="!paymentHistory.length" class="rounded-3xl border border-dashed border-[#d8cec2] bg-[#fbf8f2] p-5 text-sm text-slate-500">
                  Aún no hay pagos abonados en el histórico.
                </div>
              </div>
            </article>
          </section>

          <section class="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Documentos</p>
              <h2 class="mt-1 text-2xl font-semibold text-slate-900">Contrato y recibos</h2>
              <p class="mt-2 text-sm text-slate-500">Solo se muestran documentos que pertenecen a tu expediente.</p>

              <div class="mt-5 space-y-3">
                <article class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="text-base font-semibold text-slate-900">Contrato de alquiler</p>
                      <p class="mt-1 text-sm text-slate-500">Versión PDF del contrato vinculado a tu alquiler actual.</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-2xl border border-[#1f4f46] px-4 py-2 text-sm font-semibold text-[#1f4f46] transition hover:bg-[#edf6f2] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      :disabled="!contractDocument?.available || downloadingKey === 'contract'"
                      @click="downloadFile(contractDocument?.downloadUrl, `contrato-${overview.tenant.id}.pdf`, 'contract')"
                    >
                      {{ downloadingKey === 'contract' ? 'Descargando…' : contractDocument?.available ? 'Descargar contrato' : 'No disponible' }}
                    </button>
                  </div>
                </article>

                <article class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-base font-semibold text-slate-900">Recibos emitidos</p>
                      <p class="mt-1 text-sm text-slate-500">{{ receiptDocuments.length }} recibos disponibles para descarga.</p>
                    </div>
                    <div class="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Pagados
                    </div>
                  </div>

                  <div class="mt-4 space-y-3">
                    <div
                      v-for="receipt in receiptDocuments"
                      :key="receipt.id"
                      class="flex flex-col gap-3 rounded-2xl border border-white bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p class="text-sm font-semibold text-slate-900">{{ receipt.title }}</p>
                        <p class="mt-1 text-xs text-slate-500">{{ formatDate(receipt.paidDate) }} · {{ formatCurrency(receipt.amount) }}</p>
                      </div>
                      <button
                        type="button"
                        class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        :disabled="downloadingKey === receipt.id"
                        @click="downloadFile(receipt.downloadUrl, `recibo-${receipt.paymentId}.pdf`, receipt.id)"
                      >
                        {{ downloadingKey === receipt.id ? 'Descargando…' : 'Abrir PDF' }}
                      </button>
                    </div>

                    <div v-if="!receiptDocuments.length" class="rounded-2xl border border-dashed border-[#d8cec2] bg-[#fbf8f2] p-4 text-sm text-slate-500">
                      Todavía no hay recibos emitidos para tus pagos abonados.
                    </div>
                  </div>
                </article>
              </div>
            </article>

            <article class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Incidencias</p>
                  <h2 class="mt-1 text-2xl font-semibold text-slate-900">Seguimiento y reporte</h2>
                  <p class="mt-2 text-sm text-slate-500">Crea incidencias y revisa el estado de las ya registradas.</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-2xl border border-[#eadfd2] bg-[#fbf8f2] px-4 py-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Abiertas</p>
                    <p class="mt-2 text-xl font-semibold text-slate-900">{{ incidentSummary.openCount }}</p>
                  </div>
                  <div class="rounded-2xl border border-[#d8e4de] bg-[#f3faf6] px-4 py-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Cerradas</p>
                    <p class="mt-2 text-xl font-semibold text-slate-900">{{ incidentSummary.closedCount }}</p>
                  </div>
                </div>
              </div>

              <form class="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4" @submit.prevent="submitIncident">
                <div class="grid gap-3">
                  <label class="space-y-2 text-sm font-semibold text-slate-700">
                    Título
                    <input
                      v-model="incidentForm.title"
                      type="text"
                      maxlength="140"
                      placeholder="Ej. Fuga en el baño principal"
                      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#1f4f46] focus:outline-none"
                    />
                  </label>
                  <label class="space-y-2 text-sm font-semibold text-slate-700">
                    Descripción
                    <textarea
                      v-model="incidentForm.description"
                      rows="4"
                      maxlength="1000"
                      placeholder="Describe qué pasa, desde cuándo y cualquier detalle útil."
                      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#1f4f46] focus:outline-none"
                    ></textarea>
                  </label>
                </div>

                <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-sm text-slate-500">La incidencia se registrará sobre la vivienda vinculada a tu contrato actual.</p>
                  <button
                    type="submit"
                    class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    :disabled="creatingIncident || !incidentSummary.canCreate"
                  >
                    {{ creatingIncident ? 'Enviando…' : 'Crear incidencia' }}
                  </button>
                </div>
              </form>

              <div class="mt-5 space-y-3">
                <article
                  v-for="incident in incidents"
                  :key="incident.id"
                  class="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-base font-semibold text-slate-900">{{ incident.title }}</p>
                        <span class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]" :class="incidentStatusClasses(incident.status)">
                          {{ incidentStatusLabel(incident.status) }}
                        </span>
                      </div>
                      <p class="mt-2 text-sm leading-6 text-slate-600">{{ incident.description }}</p>
                    </div>
                    <div class="rounded-2xl border border-white bg-white px-4 py-3 text-sm">
                      <p class="font-semibold text-slate-900">{{ incident.unitName ?? overview.unit?.name ?? 'Tu vivienda' }}</p>
                      <p class="mt-1 text-slate-500">Creada {{ formatDate(incident.createdAt) }}</p>
                    </div>
                  </div>

                  <div class="mt-4 grid gap-3 md:grid-cols-3">
                    <div class="rounded-2xl border border-white bg-white p-3">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Último cambio</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatDateTime(incident.statusUpdatedAt ?? incident.updatedAt) }}</p>
                    </div>
                    <div class="rounded-2xl border border-white bg-white p-3">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Cierre</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatDateTime(incident.closedAt) }}</p>
                    </div>
                    <div class="rounded-2xl border border-white bg-white p-3">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Reportada por</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ reportedByLabel(incident.reportedBy) }}</p>
                    </div>
                  </div>
                </article>

                <div v-if="!incidents.length" class="rounded-3xl border border-dashed border-[#d8cec2] bg-[#fbf8f2] p-5 text-sm text-slate-500">
                  No hay incidencias registradas para tu contrato.
                </div>
              </div>
            </article>
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { UserButton } from '@clerk/vue';
import { useRoute, useRouter } from 'vue-router';
import SolidIcon from '../components/SolidIcon.vue';
import { runtimeConfig } from '../config/runtimeConfig';
import { clerkUserButtonAppearance } from '../services/clerkAppearance';
import tenantApiClient from '../services/tenantApiClient';
import type { TenantPortalOverview, TenantPortalPayment, TenantPortalIncident } from '../types/tenantPortal';
import { clearTenantPortalInviteToken, rememberTenantPortalInviteToken } from '../services/tenantPortalInvite';

const overview = ref<TenantPortalOverview | null>(null);
const loading = ref(false);
const loadError = ref('');
const creatingIncident = ref(false);
const downloadingKey = ref('');
const tenantPortalEnabled = runtimeConfig.enableTenantPortal;
const tenantPortalPremiumEnabled = runtimeConfig.enableTenantPortalPremium;
const route = useRoute();
const router = useRouter();
const incidentForm = reactive({
  title: '',
  description: ''
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const fullAddress = computed(() => {
  return [overview.value?.unit?.address, overview.value?.unit?.city, overview.value?.unit?.postalCode].filter(Boolean).join(', ') || 'Sin dirección disponible';
});

const contractStatusLabel = computed(() => {
  const status = String(overview.value?.tenant.status ?? '').trim().toUpperCase();
  if (!status) return 'Sin estado';
  if (status === 'ACTIVE') return 'Activo';
  if (status === 'ARCHIVED') return 'Archivado';
  return status;
});

const premiumActive = computed(() => {
  return Boolean(tenantPortalPremiumEnabled && overview.value?.premium.enabled);
});

const paymentSummary = computed(() => {
  return overview.value?.premium.payments?.summary ?? {
    pendingCount: 0,
    lateCount: 0,
    paidCount: 0,
    outstandingAmount: 0,
    paidAmount: 0
  };
});

const pendingPayments = computed<TenantPortalPayment[]>(() => overview.value?.premium.payments?.pending ?? []);
const paymentHistory = computed<TenantPortalPayment[]>(() => overview.value?.premium.payments?.history ?? []);
const receiptDocuments = computed(() => overview.value?.premium.documents?.receipts ?? []);
const contractDocument = computed(() => overview.value?.premium.documents?.contract ?? null);
const incidents = computed<TenantPortalIncident[]>(() => overview.value?.premium.incidents?.items ?? []);
const incidentSummary = computed(() => overview.value?.premium.incidents ?? {
  items: [],
  openCount: 0,
  closedCount: 0,
  canCreate: false
});
const renewalNotice = computed(() => overview.value?.premium.renewalNotice ?? null);

const premiumFallbackMessage = computed(() => {
  if (!tenantPortalPremiumEnabled) {
    return 'La capa premium del portal está desactivada en este entorno. El acceso básico al contrato y a la vivienda sigue disponible.';
  }

  if (overview.value?.premium.reason === 'owner_plan_required') {
    return 'Este propietario no tiene activado el plan Pro. El portal mantiene el acceso básico al contrato y a la vivienda sin exponer funciones premium.';
  }

  return 'El portal mantiene la vista básica del alquiler mientras las funciones premium no estén disponibles.';
});

const renewalBannerClasses = computed(() => {
  const tone = renewalNotice.value?.tone;
  if (tone === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-800';
  }
  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-[#d9d1c9] bg-[#fbf8f2] text-[#8c4d29]';
});

const summaryMetrics = computed(() => {
  return [
    {
      id: 'unit',
      label: 'Propiedad',
      value: overview.value?.unit?.name ?? 'Sin propiedad',
      helper: 'Vivienda vinculada a tu expediente.'
    },
    {
      id: 'pending',
      label: premiumActive.value ? 'Pagos pendientes' : 'Estado',
      value: premiumActive.value ? String(paymentSummary.value.pendingCount + paymentSummary.value.lateCount) : contractStatusLabel.value,
      helper: premiumActive.value ? 'Pendientes o atrasados.' : 'Situación actual del contrato.'
    },
    {
      id: 'documents',
      label: premiumActive.value ? 'Recibos' : 'Ciudad',
      value: premiumActive.value ? String(receiptDocuments.value.length) : overview.value?.unit?.city ?? 'Sin ciudad',
      helper: premiumActive.value ? 'Recibos descargables.' : 'Ubicación cargada en la ficha.'
    }
  ];
});

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return dateFormatter.format(parsed);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return dateTimeFormatter.format(parsed);
}

function formatCurrency(value: number | null | undefined) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatPaymentPeriod(payment: TenantPortalPayment) {
  if (!payment.month || !payment.year) return 'Periodo sin fecha';
  const date = new Date(Date.UTC(payment.year, payment.month - 1, 1));
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
}

function paymentStatusLabel(status: TenantPortalPayment['status']) {
  if (status === 'PAID') return 'Pagado';
  if (status === 'LATE') return 'Atrasado';
  return 'Pendiente';
}

function paymentStatusClasses(status: TenantPortalPayment['status']) {
  if (status === 'LATE') return 'bg-rose-50 text-rose-700';
  if (status === 'PAID') return 'bg-emerald-50 text-emerald-700';
  return 'bg-amber-50 text-amber-700';
}

function paymentMethodLabel(method: TenantPortalPayment['paymentMethod']) {
  if (method === 'BANK') return 'Banco';
  if (method === 'CASH') return 'Efectivo';
  return 'No indicado';
}

function incidentStatusLabel(status: TenantPortalIncident['status']) {
  if (status === 'IN_PROGRESS') return 'En progreso';
  if (status === 'CLOSED') return 'Cerrada';
  return 'Abierta';
}

function incidentStatusClasses(status: TenantPortalIncident['status']) {
  if (status === 'CLOSED') return 'bg-emerald-50 text-emerald-700';
  if (status === 'IN_PROGRESS') return 'bg-sky-50 text-sky-700';
  return 'bg-amber-50 text-amber-700';
}

function reportedByLabel(reportedBy: TenantPortalIncident['reportedBy']) {
  if (reportedBy === 'TENANT') return 'Inquilino';
  if (reportedBy === 'SYSTEM') return 'Sistema';
  return 'Propietario';
}

function parseFileName(disposition?: string | null, fallback = 'documento.pdf') {
  const match = String(disposition ?? '').match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? fallback;
}

async function loadOverview() {
  const { data } = await tenantApiClient.get('/me');
  overview.value = data as TenantPortalOverview;
  clearTenantPortalInviteToken();
}

async function refreshData() {
  loading.value = true;
  loadError.value = '';

  try {
    await loadOverview();
  } catch (error: any) {
    loadError.value = String(error?.response?.data?.message ?? 'No se pudo cargar el portal del inquilino.');
  } finally {
    loading.value = false;
  }
}

async function downloadFile(url: string | null | undefined, fallbackName: string, key: string) {
  if (!url) {
    return;
  }

  downloadingKey.value = key;
  try {
    const response = await tenantApiClient.get(url, {
      responseType: 'blob'
    });
    const contentType = String(response.headers['content-type'] ?? '');
    if (!contentType.includes('application/pdf')) {
      const message = await response.data.text().catch(() => '');
      throw new Error(message || 'La respuesta no es un PDF válido.');
    }
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = parseFileName(response.headers['content-disposition'], fallbackName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: any) {
    loadError.value = String(error?.response?.data?.message ?? error?.message ?? 'No se pudo descargar el documento.');
  } finally {
    downloadingKey.value = '';
  }
}

async function submitIncident() {
  if (!incidentSummary.value.canCreate || creatingIncident.value) {
    return;
  }

  creatingIncident.value = true;
  loadError.value = '';

  try {
    await tenantApiClient.post('/incidents', {
      title: incidentForm.title,
      description: incidentForm.description
    });
    incidentForm.title = '';
    incidentForm.description = '';
    await refreshData();
  } catch (error: any) {
    const errors = error?.response?.data?.errors;
    if (Array.isArray(errors) && errors.length) {
      loadError.value = String(errors[0]);
    } else {
      loadError.value = String(error?.response?.data?.message ?? 'No se pudo crear la incidencia.');
    }
  } finally {
    creatingIncident.value = false;
  }
}

onMounted(() => {
  if (!tenantPortalEnabled) {
    return;
  }

  const inviteToken = String(route.query.invite ?? '').trim();
  rememberTenantPortalInviteToken(inviteToken);
  if (inviteToken) {
    const nextQuery = { ...route.query };
    delete nextQuery.invite;
    void router.replace({ query: nextQuery });
  }
  void refreshData();
});
</script>
