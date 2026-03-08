export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export type Incident = {
  id?: string;
  unit_id?: string | null;
  title?: string;
  description?: string;
  status?: IncidentStatus;
  cost?: number | null;
  created_at?: string | null;
};
