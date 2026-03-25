import fs from 'fs';
import path from 'path';

type ErrorContext = {
  tag?: string;
  route?: string;
  payload?: unknown;
  userId?: string;
};

const LOG_FILE = path.resolve(process.cwd(), 'logs/error.log');
const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_KEY_PATTERN = /pass(word)?|token|authorization|secret|key|dni|nie|cif|identification|email/i;

function ensureLogDirectory() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

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
  ensureLogDirectory();
  const timestamp = new Date().toISOString();
  const payload = context.payload ? JSON.stringify(redactValue(context.payload), null, 2) : undefined;
  const lines = [
    `---
[${timestamp}] ${context.tag ?? 'ERROR'} ${context.route ? `@ ${context.route}` : ''}`.trim(),
    context.userId ? `userId: ${context.userId}` : undefined,
    payload ? `payload: ${payload}` : undefined,
    `error: ${JSON.stringify(serializeError(error), null, 2)}`
  ].filter(Boolean);
  fs.appendFileSync(LOG_FILE, lines.join('\n') + '\n');
}
