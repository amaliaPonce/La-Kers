const TENANT_PORTAL_INVITE_STORAGE_KEY = 'la-kers.tenant-portal.invite-token';

function isBrowser() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getTenantPortalInviteToken() {
  if (!isBrowser()) return '';
  return String(window.localStorage.getItem(TENANT_PORTAL_INVITE_STORAGE_KEY) ?? '').trim();
}

export function setTenantPortalInviteToken(token: string) {
  if (!isBrowser()) return;
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) {
    window.localStorage.removeItem(TENANT_PORTAL_INVITE_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(TENANT_PORTAL_INVITE_STORAGE_KEY, normalizedToken);
}

export function clearTenantPortalInviteToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TENANT_PORTAL_INVITE_STORAGE_KEY);
}

export function rememberTenantPortalInviteToken(token?: string | null) {
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) return;
  setTenantPortalInviteToken(normalizedToken);
}
