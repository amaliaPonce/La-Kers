import { supabaseAdmin } from '../config/supabaseClient';
import { ensureOwnerOwnsUnit } from './ownersService';

type IncidentPayload = {
  unit_id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  cost?: number;
  tenant_person_id?: string | null;
  reported_by?: 'OWNER' | 'TENANT' | 'SYSTEM';
  updated_at?: string;
  status_updated_at?: string;
  closed_at?: string | null;
};

export async function listIncidents(ownerId: string) {
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .select('*, units(owner_id, name), tenant_persons(id, full_name)')
    .eq('units.owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getIncidentById(id: string, ownerId?: string) {
  let query = supabaseAdmin
    .from('incidents')
    .select('*, units(owner_id, name), tenant_persons(id, full_name)')
    .eq('id', id);
  if (ownerId) {
    query = query.eq('units.owner_id', ownerId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function createIncident(ownerId: string, payload: IncidentPayload) {
  await ensureOwnerOwnsUnit(ownerId, payload.unit_id);
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .insert({
      ...payload,
      reported_by: payload.reported_by ?? 'OWNER',
      updated_at: payload.updated_at ?? now,
      status_updated_at: payload.status_updated_at ?? now,
      closed_at: payload.closed_at ?? (payload.status === 'CLOSED' ? now : null)
    })
    .select('*')
    .single();
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
  const now = new Date().toISOString();
  const nextPayload: Partial<IncidentPayload> = {
    ...payload,
    updated_at: now
  };
  const currentStatus = String(incident.status ?? '').trim().toUpperCase();
  const nextStatus = payload.status ? String(payload.status).trim().toUpperCase() : '';
  if (nextStatus && nextStatus !== currentStatus) {
    nextPayload.status_updated_at = now;
    nextPayload.closed_at = nextStatus === 'CLOSED' ? now : null;
  }
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .update(nextPayload)
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
