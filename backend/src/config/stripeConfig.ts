import 'dotenv/config';

export type StripeConfig = {
  secretKey: string;
  webhookSecret: string;
  priceIdProMonthly: string;
  priceIdProYearly: string;
  apiVersion: string;
  isConfigured: boolean;
  missingKeys: string[];
};

export function createStripeConfig(env: NodeJS.ProcessEnv): StripeConfig {
  const secretKey = env.STRIPE_SECRET_KEY?.trim() ?? '';
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
  const priceIdProMonthly = env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim() ?? '';
  const priceIdProYearly = env.STRIPE_PRICE_ID_PRO_YEARLY?.trim() ?? '';

  const missingKeys = [
    !secretKey ? 'STRIPE_SECRET_KEY' : '',
    !webhookSecret ? 'STRIPE_WEBHOOK_SECRET' : '',
    !priceIdProMonthly ? 'STRIPE_PRICE_ID_PRO_MONTHLY' : '',
    !priceIdProYearly ? 'STRIPE_PRICE_ID_PRO_YEARLY' : ''
  ].filter(Boolean);

  return {
    secretKey,
    webhookSecret,
    priceIdProMonthly,
    priceIdProYearly,
    apiVersion: '2024-06-20',
    isConfigured: missingKeys.length === 0,
    missingKeys
  };
}

export const stripeConfig = createStripeConfig(process.env);
