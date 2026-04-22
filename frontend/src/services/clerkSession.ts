type BrowserClerkSession = {
  getToken: (options?: Record<string, unknown>) => Promise<string | null>;
};

type BrowserClerk = {
  loaded?: boolean;
  session?: BrowserClerkSession | null;
};

declare global {
  interface Window {
    Clerk?: BrowserClerk;
  }
}

const CLERK_WAIT_TIMEOUT_MS = 5000;
const CLERK_WAIT_STEP_MS = 50;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForClerkSession(timeoutMs = CLERK_WAIT_TIMEOUT_MS) {
  if (typeof window === 'undefined') {
    return null;
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const clerk = window.Clerk;
    if (clerk?.loaded) {
      return clerk.session ?? null;
    }
    await sleep(CLERK_WAIT_STEP_MS);
  }

  return window.Clerk?.session ?? null;
}

export async function getClerkSessionToken() {
  const session = await waitForClerkSession();
  if (!session) {
    return null;
  }

  try {
    return await session.getToken();
  } catch {
    return null;
  }
}
