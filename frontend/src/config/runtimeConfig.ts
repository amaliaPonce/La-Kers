const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const minimalMode = parseBoolean(import.meta.env.VITE_MINIMAL_MODE, true);

export const runtimeConfig = {
  minimalMode,
  hasClerkConfig: Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
  enableTenantPortal: parseBoolean(import.meta.env.VITE_ENABLE_TENANT_PORTAL, !minimalMode),
  enableDashboardRealtime: parseBoolean(
    import.meta.env.VITE_ENABLE_DASHBOARD_REALTIME,
    !minimalMode
  )
};
