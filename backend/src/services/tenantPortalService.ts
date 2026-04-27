import { clerkClient } from '@clerk/express';
import { appConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';
import {
  claimTenantPortalInvite,
  markTenantPortalInviteClaimed,
  releaseTenantPortalInviteClaim
} from './tenantPortalInviteService';
import { recordProductEvent } from './analyticsEventsService';

type TenantPortalAccessRecord = {
  id: string;
  clerk_user_id: string;
  tenant_person_id: string;
  owner_id: string;
  status: 'ACTIVE' | 'REVOKED';
  linked_via: 'manual' | 'email_match' | 'invite_link';
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
};

type TenantPortalTenantRecord = {
  id: string;
  unit_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  identification?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  status?: string | null;
  deposit_amount?: number | string | null;
  deposit_status?: string | null;
  units?: TenantPortalUnitRecord | TenantPortalUnitRecord[] | null;
};

type TenantPortalUnitRecord = {
  id?: string | null;
  owner_id?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  monthly_rent?: number | string | null;
  contract_landlord_name?: string | null;
  contract_landlord_identification?: string | null;
  contract_landlord_address?: string | null;
};

export type TenantPortalProfile = {
  accessId: string;
  ownerId: string;
  tenantPersonId: string;
  clerkUserId: string;
  tenant: {
    id: string;
    fullName: string;
    email: string | null;
    contractStart: string | null;
    contractEnd: string | null;
    status: string | null;
  };
  unit: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
};

export type TenantPortalContext = {
  access: TenantPortalAccessRecord;
  tenantRecord: TenantPortalTenantRecord;
  unitRecord: TenantPortalUnitRecord | null;
  profile: TenantPortalProfile;
};

type ClerkEmailAddress = {
  emailAddress?: string | null;
  id?: string | null;
};

type ClerkUserRecord = {
  primaryEmailAddressId?: string | null;
  emailAddresses?: ClerkEmailAddress[] | null;
};

type CachedClerkUser = {
  expiresAt: number;
  value: ClerkUserRecord;
};

const clerkUserCache = new Map<string, CachedClerkUser>();

function normalizeEmail(value: string | null | undefined) {
  return String(value ?? '').trim().toLowerCase();
}

function assertTenantPortalEnabled() {
  if (appConfig.enableTenantPortal) return;

  const error = new Error('El portal del inquilino está desactivado en este entorno');
  (error as any).status = 404;
  throw error;
}

async function getCachedClerkUser(clerkUserId: string) {
  const now = Date.now();
  const cached = clerkUserCache.get(clerkUserId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const user = (await clerkClient.users.getUser(clerkUserId)) as ClerkUserRecord;
  clerkUserCache.set(clerkUserId, {
    value: user,
    expiresAt: now + appConfig.clerkUserCacheTtlMs
  });
  return user;
}

export async function getTenantPortalAccessByClerkUserId(clerkUserId: string) {
  assertTenantPortalEnabled();
  const { data, error } = await supabaseAdmin
    .from('tenant_portal_access')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .eq('status', 'ACTIVE')
    .maybeSingle();
  if (error) {
    const message = String(error.message ?? '').toLowerCase();
    if (message.includes('tenant_portal_access') || error.code === '42P01') {
      const migrationError = new Error('Falta aplicar sql/20260327_tenant_portal_access.sql');
      (migrationError as any).status = 503;
      throw migrationError;
    }
    throw error;
  }
  return (data as TenantPortalAccessRecord | null) ?? null;
}

async function touchLastLogin(accessId: string) {
  assertTenantPortalEnabled();
  const { error } = await supabaseAdmin
    .from('tenant_portal_access')
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', accessId);
  if (error) throw error;
}

async function getClerkPrimaryEmail(clerkUserId: string) {
  const user = await getCachedClerkUser(clerkUserId);
  const emailAddresses = Array.isArray(user.emailAddresses) ? user.emailAddresses : [];
  const primary = emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ?? emailAddresses[0];
  return normalizeEmail(primary?.emailAddress);
}

export async function hasTenantPortalAccess(clerkUserId: string) {
  assertTenantPortalEnabled();
  const access = await getTenantPortalAccessByClerkUserId(clerkUserId);
  return Boolean(access);
}

async function autoLinkTenantPortalAccess(clerkUserId: string) {
  assertTenantPortalEnabled();
  const primaryEmail = await getClerkPrimaryEmail(clerkUserId);
  if (!primaryEmail) {
    const error = new Error('Tu cuenta no tiene un correo verificable para enlazar el portal de inquilino');
    (error as any).status = 403;
    throw error;
  }

  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('id, email, status, unit_id, units(owner_id)')
    .eq('email', primaryEmail)
    .eq('status', 'ACTIVE');
  if (error) throw error;

  const matches = Array.isArray(data) ? data : [];
  if (matches.length !== 1) {
    const matchError = new Error('No se pudo enlazar el portal del inquilino automáticamente con ese correo');
    (matchError as any).status = 403;
    throw matchError;
  }

  const match = matches[0] as any;
  const ownerId = Array.isArray(match.units) ? String(match.units[0]?.owner_id ?? '') : String(match.units?.owner_id ?? '');
  if (!ownerId) {
    const ownerError = new Error('El contrato del inquilino no está asociado a un propietario válido');
    (ownerError as any).status = 409;
    throw ownerError;
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('tenant_portal_access')
    .upsert(
      {
        clerk_user_id: clerkUserId,
        tenant_person_id: match.id,
        owner_id: ownerId,
        status: 'ACTIVE',
        linked_via: 'email_match',
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      },
      { onConflict: 'clerk_user_id' }
    )
    .select('*')
    .single();
  if (insertError) throw insertError;

  return inserted as TenantPortalAccessRecord;
}

async function createTenantPortalAccessFromInvite(clerkUserId: string, inviteToken: string) {
  const invite = await claimTenantPortalInvite(clerkUserId, inviteToken);
  const now = new Date().toISOString();

  const { data: accessByClerk, error: clerkAccessError } = await supabaseAdmin
    .from('tenant_portal_access')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  if (clerkAccessError) throw clerkAccessError;

  if (accessByClerk && String((accessByClerk as TenantPortalAccessRecord).tenant_person_id ?? '') !== invite.tenant_person_id) {
    const error = new Error('Esta cuenta ya está vinculada a otro portal de inquilino');
    (error as { status?: number }).status = 409;
    throw error;
  }

  const { data: accessByTenant, error: tenantAccessError } = await supabaseAdmin
    .from('tenant_portal_access')
    .select('*')
    .eq('tenant_person_id', invite.tenant_person_id)
    .maybeSingle();
  if (tenantAccessError) throw tenantAccessError;

  if (
    accessByTenant &&
    String((accessByTenant as TenantPortalAccessRecord).status ?? '').toUpperCase() === 'ACTIVE' &&
    String((accessByTenant as TenantPortalAccessRecord).clerk_user_id ?? '') !== clerkUserId
  ) {
    const error = new Error('Este contrato ya está vinculado a otra cuenta de acceso');
    (error as { status?: number }).status = 409;
    throw error;
  }

  await markTenantPortalInviteClaimed(invite.id, clerkUserId);

  try {
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('tenant_portal_access')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          tenant_person_id: invite.tenant_person_id,
          owner_id: invite.owner_id,
          status: 'ACTIVE',
          linked_via: 'invite_link',
          updated_at: now,
          last_login_at: now
        },
        { onConflict: 'tenant_person_id' }
      )
      .select('*')
      .single();
    if (upsertError) throw upsertError;

    await recordProductEvent({
      ownerId: invite.owner_id,
      actorId: invite.tenant_person_id,
      actorType: 'TENANT',
      eventName: 'tenant_invite_accepted',
      metadata: {
        tenantPersonId: invite.tenant_person_id,
        inviteId: invite.id
      }
    }).catch(() => undefined);

    return upserted as TenantPortalAccessRecord;
  } catch (error) {
    await releaseTenantPortalInviteClaim(invite.id, clerkUserId).catch(() => undefined);
    throw error;
  }
}

export async function ensureTenantPortalAccess(clerkUserId: string, options: { inviteToken?: string } = {}) {
  assertTenantPortalEnabled();
  let access = await getTenantPortalAccessByClerkUserId(clerkUserId);
  if (!access) {
    const inviteToken = String(options.inviteToken ?? '').trim();
    if (inviteToken) {
      access = await createTenantPortalAccessFromInvite(clerkUserId, inviteToken);
    } else if (appConfig.enableTenantEmailMatch) {
      access = await autoLinkTenantPortalAccess(clerkUserId);
    } else {
      const error = new Error('Necesitas una invitación válida del propietario para acceder al portal del inquilino');
      (error as any).status = 403;
      throw error;
    }
  } else {
    await touchLastLogin(access.id);
  }
  return access;
}

function buildTenantPortalProfile(access: TenantPortalAccessRecord, data: TenantPortalTenantRecord): TenantPortalProfile {
  const unit = Array.isArray(data.units) ? data.units[0] : data.units;

  return {
    accessId: access.id,
    ownerId: access.owner_id,
    tenantPersonId: access.tenant_person_id,
    clerkUserId: access.clerk_user_id,
    tenant: {
      id: String(data.id),
      fullName: String(data.full_name ?? 'Inquilino'),
      email: data.email ? String(data.email) : null,
      contractStart: data.contract_start ? String(data.contract_start) : null,
      contractEnd: data.contract_end ? String(data.contract_end) : null,
      status: data.status ? String(data.status) : null
    },
    unit: unit
      ? {
          id: String(unit.id ?? ''),
          name: String(unit.name ?? 'Unidad'),
          address: unit.address ? String(unit.address) : null,
          city: unit.city ? String(unit.city) : null,
          postalCode: unit.postal_code ? String(unit.postal_code) : null
        }
      : null
  };
}

export async function getTenantPortalContext(clerkUserId: string): Promise<TenantPortalContext> {
  assertTenantPortalEnabled();
  const access = await ensureTenantPortalAccess(clerkUserId);
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('id, unit_id, full_name, email, identification, contract_start, contract_end, deposit_amount, deposit_status, status, units(id, owner_id, name, address, city, postal_code, monthly_rent, contract_landlord_name, contract_landlord_identification, contract_landlord_address)')
    .eq('id', access.tenant_person_id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const notFound = new Error('No se encontró el contrato del inquilino');
    (notFound as any).status = 404;
    throw notFound;
  }

  const tenantRecord = data as TenantPortalTenantRecord;
  const unitRelation = tenantRecord.units;
  const unitRecord = Array.isArray(unitRelation) ? unitRelation[0] ?? null : unitRelation ?? null;

  return {
    access,
    tenantRecord,
    unitRecord,
    profile: buildTenantPortalProfile(access, tenantRecord)
  };
}

export async function getTenantPortalProfile(clerkUserId: string): Promise<TenantPortalProfile> {
  const context = await getTenantPortalContext(clerkUserId);
  return context.profile;
}
