import 'dotenv/config';

export type BillingMode = 'manual' | 'stripe';

export type StripeConfig = {
  mode: BillingMode;
  requestedMode: BillingMode;
  secretKey: string;
  webhookSecret: string;
  priceIdProMonthly: string;
  priceIdProYearly: string;
  apiVersion: string;
  isConfigured: boolean;
  missingKeys: string[];
};

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function parseBillingMode(env: NodeJS.ProcessEnv): BillingMode {
  const requested = env.BILLING_MODE?.trim().toLowerCase();
  if (requested === 'manual' || requested === 'stripe') {
    return requested;
  }

  return parseBoolean(env.MINIMAL_MODE, true) ? 'manual' : 'stripe';
}

export function createStripeConfig(env: NodeJS.ProcessEnv): StripeConfig {
  const requestedMode = parseBillingMode(env);
  const secretKey = env.STRIPE_SECRET_KEY?.trim() ?? '';
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
  const priceIdProMonthly = env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim() ?? '';
  const priceIdProYearly = env.STRIPE_PRICE_ID_PRO_YEARLY?.trim() ?? '';

  const rawMissingKeys = [
    !secretKey ? 'STRIPE_SECRET_KEY' : '',
    !webhookSecret ? 'STRIPE_WEBHOOK_SECRET' : '',
    !priceIdProMonthly ? 'STRIPE_PRICE_ID_PRO_MONTHLY' : '',
    !priceIdProYearly ? 'STRIPE_PRICE_ID_PRO_YEARLY' : ''
  ].filter(Boolean);
  const isConfigured = requestedMode === 'stripe' && rawMissingKeys.length === 0;
  const mode: BillingMode = isConfigured ? 'stripe' : 'manual';

  return {
    mode,
    requestedMode,
    secretKey,
    webhookSecret,
    priceIdProMonthly,
    priceIdProYearly,
    apiVersion: '2024-06-20',
    isConfigured,
    missingKeys: requestedMode === 'stripe' ? rawMissingKeys : []
  };
}

export const stripeConfig = createStripeConfig(process.env);
