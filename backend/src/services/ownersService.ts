import { supabaseAdmin } from '../config/supabaseClient';
import { PlanDefinition } from '../config/plans';

export async function getOwnerUnits(ownerId: string) {
  if (!ownerId) return [];
  const { data, error } = await supabaseAdmin
    .from('units')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function countOwnerUnits(ownerId: string) {
  if (!ownerId) return 0;
  const { count, error } = await supabaseAdmin
    .from('units')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', ownerId);
  if (error) throw error;
  return count ?? 0;
}

export async function ensureOwnerOwnsUnit(ownerId: string, unitId: string) {
  if (!ownerId) {
    const err = new Error('Propietario no autenticado');
    (err as any).status = 401;
    throw err;
  }
  if (!unitId) {
    throw new Error('Unidad inválida');
  }
  const { data, error } = await supabaseAdmin
    .from('units')
    .select('id, owner_id')
    .eq('id', unitId)
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const err = new Error('La unidad no pertenece al propietario');
    (err as any).status = 403;
    throw err;
  }
  return data;
}

export function buildPlanPayload(plan: PlanDefinition) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    unitLimit: plan.unitLimit
  };
}
