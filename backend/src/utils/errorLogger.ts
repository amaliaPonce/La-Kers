import fs from 'fs';
import path from 'path';

type ErrorContext = {
  tag?: string;
  route?: string;
  payload?: any;
  userId?: string;
};

const LOG_FILE = path.resolve(process.cwd(), 'backend/logs/error.log');

function ensureLogDirectory() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function logError(error: unknown, context: ErrorContext = {}) {
  ensureLogDirectory();
  const timestamp = new Date().toISOString();
  const payload = context.payload ? JSON.stringify(context.payload, null, 2) : undefined;
  const lines = [
    `---
[${timestamp}] ${context.tag ?? 'ERROR'} ${context.route ? `@ ${context.route}` : ''}`.trim(),
    context.userId ? `userId: ${context.userId}` : undefined,
    payload ? `payload: ${payload}` : undefined,
    `error: ${typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}`
  ].filter(Boolean);
  fs.appendFileSync(LOG_FILE, lines.join('\n') + '\n');
}
