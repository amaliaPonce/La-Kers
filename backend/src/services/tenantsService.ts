import { supabaseAdmin } from '../config/supabaseClient';
import { updateApartment } from './apartmentsService';
import { ensurePendingPaymentsForTenant, reconcileUnpaidPaymentsForTenant } from './paymentsService';
import { ensureOwnerOwnsUnit } from './ownersService';
import {
  normalizeDateKey,
  tenantContractBlocksRange,
  tenantOccupiesDate,
  type TenantLifecycleStatus
} from '../utils/tenantContracts';

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
type UnitStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type TenantListMode = 'active' | 'archived' | 'all';

async function assertNoOverlappingTenantContract(
  unitId: string,
  contractStart: string,
  contractEnd: string,
  excludeTenantId?: string
) {
  let query = supabaseAdmin
    .from('tenant_persons')
    .select('id, full_name, contract_start, contract_end, status')
    .eq('unit_id', unitId)
    .eq('status', 'ACTIVE');

  if (excludeTenantId) {
    query = query.neq('id', excludeTenantId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const overlap = (data ?? []).find((tenant) =>
    tenantContractBlocksRange(tenant.status, tenant.contract_start, tenant.contract_end, contractStart, contractEnd)
  );

  if (!overlap) return;

  const conflict = new Error(
    `La unidad ya tiene un contrato que se solapa en esas fechas${overlap.full_name ? ` con ${overlap.full_name}` : ''}.`
  );
  (conflict as any).status = 409;
  throw conflict;
}

export async function listTenants(ownerId: string, options: { mode?: TenantListMode } = { mode: 'active' }) {
  const mode = options.mode ?? 'active';
  let query = supabaseAdmin
    .from('tenant_persons')
    .select('*, units(owner_id, name, status, monthly_rent)')
    .eq('units.owner_id', ownerId)
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

export async function createTenant(ownerId: string, payload: TenantPayload) {
  await ensureOwnerOwnsUnit(ownerId, payload.unit_id);
  await assertNoOverlappingTenantContract(payload.unit_id, payload.contract_start, payload.contract_end);
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .insert({ ...payload, status: 'ACTIVE' })
    .select('*')
    .single();
  if (error) throw error;
  if (!data) {
    throw new Error('Tenant no insertado');
  }
  const tenantRecord = data as TenantRecord;
  await ensurePendingPaymentsForTenant(ownerId, tenantRecord).catch((err) => console.error('[TenantPayment]', err));
  await synchronizeApartmentStatus(ownerId, String(tenantRecord.unit_id ?? ''));
  return data;
}

export async function updateTenant(ownerId: string, id: string, payload: Partial<TenantPayload>) {
  const existingTenant = (await getTenantById(ownerId, id)) as TenantRecord | null;
  if (!existingTenant) {
    throw new Error('Tenant no encontrado');
  }

  if (payload.unit_id) {
    await ensureOwnerOwnsUnit(ownerId, payload.unit_id);
  }

  const nextTenantState = {
    unit_id: payload.unit_id ?? existingTenant.unit_id,
    contract_start: payload.contract_start ?? existingTenant.contract_start,
    contract_end: payload.contract_end ?? existingTenant.contract_end
  };
  await assertNoOverlappingTenantContract(
    nextTenantState.unit_id,
    nextTenantState.contract_start,
    nextTenantState.contract_end,
    id
  );

  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;

  const updatedTenant = data as TenantRecord;
  const unitsToSync = new Set<string>();
  if (existingTenant.unit_id) {
    unitsToSync.add(existingTenant.unit_id);
  }
  if (updatedTenant.unit_id) {
    unitsToSync.add(updatedTenant.unit_id);
  }
  await reconcileUnpaidPaymentsForTenant(ownerId, updatedTenant).catch((err) => console.error('[TenantPaymentSync]', err));
  await Promise.all([...unitsToSync].map((unitId) => synchronizeApartmentStatus(ownerId, unitId)));

  return data;
}

export async function getTenantById(ownerId: string, id: string) {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('*, units(owner_id)')
    .eq('id', id)
    .eq('units.owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function finalizeTenantContract(ownerId: string, id: string, finalDate: string) {
  const tenant = (await getTenantById(ownerId, id)) as TenantRecord | null;
  if (!tenant) {
    throw new Error('Tenant no encontrado');
  }
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .update({ contract_end: finalDate })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  await reconcileUnpaidPaymentsForTenant(ownerId, data as TenantRecord).catch((err) => console.error('[TenantPaymentSync]', err));
  await archiveTenantRecord(id, finalDate);
  await synchronizeApartmentStatus(ownerId, String(tenant.unit_id ?? ''));
  return data;
}

async function determineApartmentStatus(unitId: string): Promise<UnitStatus> {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('contract_start, contract_end, status')
    .eq('unit_id', unitId)
    .eq('status', 'ACTIVE');
  if (error) throw error;

  const tenants = data ?? [];
  const today = normalizeDateKey(new Date());
  let hasFutureContract = false;

  for (const tenant of tenants) {
    const contractStart = normalizeDateKey(tenant.contract_start);
    if (!contractStart || !today) {
      continue;
    }
    if (tenantOccupiesDate(tenant.status, tenant.contract_start, tenant.contract_end, today)) {
      return 'OCCUPIED';
    }
    if (contractStart > today) {
      hasFutureContract = true;
    }
  }

  if (hasFutureContract) {
    return 'RESERVED';
  }

  return 'AVAILABLE';
}

export async function synchronizeApartmentStatus(ownerId: string, unitId: string) {
  if (!unitId) return;
  try {
    const status = await determineApartmentStatus(unitId);
    await updateApartment(ownerId, unitId, { status });
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
