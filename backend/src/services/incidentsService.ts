import { supabaseAdmin } from '../config/supabaseClient';
import { ensureOwnerOwnsUnit } from './ownersService';

type IncidentPayload = {
  unit_id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  cost?: number;
};

export async function listIncidents(ownerId: string) {
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .select('*, units(owner_id, name)')
    .eq('units.owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getIncidentById(id: string, ownerId?: string) {
  let query = supabaseAdmin.from('incidents').select('*, units(owner_id)').eq('id', id);
  if (ownerId) {
    query = query.eq('units.owner_id', ownerId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function createIncident(ownerId: string, payload: IncidentPayload) {
  await ensureOwnerOwnsUnit(ownerId, payload.unit_id);
  const { data, error } = await supabaseAdmin.from('incidents').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateIncident(ownerId: string, id: string, payload: Partial<IncidentPayload>) {
  const incident = await getIncidentById(id, ownerId);
  if (!incident) {
    throw new Error('Incidente no encontrado');
  }
  if (payload.unit_id) {
    await ensureOwnerOwnsUnit(ownerId, payload.unit_id);
  }
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIncident(ownerId: string, id: string) {
  const incident = await getIncidentById(id, ownerId);
  if (!incident) {
    throw new Error('Incidente no encontrado');
  }
  const { error } = await supabaseAdmin.from('incidents').delete().eq('id', id);
  if (error) throw error;
  return true;
}
