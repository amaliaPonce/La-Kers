import { clerkClient } from '@clerk/express';
import { appConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';

type TenantPortalAccessRecord = {
  id: string;
  clerk_user_id: string;
  tenant_person_id: string;
  owner_id: string;
  status: 'ACTIVE' | 'REVOKED';
  linked_via: 'manual' | 'email_match';
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
};

type TenantPortalProfile = {
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

type ClerkEmailAddress = {
  emailAddress?: string | null;
  id?: string | null;
};

type ClerkUserRecord = {
  primaryEmailAddressId?: string | null;
  emailAddresses?: ClerkEmailAddress[] | null;
  unsafeMetadata?: Record<string, unknown> | null;
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

async function getTenantPortalAccessByClerkUserId(clerkUserId: string) {
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

export async function getClerkPortalRole(clerkUserId: string) {
  assertTenantPortalEnabled();
  const user = await getCachedClerkUser(clerkUserId);
  return String(user.unsafeMetadata?.portalRole ?? '').trim().toLowerCase();
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

export async function ensureTenantPortalAccess(clerkUserId: string) {
  assertTenantPortalEnabled();
  let access = await getTenantPortalAccessByClerkUserId(clerkUserId);
  if (!access) {
    access = await autoLinkTenantPortalAccess(clerkUserId);
  } else {
    await touchLastLogin(access.id);
  }
  return access;
}

export async function getTenantPortalProfile(clerkUserId: string): Promise<TenantPortalProfile> {
  assertTenantPortalEnabled();
  const access = await ensureTenantPortalAccess(clerkUserId);
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('id, full_name, email, contract_start, contract_end, status, units(id, name, address, city, postal_code)')
    .eq('id', access.tenant_person_id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const notFound = new Error('No se encontró el contrato del inquilino');
    (notFound as any).status = 404;
    throw notFound;
  }

  const unit = Array.isArray((data as any).units) ? (data as any).units[0] : (data as any).units;

  return {
    accessId: access.id,
    ownerId: access.owner_id,
    tenantPersonId: access.tenant_person_id,
    clerkUserId: access.clerk_user_id,
    tenant: {
      id: String((data as any).id),
      fullName: String((data as any).full_name ?? 'Inquilino'),
      email: (data as any).email ? String((data as any).email) : null,
      contractStart: (data as any).contract_start ? String((data as any).contract_start) : null,
      contractEnd: (data as any).contract_end ? String((data as any).contract_end) : null,
      status: (data as any).status ? String((data as any).status) : null
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
