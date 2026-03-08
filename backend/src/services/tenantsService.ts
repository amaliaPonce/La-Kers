import { supabaseAdmin } from '../config/supabaseClient';
import { updateApartment } from './apartmentsService';
import { createPayment, getPaymentForMonth } from './paymentsService';

export type TenantPayload = {
  unit_id: string;
  full_name: string;
  identification: string;
  contract_start: string;
  contract_end: string;
};

type TenantRecord = {
  id: string;
  unit_id: string;
  contract_start: string;
  contract_end: string;
  status: TenantLifecycleStatus;
  archived_at?: string | null;
  is_anonymized?: boolean;
};

type TenantLifecycleStatus = 'ACTIVE' | 'ARCHIVED';
type UnitStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type TenantListMode = 'active' | 'archived' | 'all';

export async function listTenants(options: { mode?: TenantListMode } = { mode: 'active' }) {
  const mode = options.mode ?? 'active';
  let query = supabaseAdmin
    .from('tenant_persons')
    .select('*, units(name, status, monthly_rent)')
    .order('created_at', { ascending: false });

  if (mode === 'active') {
    query = query.eq('status', 'ACTIVE');
  } else if (mode === 'archived') {
    query = query.eq('status', 'ARCHIVED');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTenant(payload: TenantPayload) {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .insert({ ...payload, status: 'ACTIVE' })
    .single();
  if (error) throw error;
  if (!data) {
    throw new Error('Tenant no insertado');
  }
  const tenantRecord = data as TenantRecord;
  await ensurePendingPaymentForTenant(tenantRecord).catch((err) => console.error('[TenantPayment]', err));
  await synchronizeApartmentStatus(String(tenantRecord.unit_id ?? ''));
  return data;
}

export async function updateTenant(id: string, payload: Partial<TenantPayload>) {
  const existingTenant = (await getTenantById(id)) as TenantRecord | null;
  if (!existingTenant) {
    throw new Error('Tenant no encontrado');
  }

  const { data, error } = await supabaseAdmin.from('tenant_persons').update(payload).eq('id', id).single();
  if (error) throw error;

  const updatedTenant = data as TenantRecord;
  const unitsToSync = new Set<string>();
  if (existingTenant.unit_id) {
    unitsToSync.add(existingTenant.unit_id);
  }
  if (updatedTenant.unit_id) {
    unitsToSync.add(updatedTenant.unit_id);
  }
  await Promise.all([...unitsToSync].map((unitId) => synchronizeApartmentStatus(unitId)));

  return data;
}

export async function getTenantById(id: string) {
  const { data, error } = await supabaseAdmin.from('tenant_persons').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function ensurePendingPaymentForTenant(tenant: TenantRecord) {
  if (!tenant.unit_id || !tenant.contract_start || !tenant.contract_end) return;
  const today = new Date();
  const startDate = new Date(tenant.contract_start);
  const endDate = new Date(tenant.contract_end);
  if (startDate > today || endDate < today) return;
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const { data: unit, error } = await supabaseAdmin
    .from('units')
    .select('monthly_rent')
    .eq('id', tenant.unit_id)
    .single();
  if (error || !unit) {
    if (error) throw error;
    return;
  }
  const rent = Number(unit.monthly_rent ?? 0);
  const dueDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const existingPayment = await getPaymentForMonth(tenant.unit_id, month, year);
  if (existingPayment) {
    await supabaseAdmin
      .from('payments')
      .update({
        tenant_person_id: tenant.id,
        amount: rent,
        due_date: dueDate,
        status: 'PENDING',
        paid_date: null
      })
      .eq('id', existingPayment.id);
    return;
  }
  await createPayment({
    unit_id: tenant.unit_id,
    tenant_person_id: tenant.id,
    amount: rent,
    due_date: dueDate,
    month,
    year
  });
}

export async function finalizeTenantContract(id: string, finalDate: string) {
  const tenant = (await getTenantById(id)) as TenantRecord | null;
  if (!tenant) {
    throw new Error('Tenant no encontrado');
  }
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .update({ contract_end: finalDate })
    .eq('id', id)
    .single();
  if (error) throw error;
  await archiveTenantRecord(id, finalDate);
  await synchronizeApartmentStatus(String(tenant.unit_id ?? ''));
  return data;
}

async function determineApartmentStatus(unitId: string): Promise<UnitStatus> {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('contract_start, contract_end')
    .eq('unit_id', unitId);
  if (error) throw error;

  const tenants = data ?? [];
  const today = new Date();
  let hasFutureContract = false;

  for (const tenant of tenants) {
    const startDate = new Date(String(tenant.contract_start ?? ''));
    const endDate = new Date(String(tenant.contract_end ?? ''));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      continue;
    }
    if (startDate <= today && endDate >= today) {
      return 'OCCUPIED';
    }
    if (startDate > today) {
      hasFutureContract = true;
    }
  }

  if (hasFutureContract) {
    return 'RESERVED';
  }

  return 'AVAILABLE';
}

async function synchronizeApartmentStatus(unitId: string) {
  if (!unitId) return;
  try {
    const status = await determineApartmentStatus(unitId);
    await updateApartment(unitId, { status });
  } catch (error) {
    console.error('[TenantStatus]', error);
  }
}

export async function archiveTenantRecord(id: string, archivedAt: string) {
  const { error } = await supabaseAdmin
    .from('tenant_persons')
    .update({
      status: 'ARCHIVED',
      archived_at: archivedAt,
      is_anonymized: false
    })
    .eq('id', id);
  if (error) {
    throw error;
  }
}

export async function anonymizeOldTenants(retentionYears = 5) {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - retentionYears);
  const cutoffDate = cutoff.toISOString().split('T')[0];
  const { error } = await supabaseAdmin
    .from('tenant_persons')
    .update({
      full_name: 'Anónimo',
      identification: 'ANONIMIZADO',
      email: null,
      is_anonymized: true
    })
    .eq('status', 'ARCHIVED')
    .lte('archived_at', cutoffDate)
    .eq('is_anonymized', false);
  if (error) {
    throw error;
  }
}
