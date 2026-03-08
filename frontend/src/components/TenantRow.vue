<template>
  <tr
    :class="[
      'transition-colors hover:bg-slate-50 focus-within:bg-slate-50 odd:bg-slate-50 even:bg-white',
      status === 'VENCIDO' ? 'bg-rose-50/60 ring-1 ring-rose-200 shadow-inner' : '',
      isHighlighted ? 'ring-2 ring-blue-300/70 shadow-[0_0_20px_-6px_rgba(96,165,250,0.8)]' : ''
    ]"
  >
    <td class="px-3 py-4 align-top space-y-1">
      <p class="text-sm font-semibold text-slate-900">{{ tenant.full_name }}</p>
      <p class="text-xs text-slate-400">DNI: {{ tenant.identification ?? '—' }}</p>
    </td>
    <td class="px-3 py-4 align-top space-y-1 text-sm font-medium text-slate-800">
      <p class="text-base font-semibold text-slate-900">{{ tenant.units?.name ?? '—' }}</p>
    </td>
    <td class="px-3 py-4 align-top space-y-1">
      <p class="text-sm font-semibold text-slate-900">{{ formattedStart }}</p>
    </td>
    <td class="px-3 py-4 align-top space-y-1">
      <p class="text-sm font-semibold text-slate-900">{{ formattedEnd }}</p>
      <p class="text-xs text-slate-400">{{ daysLabel }}</p>
    </td>
    <td class="px-3 py-4 align-top space-y-1">
      <TenantStatusBadge :status="status" />
    </td>
    <td class="px-3 py-4 align-top">
      <div class="space-y-2">
        <button
          class="w-full rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          type="button"
          @click="emitAction('edit')"
        >
          Editar
        </button>
        <div class="flex gap-2">
          <button
            class="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
            type="button"
            @click="emitAction('details')"
          >
            Ver detalle
          </button>
          <button
            class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900"
            type="button"
            @click="emitAction('pdf')"
          >
            Generar PDF
          </button>
        </div>
        <button
          v-if="status !== 'ARCHIVADO'"
          class="w-full rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300"
          type="button"
          @click="emitAction('finalize')"
        >
          Finalizar contrato
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import TenantStatusBadge from './TenantStatusBadge.vue';
import type { TenantWithMeta } from '../types/tenant';

const props = defineProps<{
  tenant: TenantWithMeta;
  formattedStart: string;
  formattedEnd: string;
  status: TenantWithMeta['status'];
  daysLabel: string;
  isHighlighted?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', tenant: TenantWithMeta): void;
  (e: 'details', tenant: TenantWithMeta): void;
  (e: 'pdf', tenant: TenantWithMeta): void;
  (e: 'finalize', tenant: TenantWithMeta): void;
}>();

const emitAction = (action: 'edit' | 'details' | 'pdf' | 'finalize') => {
  emit(action, props.tenant);
};
</script>
