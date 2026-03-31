<template>
  <article
    class="cursor-pointer"
    :class="[
      'px-4 py-4 transition-colors',
      status === 'VENCIDO' ? 'bg-[#fff8f6]' : 'bg-white',
      isHighlighted ? 'bg-[#f5faf8]' : '',
      !isHighlighted && status !== 'VENCIDO' ? 'hover:bg-[#fbf8f2]' : ''
    ]"
    role="button"
    tabindex="0"
    @click="emitAction('details')"
    @keydown.enter.prevent="emitAction('details')"
    @keydown.space.prevent="emitAction('details')"
  >
    <div class="grid gap-4 md:grid-cols-[minmax(0,1.85fr)_minmax(230px,1.1fr)_minmax(120px,0.7fr)_minmax(170px,auto)] md:items-center">
      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-[15px] font-semibold leading-5 text-slate-900">{{ tenant.full_name }}</p>
          <span
            v-if="selected"
            class="inline-flex items-center rounded-full bg-[#f4dfd2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c4d29]"
          >
            Activo
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span>DNI: {{ tenant.identification ?? '—' }}</span>
          <span class="hidden text-slate-300 md:inline">•</span>
          <span class="font-medium text-slate-500">{{ tenant.units?.name ?? 'Sin apartamento asignado' }}</span>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Contrato</p>
        <div class="mt-1 grid gap-1">
          <p class="text-sm font-semibold leading-5 text-slate-900">{{ formattedStart }} → {{ formattedEnd }}</p>
          <p class="text-xs text-slate-400">{{ daysLabel }}</p>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:sr-only">Estado</p>
        <div class="mt-1 flex flex-wrap items-center gap-2 md:mt-0">
          <TenantStatusBadge :status="status" />
        </div>
      </div>

      <div class="hidden md:flex md:flex-col md:items-end md:gap-2">
        <button
          class="inline-flex items-center justify-center rounded-full bg-[#1f4f46] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#173c36]"
          type="button"
          @click.stop="emitAction('edit')"
        >
          Editar
        </button>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            class="inline-flex items-center justify-center rounded-full border border-[#d9cdbc] bg-[#fbf8f2] px-3 py-1.5 text-[11px] font-semibold text-[#8c4d29] transition hover:bg-[#f6efe5]"
            type="button"
            title="Descargar contrato PDF"
            aria-label="Descargar contrato PDF"
            @click.stop="emitAction('pdf')"
          >
            PDF
          </button>
          <button
            v-if="status !== 'ARCHIVADO'"
            class="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            type="button"
            @click.stop="emitAction('finalize')"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#efe7dd] pt-3 md:hidden">
      <div class="flex w-full flex-wrap items-center gap-2">
        <TenantStatusBadge :status="status" />
      </div>
      <button
        class="inline-flex min-w-[104px] items-center justify-center rounded-full bg-[#1f4f46] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#173c36]"
        type="button"
        @click.stop="emitAction('edit')"
      >
        Editar
      </button>
      <button
        class="inline-flex items-center justify-center rounded-full border border-[#d9cdbc] bg-[#fbf8f2] px-3.5 py-2 text-[12px] font-semibold text-[#8c4d29] transition hover:bg-[#f6efe5]"
        type="button"
        title="Descargar contrato PDF"
        aria-label="Descargar contrato PDF"
        @click.stop="emitAction('pdf')"
      >
        PDF
      </button>
      <button
        v-if="status !== 'ARCHIVADO'"
        class="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
        type="button"
        @click.stop="emitAction('finalize')"
      >
        Finalizar
      </button>
    </div>
  </article>
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
  selected?: boolean;
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
