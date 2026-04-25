import { appConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';
import { getTenantById } from './tenantsService';
import {
  buildTenantPortalInviteUrl,
  generateTenantPortalInviteToken,
  hashTenantPortalInviteToken,
  isTenantPortalInviteExpired
} from './tenantPortalInviteUtils';

type TenantPortalInviteRecord = {
  id: string;
  owner_id: string;
  tenant_person_id: string;
  token_hash: string;
  status: 'PENDING' | 'CLAIMED' | 'REVOKED' | 'EXPIRED';
  expires_at: string;
  claimed_at?: string | null;
  claimed_by_clerk_user_id?: string | null;
  created_at: string;
  updated_at: string;
};

function buildMissingInviteTableError() {
  const error = new Error('Falta aplicar sql/20260423_tenant_portal_invites.sql');
  (error as { status?: number }).status = 503;
  return error;
}

function isMissingInviteTable(error: { code?: string | null; message?: string | null } | null | undefined) {
  const code = String(error?.code ?? '').trim();
  const message = String(error?.message ?? '').toLowerCase();
  return code === '42P01' || message.includes('tenant_portal_invites');
}

function buildInviteExpiry(days: number) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Math.max(days, 1));
  return expiresAt.toISOString();
}

export async function createTenantPortalInvite(ownerId: string, tenantId: string) {
  const tenant = await getTenantById(ownerId, tenantId);
  if (!tenant) {
    const error = new Error('Inquilino no encontrado');
    (error as { status?: number }).status = 404;
    throw error;
  }

  if (String((tenant as any).status ?? '').trim().toUpperCase() !== 'ACTIVE') {
    const error = new Error('Solo puedes invitar inquilinos con contrato activo');
    (error as { status?: number }).status = 409;
    throw error;
  }

  const token = generateTenantPortalInviteToken();
  const tokenHash = hashTenantPortalInviteToken(token);
  const now = new Date().toISOString();
  const expiresAt = buildInviteExpiry(appConfig.tenantPortalInviteTtlDays);

  const revokeResponse = await supabaseAdmin
    .from('tenant_portal_invites')
    .update({
      status: 'REVOKED',
      updated_at: now
    })
    .eq('tenant_person_id', tenantId)
    .eq('status', 'PENDING');

  if (revokeResponse.error) {
    if (isMissingInviteTable(revokeResponse.error)) {
      throw buildMissingInviteTableError();
    }
    throw revokeResponse.error;
  }

  const { data, error } = await supabaseAdmin
    .from('tenant_portal_invites')
    .insert({
      owner_id: ownerId,
      tenant_person_id: tenantId,
      token_hash: tokenHash,
      status: 'PENDING',
      expires_at: expiresAt,
      updated_at: now
    })
    .select('*')
    .single();

  if (error) {
    if (isMissingInviteTable(error)) {
      throw buildMissingInviteTableError();
    }
    throw error;
  }

  return {
    inviteId: String((data as TenantPortalInviteRecord).id),
    tenantPersonId: tenantId,
    tenantName: String((tenant as any).full_name ?? 'Inquilino'),
    tenantEmail: (tenant as any).email ? String((tenant as any).email) : null,
    expiresAt,
    inviteUrl: buildTenantPortalInviteUrl(appConfig.appBaseUrl, token)
  };
}

async function getTenantPortalInviteByToken(token: string) {
  const tokenHash = hashTenantPortalInviteToken(token);
  const { data, error } = await supabaseAdmin
    .from('tenant_portal_invites')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    if (isMissingInviteTable(error)) {
      throw buildMissingInviteTableError();
    }
    throw error;
  }

  return (data as TenantPortalInviteRecord | null) ?? null;
}

export async function claimTenantPortalInvite(clerkUserId: string, token: string) {
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) {
    const error = new Error('Falta el token de invitación del portal');
    (error as { status?: number }).status = 400;
    throw error;
  }

  const invite = await getTenantPortalInviteByToken(normalizedToken);
  if (!invite) {
    const error = new Error('La invitación del portal no es válida');
    (error as { status?: number }).status = 403;
    throw error;
  }

  if (invite.status === 'CLAIMED') {
    if (invite.claimed_by_clerk_user_id === clerkUserId) {
      return invite;
    }
    const error = new Error('Esta invitación ya fue utilizada');
    (error as { status?: number }).status = 409;
    throw error;
  }

  if (invite.status === 'REVOKED') {
    const error = new Error('Esta invitación fue revocada');
    (error as { status?: number }).status = 410;
    throw error;
  }

  if (isTenantPortalInviteExpired(invite.expires_at)) {
    await supabaseAdmin
      .from('tenant_portal_invites')
      .update({
        status: 'EXPIRED',
        updated_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    const error = new Error('La invitación ha caducado');
    (error as { status?: number }).status = 410;
    throw error;
  }

  return invite;
}
