import crypto from 'node:crypto';

export function hashTenantPortalInviteToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateTenantPortalInviteToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function buildTenantPortalInviteUrl(baseUrl: string, token: string) {
  const normalizedBaseUrl = String(baseUrl ?? '').trim().replace(/\/+$/, '');
  const route = `/tenant/sign-up?invite=${encodeURIComponent(token)}`;
  return normalizedBaseUrl ? `${normalizedBaseUrl}${route}` : route;
}

export function isTenantPortalInviteExpired(expiresAt?: string | null, now: Date = new Date()) {
  if (!expiresAt) return true;
  const parsed = new Date(expiresAt);
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed.getTime() <= now.getTime();
}
