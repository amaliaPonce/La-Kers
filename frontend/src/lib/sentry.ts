import type { App } from 'vue';
import type { Router } from 'vue-router';
import * as Sentry from '@sentry/vue';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();
const sentryEnvironment = import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() || import.meta.env.MODE;

const parseSampleRate = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 0), 1);
};

const replaySessionSampleRate = parseSampleRate(
  import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE,
  0
);
const replayOnErrorSampleRate = parseSampleRate(
  import.meta.env.VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE,
  1
);

export const isSentryEnabled = Boolean(sentryDsn);

type CaptureOptions = {
  tags?: Record<string, string>;
  context?: Record<string, unknown>;
  fingerprint?: string[];
};

type UserMonitoringContext = {
  id: string;
  emailHash?: string | null;
  plan: string;
  portal: 'owner' | 'tenant';
};

export const initSentry = (app: App, router: Router) => {
  if (!isSentryEnabled) return;

  const integrations = [
    Sentry.browserTracingIntegration({
      router,
      routeLabel: 'path'
    })
  ];

  if (replaySessionSampleRate > 0 || replayOnErrorSampleRate > 0) {
    integrations.push(Sentry.replayIntegration());
  }

  Sentry.init({
    app,
    dsn: sentryDsn,
    environment: sentryEnvironment,
    integrations,
    tracesSampleRate: parseSampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0.1),
    replaysSessionSampleRate: replaySessionSampleRate,
    replaysOnErrorSampleRate: replayOnErrorSampleRate,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.user) {
        delete event.user.ip_address;
      }
      return event;
    }
  });
};

export const captureAppException = (error: unknown, options: CaptureOptions = {}) => {
  if (!isSentryEnabled) return;

  Sentry.withScope((scope) => {
    Object.entries(options.tags ?? {}).forEach(([key, value]) => scope.setTag(key, value));
    if (options.context) {
      scope.setContext('la_kers', options.context);
    }
    if (options.fingerprint?.length) {
      scope.setFingerprint(options.fingerprint);
    }
    Sentry.captureException(error);
  });
};

export const hashValue = async (value?: string | null) => {
  if (!value || typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }

  const encoded = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  const digestArray = Array.from(new Uint8Array(digest));
  return digestArray.map((chunk) => chunk.toString(16).padStart(2, '0')).join('');
};

export const updateSentryUserContext = ({
  id,
  emailHash,
  plan,
  portal
}: UserMonitoringContext) => {
  if (!isSentryEnabled) return;

  Sentry.setUser({ id });
  Sentry.setTags({ plan, portal });
  Sentry.setContext('account', {
    emailHash: emailHash ?? undefined,
    plan,
    portal,
    environment: sentryEnvironment
  });
};

export const clearSentryUserContext = () => {
  if (!isSentryEnabled) return;

  Sentry.setUser(null);
  Sentry.setContext('account', null);
};
