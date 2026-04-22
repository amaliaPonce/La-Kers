import * as Sentry from '@sentry/node';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { appConfig } from '../config/appConfig';
import { logError, redactValue } from '../utils/errorLogger';

const sentryDsn = process.env.SENTRY_DSN?.trim();
const isSentryEnabled = Boolean(sentryDsn);

const parseSampleRate = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 0), 1);
};

Sentry.init({
  dsn: sentryDsn,
  enabled: isSentryEnabled,
  environment: process.env.SENTRY_ENVIRONMENT?.trim() || appConfig.nodeEnv,
  tracesSampleRate: parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1),
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
      delete event.user.username;
      delete event.user.name;
    }

    if (event.request) {
      delete event.request.cookies;
      delete event.request.data;

      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-clerk-auth-token'];
      }
    }

    return event;
  }
});

type ServerCaptureContext = {
  tag: string;
  userId?: string;
  route?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export const applySentryRequestContext = (req: AuthenticatedRequest) => {
  if (!isSentryEnabled) return;

  const actor = req.authActor;
  const userId = actor?.actorRef ?? req.authUser?.id;

  Sentry.setUser(userId ? { id: userId } : null);
  Sentry.setTags({
    portal: actor?.portal ?? 'owner',
    actor_type: actor?.actorType ?? 'OWNER'
  });
};

export const captureServerException = (
  error: unknown,
  {
    tag,
    userId,
    route,
    tags = {},
    extra = {}
  }: ServerCaptureContext
) => {
  logError(error, {
    tag,
    route,
    userId,
    payload: extra
  });

  if (!isSentryEnabled) return;

  Sentry.withScope((scope) => {
    scope.setTag('error_tag', tag);
    if (route) {
      scope.setTag('route', route);
    }

    Object.entries(tags).forEach(([key, value]) => scope.setTag(key, value));
    scope.setContext('la_kers', redactValue(extra) as Record<string, unknown>);
    Sentry.captureException(error);
  });
};
