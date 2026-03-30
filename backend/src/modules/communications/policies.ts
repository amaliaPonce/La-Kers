import { PRO_PLAN_ID } from '../../config/plans';
import { getOwnerBillingSummary } from '../../services/billingService';
import { ensureOwnerOwnsUnit } from '../../services/ownersService';
import { supabaseAdmin } from '../../config/supabaseClient';

type TenantOwnershipRecord = {
  id: string;
  unit_id: string;
  full_name: string;
  email?: string | null;
  status?: string | null;
  units?: Array<{
    owner_id: string;
  }> | null;
};

export async function ensureOwnerHasCommunicationsPro(ownerId: string) {
  const summary = await getOwnerBillingSummary(ownerId);
  if (summary.plan.id === PRO_PLAN_ID) {
    return summary;
  }

  const error = new Error('La mensajería profesional está disponible en el plan PRO');
  (error as any).status = 402;
  throw error;
}

export async function ensureTenantBelongsToOwner(ownerId: string, tenantPersonId: string) {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('id, unit_id, full_name, email, status, units(owner_id)')
    .eq('id', tenantPersonId)
    .eq('units.owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const ownershipError = new Error('El inquilino no pertenece al propietario autenticado');
    (ownershipError as any).status = 403;
    throw ownershipError;
  }
  return data as unknown as TenantOwnershipRecord;
}

export async function ensureLeaseMatchesTenantAndUnit(
  ownerId: string,
  tenantPersonId: string,
  unitId: string | null | undefined,
  leaseId: string | null | undefined
) {
  const tenant = await ensureTenantBelongsToOwner(ownerId, tenantPersonId);

  if (unitId) {
    await ensureOwnerOwnsUnit(ownerId, unitId);
    if (tenant.unit_id !== unitId) {
      const error = new Error('El inquilino no está vinculado a la unidad indicada');
      (error as any).status = 409;
      throw error;
    }
  }

  if (leaseId && leaseId !== tenant.id) {
    const error = new Error('El leaseId no coincide con el inquilino indicado');
    (error as any).status = 409;
    throw error;
  }

  return tenant;
}
