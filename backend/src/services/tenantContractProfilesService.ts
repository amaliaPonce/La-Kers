import { supabaseAdmin } from '../config/supabaseClient';
import { getTenantById } from './tenantsService';
import {
  toTenantContractProfilePdfFields,
  type TenantContractProfilePayload,
  type TenantContractProfileRecord
} from '../utils/tenantContractProfile';

const TENANT_CONTRACT_PROFILE_SELECT = [
  'tenant_person_id',
  'company_name',
  'trade_name',
  'tax_id',
  'company_email',
  'company_phone',
  'fiscal_address_line_1',
  'fiscal_address_line_2',
  'fiscal_postal_code',
  'fiscal_city',
  'fiscal_province',
  'fiscal_country',
  'legal_representative_name',
  'legal_representative_id',
  'legal_representative_role',
  'iban',
  'contract_notes',
  'created_at',
  'updated_at'
].join(', ');

async function assertOwnerOwnsTenant(ownerId: string, tenantId: string) {
  const tenant = await getTenantById(ownerId, tenantId);
  if (!tenant) {
    const notFound = new Error('Tenant no encontrado');
    (notFound as { status?: number }).status = 404;
    throw notFound;
  }
}

export async function getTenantContractProfile(ownerId: string, tenantId: string) {
  await assertOwnerOwnsTenant(ownerId, tenantId);

  const { data, error } = await supabaseAdmin
    .from('tenant_contract_profiles')
    .select(TENANT_CONTRACT_PROFILE_SELECT)
    .eq('tenant_person_id', tenantId)
    .maybeSingle();

  if (error) throw error;
  return (data as TenantContractProfileRecord | null) ?? null;
}

export async function upsertTenantContractProfile(ownerId: string, tenantId: string, payload: TenantContractProfilePayload) {
  await assertOwnerOwnsTenant(ownerId, tenantId);

  const { data, error } = await supabaseAdmin
    .from('tenant_contract_profiles')
    .upsert(
      {
        tenant_person_id: tenantId,
        ...payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'tenant_person_id' }
    )
    .select(TENANT_CONTRACT_PROFILE_SELECT)
    .single();

  if (error) throw error;
  return data as unknown as TenantContractProfileRecord;
}

export async function getTenantContractProfilePdfFields(ownerId: string, tenantId: string) {
  const profile = await getTenantContractProfile(ownerId, tenantId);
  return toTenantContractProfilePdfFields(profile);
}
