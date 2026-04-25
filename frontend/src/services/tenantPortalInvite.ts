const TENANT_PORTAL_INVITE_STORAGE_KEY = 'la-kers.tenant-portal.invite-token';

function isBrowser() {
  return typeof window !== 'undefined' && Boolean(window.sessionStorage);
}

function getInviteStorage() {
  if (!isBrowser()) return null;
  return window.sessionStorage;
}

export function getTenantPortalInviteToken() {
  const storage = getInviteStorage();
  if (!storage) return '';
  return String(storage.getItem(TENANT_PORTAL_INVITE_STORAGE_KEY) ?? '').trim();
}

export function setTenantPortalInviteToken(token: string) {
  const storage = getInviteStorage();
  if (!storage) return;
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) {
    storage.removeItem(TENANT_PORTAL_INVITE_STORAGE_KEY);
    return;
  }
  storage.setItem(TENANT_PORTAL_INVITE_STORAGE_KEY, normalizedToken);
}

export function clearTenantPortalInviteToken() {
  const storage = getInviteStorage();
  if (!storage) return;
  storage.removeItem(TENANT_PORTAL_INVITE_STORAGE_KEY);
}

export function rememberTenantPortalInviteToken(token?: string | null) {
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) return;
  setTenantPortalInviteToken(normalizedToken);
}
