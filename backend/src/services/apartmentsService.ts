import { supabaseAdmin } from '../config/supabaseClient';
import { PlanDefinition } from '../config/plans';
import { countOwnerUnits, ensureOwnerOwnsUnit } from './ownersService';

type ApartmentPayload = {
  name: string;
  monthly_rent: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
};

export type ApartmentStatusCount = {
  total: number;
  OCCUPIED: number;
  AVAILABLE: number;
  RESERVED: number;
};

export async function listApartments(ownerId: string) {
  const { data, error } = await supabaseAdmin
    .from('units')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createApartment(ownerId: string, payload: ApartmentPayload, plan: PlanDefinition) {
  const ownedUnits = await countOwnerUnits(ownerId);
  if (ownedUnits >= plan.unitLimit) {
    const error = new Error(`El plan ${plan.name} permite hasta ${plan.unitLimit} viviendas`);
    (error as any).status = 403;
    throw error;
  }
  const { data, error } = await supabaseAdmin
    .from('units')
    .insert({ ...payload, owner_id: ownerId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateApartment(ownerId: string, id: string, payload: Partial<ApartmentPayload>) {
  await ensureOwnerOwnsUnit(ownerId, id);
  const { data, error } = await supabaseAdmin
    .from('units')
    .update(payload)
    .eq('id', id)
    .eq('owner_id', ownerId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getApartmentById(ownerId: string, id: string) {
  const { data, error } = await supabaseAdmin
    .from('units')
    .select('*')
    .eq('id', id)
    .eq('owner_id', ownerId)
    .single();
  if (error) throw error;
  return data;
}

export async function countApartmentsByStatus(ownerId: string): Promise<ApartmentStatusCount> {
  const { data: unitsData, error: unitsError } = await supabaseAdmin
    .from('units')
    .select('id, status')
    .eq('owner_id', ownerId);
  if (unitsError) {
    throw unitsError;
  }

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const unitIds = (unitsData ?? []).map((unit) => String(unit.id ?? '')).filter(Boolean);
  let activeTenants: { unit_id: string }[] = [];

  if (unitIds.length) {
    const result = await supabaseAdmin
      .from('tenant_persons')
      .select('unit_id')
      .lte('contract_start', todayKey)
      .gte('contract_end', todayKey)
      .in('unit_id', unitIds);
    if (result.error) {
      throw result.error;
    }
    activeTenants = result.data ?? [];
  }

  const occupiedUnitIds = new Set(activeTenants.map((tenant) => String(tenant.unit_id ?? '')).filter(Boolean));

  let occupiedCount = 0;
  let availableCount = 0;
  let reservedCount = 0;

  for (const unit of unitsData ?? []) {
    const id = String(unit.id ?? '');
    if (occupiedUnitIds.has(id)) {
      occupiedCount += 1;
      continue;
    }
    if (unit.status === 'RESERVED') {
      reservedCount += 1;
      continue;
    }
    availableCount += 1;
  }

  return {
    total: (unitsData ?? []).length,
    OCCUPIED: occupiedCount,
    AVAILABLE: availableCount,
    RESERVED: reservedCount
  };
}

export async function deleteApartment(ownerId: string, id: string) {
  await ensureOwnerOwnsUnit(ownerId, id);
  const { error } = await supabaseAdmin
    .from('units')
    .delete()
    .eq('id', id)
    .eq('owner_id', ownerId);
  if (error) throw error;
  return true;
}
