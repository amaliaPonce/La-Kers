type ErrorContext = {
  tag?: string;
  route?: string;
  payload?: unknown;
  userId?: string;
};

const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_KEY_PATTERN = /pass(word)?|token|authorization|secret|key|dni|nie|cif|identification|email/i;

export function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, entry]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      acc[key] = REDACTED_VALUE;
      return acc;
    }
    acc[key] = redactValue(entry);
    return acc;
  }, {});
}

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  if (error && typeof error === 'object') {
    return redactValue(error);
  }

  return String(error);
}

export function logError(error: unknown, context: ErrorContext = {}) {
  const timestamp = new Date().toISOString();
  console.error('[la-kers:error]', {
    at: timestamp,
    tag: context.tag ?? 'ERROR',
    route: context.route ?? null,
    userId: context.userId ?? null,
    payload: context.payload ? redactValue(context.payload) : null,
    error: serializeError(error)
  });
}
