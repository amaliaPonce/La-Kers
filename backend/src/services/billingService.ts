import crypto from 'node:crypto';
import { stripeConfig } from '../config/stripeConfig';
import { appConfig, isOriginAllowed } from '../config/appConfig';
import { FREEMIUM_PLAN_ID, PRO_PLAN_ID, getPlanDefinition } from '../config/plans';
import { supabaseAdmin } from '../config/supabaseClient';
import { buildPlanPayload, countOwnerUnits } from './ownersService';

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

type OwnerSubscriptionRecord = {
  owner_id: string;
  plan_id?: string | null;
  billing_cycle?: BillingCycle | null;
  subscription_status?: SubscriptionStatus | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  stripe_checkout_session_id?: string | null;
  current_period_end?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type StripeCheckoutSession = {
  id?: string;
  url?: string;
  customer?: string | null;
  subscription?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string | undefined> | null;
};

type StripeCustomer = {
  id?: string;
};

type StripeSubscriptionItem = {
  price?: {
    id?: string | null;
  } | null;
};

type StripeSubscription = {
  id?: string;
  customer?: string | null;
  status?: string | null;
  metadata?: Record<string, string | undefined> | null;
  current_period_end?: number | null;
  items?: {
    data?: StripeSubscriptionItem[] | null;
  } | null;
};

const MANUAL_ACTIVATION_EMAIL = process.env.BILLING_CONTACT_EMAIL?.trim() || 'contacto@la-kers.com';
const BILLING_ENABLED_STATUSES = new Set<SubscriptionStatus>(['active', 'trialing', 'past_due']);
const BILLING_STATUSES: SubscriptionStatus[] = [
  'inactive',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired'
];

function isMissingOwnerSubscriptionsTable(error: { code?: string | null; message?: string | null } | null | undefined) {
  const code = String(error?.code ?? '').trim();
  const message = String(error?.message ?? '').toLowerCase();
  return code === '42P01' || message.includes('owner_subscriptions');
}

function normalizeSubscriptionStatus(value?: string | null): SubscriptionStatus {
  const normalized = String(value ?? '').trim().toLowerCase() as SubscriptionStatus;
  return BILLING_STATUSES.includes(normalized) ? normalized : 'inactive';
}

function resolvePlanIdFromPriceId(priceId?: string | null) {
  const normalized = String(priceId ?? '').trim();
  if (!normalized) return FREEMIUM_PLAN_ID;
  if (
    normalized === stripeConfig.priceIdProMonthly ||
    normalized === stripeConfig.priceIdProYearly
  ) {
    return PRO_PLAN_ID;
  }
  return FREEMIUM_PLAN_ID;
}

function resolveBillingCycleFromPriceId(priceId?: string | null): BillingCycle | null {
  const normalized = String(priceId ?? '').trim();
  if (!normalized) return null;
  if (normalized === stripeConfig.priceIdProMonthly) return 'monthly';
  if (normalized === stripeConfig.priceIdProYearly) return 'yearly';
  return null;
}

function getEffectivePlanId(subscription?: OwnerSubscriptionRecord | null) {
  if (
    subscription?.plan_id === PRO_PLAN_ID &&
    BILLING_ENABLED_STATUSES.has(normalizeSubscriptionStatus(subscription.subscription_status))
  ) {
    return PRO_PLAN_ID;
  }
  return FREEMIUM_PLAN_ID;
}

function getBillingReturnBaseUrl(origin?: string) {
  const normalizedOrigin = origin?.trim().replace(/\/+$/, '');
  if (normalizedOrigin && isOriginAllowed(normalizedOrigin, appConfig.allowedOrigins)) {
    return normalizedOrigin;
  }
  if (appConfig.allowedOrigins[0]) {
    return appConfig.allowedOrigins[0];
  }
  if (appConfig.appBaseUrl) {
    return appConfig.appBaseUrl;
  }
  return 'http://localhost:5173';
}

async function stripeRequest<T>(path: string, body: URLSearchParams) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeConfig.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error?.message === 'string'
        ? data.error.message
        : 'Stripe rechazó la solicitud';
    const error = new Error(message);
    (error as any).status = response.status;
    throw error;
  }

  return data as T;
}

function buildStripeSignature(payload: Buffer, timestamp: string) {
  return crypto
    .createHmac('sha256', stripeConfig.webhookSecret)
    .update(`${timestamp}.${payload.toString('utf8')}`)
    .digest('hex');
}

function normalizeCurrentPeriodEnd(unixSeconds?: number | null) {
  if (!unixSeconds || !Number.isFinite(unixSeconds)) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

async function findSubscriptionByStripeIds(options: {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const { stripeCustomerId, stripeSubscriptionId } = options;

  if (stripeSubscriptionId) {
    const { data, error } = await supabaseAdmin
      .from('owner_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle();
    if (error) {
      if (isMissingOwnerSubscriptionsTable(error)) return null;
      throw error;
    }
    if (data) return data as OwnerSubscriptionRecord;
  }

  if (stripeCustomerId) {
    const { data, error } = await supabaseAdmin
      .from('owner_subscriptions')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle();
    if (error) {
      if (isMissingOwnerSubscriptionsTable(error)) return null;
      throw error;
    }
    if (data) return data as OwnerSubscriptionRecord;
  }

  return null;
}

export async function getOwnerSubscription(ownerId: string) {
  if (!ownerId) return null;
  const { data, error } = await supabaseAdmin
    .from('owner_subscriptions')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    if (isMissingOwnerSubscriptionsTable(error)) {
      return null;
    }
    throw error;
  }

  return (data as OwnerSubscriptionRecord | null) ?? null;
}

export async function getOwnerBillingSummary(ownerId: string) {
  const [subscription, unitCount] = await Promise.all([
    getOwnerSubscription(ownerId),
    countOwnerUnits(ownerId)
  ]);

  const effectivePlan = getPlanDefinition(getEffectivePlanId(subscription));
  const remainingUnits = Math.max(effectivePlan.unitLimit - unitCount, 0);

  return {
    plan: buildPlanPayload(effectivePlan),
    usage: {
      unitCount,
      unitLimit: effectivePlan.unitLimit,
      remainingUnits,
      canAddMoreUnits: unitCount < effectivePlan.unitLimit
    },
    billing: {
      mode: stripeConfig.isConfigured ? 'stripe' : 'manual',
      checkoutAvailable: stripeConfig.isConfigured,
      portalAvailable: stripeConfig.isConfigured && Boolean(subscription?.stripe_customer_id),
      manualActivationEmail: MANUAL_ACTIVATION_EMAIL,
      current: {
        planId: subscription?.plan_id ?? FREEMIUM_PLAN_ID,
        subscriptionStatus: normalizeSubscriptionStatus(subscription?.subscription_status),
        billingCycle: subscription?.billing_cycle ?? null,
        currentPeriodEnd: subscription?.current_period_end ?? null,
        stripeCustomerId: subscription?.stripe_customer_id ?? null,
        stripeSubscriptionId: subscription?.stripe_subscription_id ?? null
      }
    }
  };
}

export async function ensureOwnerCanCreateUnit(ownerId: string) {
  const summary = await getOwnerBillingSummary(ownerId);
  if (summary.usage.canAddMoreUnits) {
    return summary;
  }

  const error = new Error(
    `Has alcanzado el límite del plan ${summary.plan.name}. Activa Pro para añadir más inmuebles.`
  );
  (error as any).status = 403;
  throw error;
}

async function ensureStripeCustomer(ownerId: string, subscription?: OwnerSubscriptionRecord | null) {
  const existingStripeCustomerId = String(subscription?.stripe_customer_id ?? '').trim();
  if (existingStripeCustomerId) {
    return existingStripeCustomerId;
  }

  const body = new URLSearchParams();
  body.set('metadata[owner_id]', ownerId);
  body.set('description', `La-Kers owner ${ownerId}`);

  const customer = await stripeRequest<StripeCustomer>('/v1/customers', body);
  const stripeCustomerId = String(customer.id ?? '').trim();

  if (!stripeCustomerId) {
    throw new Error('Stripe no devolvió un customer válido');
  }

  await upsertOwnerSubscription(ownerId, {
    plan_id: subscription?.plan_id ?? FREEMIUM_PLAN_ID,
    billing_cycle: subscription?.billing_cycle ?? null,
    subscription_status: subscription?.subscription_status ?? 'inactive',
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription?.stripe_subscription_id ?? null,
    stripe_price_id: subscription?.stripe_price_id ?? null,
    stripe_checkout_session_id: subscription?.stripe_checkout_session_id ?? null,
    current_period_end: subscription?.current_period_end ?? null
  });

  return stripeCustomerId;
}

export async function createCheckoutSession(ownerId: string, billingCycle: BillingCycle, origin?: string) {
  if (!stripeConfig.isConfigured) {
    const error = new Error(
      `Stripe no está configurado. Faltan: ${stripeConfig.missingKeys.join(', ')}`
    );
    (error as any).status = 503;
    throw error;
  }

  const subscription = await getOwnerSubscription(ownerId);
  if (getEffectivePlanId(subscription) === PRO_PLAN_ID) {
    const error = new Error('La cuenta ya tiene Pro activo. Usa el portal de facturación para gestionarlo.');
    (error as any).status = 409;
    throw error;
  }

  const priceId =
    billingCycle === 'yearly'
      ? stripeConfig.priceIdProYearly
      : stripeConfig.priceIdProMonthly;
  const baseUrl = getBillingReturnBaseUrl(origin);
  const successUrl = `${baseUrl}/billing?checkout=success`;
  const cancelUrl = `${baseUrl}/billing?checkout=cancelled`;
  const body = new URLSearchParams();
  const stripeCustomerId = await ensureStripeCustomer(ownerId, subscription);

  body.set('mode', 'subscription');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  body.set('client_reference_id', ownerId);
  body.set('line_items[0][price]', priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('allow_promotion_codes', 'true');
  body.set('metadata[owner_id]', ownerId);
  body.set('metadata[billing_cycle]', billingCycle);
  body.set('subscription_data[metadata][owner_id]', ownerId);
  body.set('subscription_data[metadata][billing_cycle]', billingCycle);
  body.set('customer', stripeCustomerId);

  const session = await stripeRequest<StripeCheckoutSession>('/v1/checkout/sessions', body);

  await upsertOwnerSubscription(ownerId, {
    plan_id: PRO_PLAN_ID,
    billing_cycle: billingCycle,
    subscription_status: subscription?.subscription_status ?? 'inactive',
    stripe_customer_id: session.customer ?? stripeCustomerId,
    stripe_subscription_id: session.subscription ?? subscription?.stripe_subscription_id ?? null,
    stripe_price_id: priceId,
    stripe_checkout_session_id: session.id ?? null
  });

  return session;
}

export async function createPortalSession(ownerId: string, origin?: string) {
  if (!stripeConfig.isConfigured) {
    const error = new Error('Stripe no está configurado');
    (error as any).status = 503;
    throw error;
  }

  const subscription = await getOwnerSubscription(ownerId);
  if (!subscription?.stripe_customer_id) {
    const error = new Error('Todavía no existe un cliente Stripe asociado a esta cuenta');
    (error as any).status = 400;
    throw error;
  }

  const body = new URLSearchParams();
  body.set('customer', subscription.stripe_customer_id);
  body.set('return_url', `${getBillingReturnBaseUrl(origin)}/billing`);

  return stripeRequest<{ id?: string; url?: string }>('/v1/billing_portal/sessions', body);
}

export async function upsertOwnerSubscription(ownerId: string, payload: Partial<OwnerSubscriptionRecord>) {
  const data = {
    owner_id: ownerId,
    plan_id: payload.plan_id ?? FREEMIUM_PLAN_ID,
    billing_cycle: payload.billing_cycle ?? null,
    subscription_status: normalizeSubscriptionStatus(payload.subscription_status),
    stripe_customer_id: payload.stripe_customer_id ?? null,
    stripe_subscription_id: payload.stripe_subscription_id ?? null,
    stripe_price_id: payload.stripe_price_id ?? null,
    stripe_checkout_session_id: payload.stripe_checkout_session_id ?? null,
    current_period_end: payload.current_period_end ?? null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseAdmin
    .from('owner_subscriptions')
    .upsert(data, { onConflict: 'owner_id' });
  if (error) {
    if (isMissingOwnerSubscriptionsTable(error)) return null;
    throw error;
  }
  return data;
}

export function verifyStripeWebhookSignature(payload: Buffer, signatureHeader?: string | string[]) {
  const header = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!stripeConfig.webhookSecret || !header) return false;

  const parts = header.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2) ?? '';
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || !signatures.length) return false;

  const expected = buildStripeSignature(payload, timestamp);
  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export async function handleStripeWebhookEvent(event: { type?: string; data?: { object?: any } }) {
  const type = String(event.type ?? '');
  const object = event.data?.object;

  if (!object) return;

  if (type === 'checkout.session.completed') {
    const session = object as StripeCheckoutSession;
    const ownerId = String(session.client_reference_id ?? session.metadata?.owner_id ?? '').trim();
    const billingCycle = session.metadata?.billing_cycle === 'yearly' ? 'yearly' : 'monthly';
    if (!ownerId) return;

    await upsertOwnerSubscription(ownerId, {
      plan_id: PRO_PLAN_ID,
      billing_cycle: billingCycle,
      subscription_status: 'active',
      stripe_customer_id: session.customer ?? null,
      stripe_subscription_id: session.subscription ?? null,
      stripe_price_id:
        billingCycle === 'yearly'
          ? stripeConfig.priceIdProYearly
          : stripeConfig.priceIdProMonthly,
      stripe_checkout_session_id: session.id ?? null
    });
    return;
  }

  if (
    type === 'customer.subscription.created' ||
    type === 'customer.subscription.updated' ||
    type === 'customer.subscription.deleted'
  ) {
    const subscription = object as StripeSubscription;
    const firstItem = subscription.items?.data?.[0];
    const stripePriceId = firstItem?.price?.id ?? null;
    const ownerIdFromMetadata = String(subscription.metadata?.owner_id ?? '').trim();
    const existingRecord = await findSubscriptionByStripeIds({
      stripeCustomerId: subscription.customer ?? null,
      stripeSubscriptionId: subscription.id ?? null
    });
    const ownerId = ownerIdFromMetadata || existingRecord?.owner_id || '';
    if (!ownerId) return;

    const planId = resolvePlanIdFromPriceId(stripePriceId);
    const billingCycle =
      resolveBillingCycleFromPriceId(stripePriceId) ??
      existingRecord?.billing_cycle ??
      null;
    const status =
      type === 'customer.subscription.deleted'
        ? 'canceled'
        : normalizeSubscriptionStatus(subscription.status);

    await upsertOwnerSubscription(ownerId, {
      plan_id: planId,
      billing_cycle: billingCycle,
      subscription_status: status,
      stripe_customer_id: subscription.customer ?? existingRecord?.stripe_customer_id ?? null,
      stripe_subscription_id: subscription.id ?? existingRecord?.stripe_subscription_id ?? null,
      stripe_price_id: stripePriceId,
      current_period_end: normalizeCurrentPeriodEnd(subscription.current_period_end)
    });
  }
}
