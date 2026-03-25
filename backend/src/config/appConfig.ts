import 'dotenv/config';

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseOriginList = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(trimTrailingSlash);

export type AppConfig = {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  appBaseUrl: string;
  trustProxy: boolean;
  enableCronJobs: boolean;
  requestBodyLimit: string;
  allowedOrigins: string[];
  globalRateLimitWindowMs: number;
  globalRateLimitMax: number;
  authRateLimitWindowMs: number;
  authRateLimitMax: number;
};

export function createAppConfig(env: NodeJS.ProcessEnv): AppConfig {
  const nodeEnv = env.NODE_ENV?.trim() || 'development';
  const isProduction = nodeEnv === 'production';
  const appBaseUrlSource = env.APP_BASE_URL?.trim() || env.RENDER_EXTERNAL_URL?.trim() || '';
  const appBaseUrl = appBaseUrlSource ? trimTrailingSlash(appBaseUrlSource) : '';
  const allowedOrigins = parseOriginList(env.CORS_ALLOWED_ORIGINS);

  if (isProduction && !allowedOrigins.length) {
    throw new Error('Missing required environment variable: CORS_ALLOWED_ORIGINS');
  }

  return {
    nodeEnv,
    isProduction,
    port: parseNumber(env.PORT, 4000),
    appBaseUrl,
    trustProxy: parseBoolean(env.TRUST_PROXY, isProduction),
    enableCronJobs: parseBoolean(env.ENABLE_CRON_JOBS, true),
    requestBodyLimit: env.REQUEST_BODY_LIMIT?.trim() || '1mb',
    allowedOrigins: allowedOrigins.length ? allowedOrigins : DEFAULT_DEV_ORIGINS,
    globalRateLimitWindowMs: parseNumber(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    globalRateLimitMax: parseNumber(env.RATE_LIMIT_MAX, 300),
    authRateLimitWindowMs: parseNumber(env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    authRateLimitMax: parseNumber(env.AUTH_RATE_LIMIT_MAX, 20)
  };
}

export const appConfig = createAppConfig(process.env);

export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]) {
  if (!origin) return true;
  return allowedOrigins.includes(trimTrailingSlash(origin));
}
