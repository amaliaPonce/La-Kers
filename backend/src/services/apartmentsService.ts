import { supabaseAdmin } from '../config/supabaseClient';

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

export async function listApartments() {
  const { data, error } = await supabaseAdmin.from('units').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createApartment(payload: ApartmentPayload) {
  const { data, error } = await supabaseAdmin.from('units').insert(payload).single();
  if (error) throw error;
  return data;
}

export async function updateApartment(id: string, payload: Partial<ApartmentPayload>) {
  const { data, error } = await supabaseAdmin.from('units').update(payload).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getApartmentById(id: string) {
  const { data, error } = await supabaseAdmin.from('units').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function countApartmentsByStatus(): Promise<ApartmentStatusCount> {
  const { data: unitsData, error: unitsError } = await supabaseAdmin
    .from('units')
    .select('id, status');
  if (unitsError) {
    throw unitsError;
  }

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const { data: activeTenants, error: tenantError } = await supabaseAdmin
    .from('tenant_persons')
    .select('unit_id')
    .lte('contract_start', todayKey)
    .gte('contract_end', todayKey);
  if (tenantError) {
    throw tenantError;
  }

  const occupiedUnitIds = new Set(
    (activeTenants ?? [])
      .map((tenant) => String(tenant.unit_id ?? ''))
      .filter(Boolean)
  );

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

export async function deleteApartment(id: string) {
  const { error } = await supabaseAdmin.from('units').delete().eq('id', id);
  if (error) throw error;
  return true;
}
