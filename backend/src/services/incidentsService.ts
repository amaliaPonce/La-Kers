import { supabaseAdmin } from '../config/supabaseClient';

type IncidentPayload = {
  unit_id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  cost?: number;
};

export async function listIncidents() {
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .select('*, units(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getIncidentById(id: string) {
  const { data, error } = await supabaseAdmin.from('incidents').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createIncident(payload: IncidentPayload) {
  const { data, error } = await supabaseAdmin.from('incidents').insert(payload).single();
  if (error) throw error;
  return data;
}

export async function updateIncident(id: string, payload: Partial<IncidentPayload>) {
  const { data, error } = await supabaseAdmin.from('incidents').update(payload).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function deleteIncident(id: string) {
  const { error } = await supabaseAdmin.from('incidents').delete().eq('id', id);
  if (error) throw error;
}
