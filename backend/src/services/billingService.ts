import crypto from 'node:crypto';
import { APP_NAME } from '../config/brand';
import { stripeConfig } from '../config/stripeConfig';
import { appConfig, isOriginAllowed } from '../config/appConfig';
import { FREEMIUM_PLAN_ID, PRO_PLAN_ID, buildPlanPayload, getPlanDefinition } from '../config/plans';
import { supabaseAdmin } from '../config/supabaseClient';
import { countOwnerUnits } from './ownersService';
import { recordProductEvent } from './analyticsEventsService';

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
  status?: string | null;
  payment_status?: string | null;
  customer?: string | StripeCustomer | null;
  subscription?: string | StripeSubscription | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string | undefined> | null;
  line_items?: {
    data?: Array<{
      price?: {
        id?: string | null;
      } | null;
    }> | null;
  } | null;
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
  customer?: string | StripeCustomer | null;
  status?: string | null;
  metadata?: Record<string, string | undefined> | null;
  current_period_end?: number | null;
  items?: {
    data?: StripeSubscriptionItem[] | null;
  } | null;
};

type StripeInvoice = {
  id?: string | null;
  customer?: string | StripeCustomer | null;
  subscription?: string | StripeSubscription | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  amount_refunded?: number | null;
  currency?: string | null;
  status?: string | null;
};

type StripeCharge = {
  id?: string | null;
  customer?: string | StripeCustomer | null;
  invoice?: string | StripeInvoice | null;
  amount_refunded?: number | null;
  currency?: string | null;
};

type StripeWebhookEvent = {
  id?: string | null;
  type?: string;
  livemode?: boolean | null;
  created?: number | null;
  data?: { object?: any };
};

const MANUAL_ACTIVATION_EMAIL = process.env.BILLING_CONTACT_EMAIL?.trim() || 'alquilio.app@outlook.es';
const BILLING_ENABLED_STATUSES = new Set<SubscriptionStatus>(['active', 'trialing', 'past_due']);
const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;
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

function getStripeResourceId(value?: string | { id?: string | null } | null) {
  if (!value) return null;
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized || null;
  }
  const normalized = String(value.id ?? '').trim();
  return normalized || null;
}

async function stripeRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: URLSearchParams;
  } = {}
) {
  const method = options.method ?? 'POST';
  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeConfig.secretKey}`,
      'Stripe-Version': stripeConfig.apiVersion,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
    },
    body: method === 'POST' ? options.body : undefined
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

function normalizeStripeEventTime(unixSeconds?: number | null) {
  if (!unixSeconds || !Number.isFinite(unixSeconds)) return new Date().toISOString();
  return new Date(unixSeconds * 1000).toISOString();
}

export function shouldProcessStripeWebhookStatus(status?: string | null) {
  const normalized = String(status ?? '').trim();
  return normalized !== 'processed' && normalized !== 'duplicate';
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

export async function hasOwnerProPlan(ownerId: string) {
  const subscription = await getOwnerSubscription(ownerId);
  return getEffectivePlanId(subscription) === PRO_PLAN_ID;
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
      mode: stripeConfig.mode,
      checkoutAvailable: stripeConfig.mode === 'stripe',
      portalAvailable: stripeConfig.mode === 'stripe' && Boolean(subscription?.stripe_customer_id),
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
  body.set('description', `${APP_NAME} owner ${ownerId}`);

  const customer = await stripeRequest<StripeCustomer>('/v1/customers', { body });
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
  if (stripeConfig.mode !== 'stripe') {
    const error = new Error(
      stripeConfig.requestedMode === 'manual'
        ? 'La facturación automática está desactivada. Usa la activación manual.'
        : `Stripe no está configurado. Faltan: ${stripeConfig.missingKeys.join(', ')}`
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
  const successUrl = `${baseUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
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

  const session = await stripeRequest<StripeCheckoutSession>('/v1/checkout/sessions', { body });

  await upsertOwnerSubscription(ownerId, {
    plan_id: PRO_PLAN_ID,
    billing_cycle: billingCycle,
    subscription_status: subscription?.subscription_status ?? 'inactive',
    stripe_customer_id: getStripeResourceId(session.customer) ?? stripeCustomerId,
    stripe_subscription_id:
      getStripeResourceId(session.subscription) ?? subscription?.stripe_subscription_id ?? null,
    stripe_price_id: priceId,
    stripe_checkout_session_id: session.id ?? null
  });

  await recordProductEvent({
    ownerId,
    actorId: ownerId,
    actorType: 'OWNER',
    eventName: 'checkout_started',
    metadata: {
      billingCycle,
      stripeCheckoutSessionId: session.id ?? null
    }
  }).catch(() => undefined);

  return session;
}

export async function createPortalSession(ownerId: string, origin?: string) {
  if (stripeConfig.mode !== 'stripe') {
    const error = new Error('La gestión automática de billing está desactivada en este entorno');
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

  return stripeRequest<{ id?: string; url?: string }>('/v1/billing_portal/sessions', { body });
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

export function verifyStripeWebhookSignature(
  payload: Buffer,
  signatureHeader?: string | string[],
  toleranceSeconds = STRIPE_WEBHOOK_TOLERANCE_SECONDS
) {
  const header = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!stripeConfig.webhookSecret || !header) return false;

  const parts = header.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2) ?? '';
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || !signatures.length) return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (ageSeconds > toleranceSeconds) {
    return false;
  }

  const expected = buildStripeSignature(payload, timestamp);
  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

async function beginStripeWebhookEvent(event: StripeWebhookEvent) {
  const stripeEventId = String(event.id ?? '').trim();
  const eventType = String(event.type ?? 'unknown').trim() || 'unknown';
  if (!stripeEventId) {
    return { shouldProcess: true, stripeEventId: null };
  }

  const now = new Date().toISOString();
  const insert = await supabaseAdmin
    .from('stripe_webhook_events')
    .insert({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      livemode: event.livemode ?? null,
      status: 'received',
      attempts: 1,
      first_received_at: now,
      last_received_at: now
    });

  if (!insert.error) {
    return { shouldProcess: true, stripeEventId };
  }

  if (insert.error.code !== '23505') {
    const message = String(insert.error.message ?? '').toLowerCase();
    if (insert.error.code === '42P01' || message.includes('stripe_webhook_events')) {
      return { shouldProcess: true, stripeEventId: null };
    }
    throw insert.error;
  }

  const current = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('status, attempts')
    .eq('stripe_event_id', stripeEventId)
    .maybeSingle();
  if (current.error) throw current.error;

  const status = String((current.data as any)?.status ?? '');
  const attempts = Number((current.data as any)?.attempts ?? 1);
  const shouldProcess = shouldProcessStripeWebhookStatus(status);

  await supabaseAdmin
    .from('stripe_webhook_events')
    .update({
      attempts: attempts + 1,
      last_received_at: now,
      status: shouldProcess ? 'received' : 'duplicate'
    })
    .eq('stripe_event_id', stripeEventId);

  return { shouldProcess, stripeEventId };
}

async function markStripeWebhookProcessed(stripeEventId?: string | null) {
  if (!stripeEventId) return;
  await supabaseAdmin
    .from('stripe_webhook_events')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      error_message: null
    })
    .eq('stripe_event_id', stripeEventId)
    .then(() => null, () => null);
}

async function markStripeWebhookFailed(stripeEventId: string | null | undefined, error: unknown) {
  if (!stripeEventId) return;
  await supabaseAdmin
    .from('stripe_webhook_events')
    .update({
      status: 'failed',
      error_message: String((error as Error)?.message ?? 'webhook_failed').slice(0, 500),
      last_received_at: new Date().toISOString()
    })
    .eq('stripe_event_id', stripeEventId)
    .then(() => null, () => null);
}

async function recordStripeBillingEvent(options: {
  event: StripeWebhookEvent;
  ownerId?: string | null;
  object?: any;
  amountCents?: number | null;
  currency?: string | null;
  billingCycle?: BillingCycle | null;
  subscriptionStatus?: string | null;
}) {
  const object = options.object ?? {};
  await supabaseAdmin
    .from('stripe_billing_events')
    .insert({
      stripe_event_id: options.event.id ?? null,
      event_type: String(options.event.type ?? 'unknown'),
      owner_id: options.ownerId ?? null,
      stripe_customer_id: getStripeResourceId(object.customer) ?? null,
      stripe_subscription_id: getStripeResourceId(object.subscription) ?? object.id ?? null,
      stripe_invoice_id: object.id && String(options.event.type ?? '').startsWith('invoice.') ? object.id : null,
      amount_cents: options.amountCents ?? null,
      currency: options.currency ?? object.currency ?? null,
      billing_cycle: options.billingCycle ?? null,
      subscription_status: options.subscriptionStatus ?? object.status ?? null,
      metadata: {
        livemode: options.event.livemode ?? null
      },
      occurred_at: normalizeStripeEventTime(options.event.created)
    })
    .then(() => null, () => null);
}

async function fetchStripeSubscription(stripeSubscriptionId: string) {
  const normalized = stripeSubscriptionId.trim();
  if (!normalized) return null;
  return stripeRequest<StripeSubscription>(`/v1/subscriptions/${encodeURIComponent(normalized)}`, {
    method: 'GET'
  });
}

async function fetchStripeCheckoutSession(stripeCheckoutSessionId: string) {
  const normalized = stripeCheckoutSessionId.trim();
  if (!normalized) return null;
  const query = new URLSearchParams();
  query.append('expand[]', 'subscription');
  query.append('expand[]', 'line_items.data.price');
  return stripeRequest<StripeCheckoutSession>(
    `/v1/checkout/sessions/${encodeURIComponent(normalized)}?${query.toString()}`,
    { method: 'GET' }
  );
}

function resolveStripePriceId(options: {
  session?: StripeCheckoutSession | null;
  subscription?: StripeSubscription | null;
  existingRecord?: OwnerSubscriptionRecord | null;
}) {
  const subscriptionPriceId = options.subscription?.items?.data?.[0]?.price?.id ?? null;
  if (subscriptionPriceId) return subscriptionPriceId;

  const sessionPriceId = options.session?.line_items?.data?.[0]?.price?.id ?? null;
  if (sessionPriceId) return sessionPriceId;

  return options.existingRecord?.stripe_price_id ?? null;
}

function resolveStripeCheckoutStatus(options: {
  session?: StripeCheckoutSession | null;
  subscription?: StripeSubscription | null;
  existingRecord?: OwnerSubscriptionRecord | null;
}) {
  if (options.subscription?.status) {
    return normalizeSubscriptionStatus(options.subscription.status);
  }
  if (options.session?.payment_status === 'paid') {
    return 'active';
  }
  return normalizeSubscriptionStatus(options.existingRecord?.subscription_status);
}

async function syncOwnerSubscriptionWithStripeCheckoutSession(
  ownerId: string,
  session: StripeCheckoutSession
) {
  const stripeCheckoutSessionId = String(session.id ?? '').trim();
  const stripeCustomerId = getStripeResourceId(session.customer);
  const stripeSubscriptionId = getStripeResourceId(session.subscription);
  const existingRecord = await findSubscriptionByStripeIds({
    stripeCustomerId,
    stripeSubscriptionId
  });

  const subscription =
    typeof session.subscription === 'string'
      ? await fetchStripeSubscription(session.subscription)
      : (session.subscription ?? null);
  const stripePriceId = resolveStripePriceId({
    session,
    subscription,
    existingRecord
  });
  const billingCycle =
    resolveBillingCycleFromPriceId(stripePriceId) ??
    (session.metadata?.billing_cycle === 'yearly' ? 'yearly' : 'monthly');
  const subscriptionStatus = resolveStripeCheckoutStatus({
    session,
    subscription,
    existingRecord
  });

  await upsertOwnerSubscription(ownerId, {
    plan_id: resolvePlanIdFromPriceId(stripePriceId),
    billing_cycle: billingCycle,
    subscription_status: subscriptionStatus,
    stripe_customer_id: stripeCustomerId ?? existingRecord?.stripe_customer_id ?? null,
    stripe_subscription_id: stripeSubscriptionId ?? existingRecord?.stripe_subscription_id ?? null,
    stripe_price_id: stripePriceId,
    stripe_checkout_session_id: stripeCheckoutSessionId || existingRecord?.stripe_checkout_session_id || null,
    current_period_end:
      normalizeCurrentPeriodEnd(subscription?.current_period_end) ??
      existingRecord?.current_period_end ??
      null
  });
}

export async function confirmCheckoutSession(ownerId: string, stripeCheckoutSessionId: string) {
  if (stripeConfig.mode !== 'stripe') {
    const error = new Error(
      stripeConfig.requestedMode === 'manual'
        ? 'La facturación automática está desactivada en este entorno.'
        : `Stripe no está configurado. Faltan: ${stripeConfig.missingKeys.join(', ')}`
    );
    (error as any).status = 503;
    throw error;
  }

  const session = await fetchStripeCheckoutSession(stripeCheckoutSessionId);
  if (!session?.id) {
    const error = new Error('No se encontró la sesión de checkout de Stripe');
    (error as any).status = 404;
    throw error;
  }

  const sessionOwnerId = String(session.client_reference_id ?? session.metadata?.owner_id ?? '').trim();
  if (!sessionOwnerId || sessionOwnerId !== ownerId) {
    const error = new Error('La sesión de checkout no pertenece a esta cuenta');
    (error as any).status = 403;
    throw error;
  }

  await syncOwnerSubscriptionWithStripeCheckoutSession(ownerId, session);
  return getOwnerBillingSummary(ownerId);
}

export async function handleStripeWebhookEvent(event: StripeWebhookEvent) {
  const webhookState = await beginStripeWebhookEvent(event);
  if (!webhookState.shouldProcess) {
    return;
  }

  const type = String(event.type ?? '');
  const object = event.data?.object;

  if (!object) {
    await markStripeWebhookProcessed(webhookState.stripeEventId);
    return;
  }

  try {
    if (type === 'checkout.session.completed') {
      const session = object as StripeCheckoutSession;
      const ownerId = String(session.client_reference_id ?? session.metadata?.owner_id ?? '').trim();
      if (!ownerId) {
        await markStripeWebhookProcessed(webhookState.stripeEventId);
        return;
      }

      await syncOwnerSubscriptionWithStripeCheckoutSession(ownerId, session);
      await recordStripeBillingEvent({
        event,
        ownerId,
        object: session,
        billingCycle: session.metadata?.billing_cycle === 'yearly' ? 'yearly' : 'monthly',
        subscriptionStatus: 'active'
      });
      await recordProductEvent({
        ownerId,
        actorId: ownerId,
        actorType: 'SYSTEM',
        eventName: 'subscription_checkout_completed',
        metadata: {
          stripeEventId: event.id ?? null
        }
      }).catch(() => undefined);
      await recordProductEvent({
        ownerId,
        actorId: ownerId,
        actorType: 'SYSTEM',
        eventName: 'stripe_webhook_processed',
        metadata: {
          stripeEventId: event.id ?? null,
          type
        }
      }).catch(() => undefined);
      await markStripeWebhookProcessed(webhookState.stripeEventId);
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
        stripeCustomerId: getStripeResourceId(subscription.customer),
        stripeSubscriptionId: subscription.id ?? null
      });
      const ownerId = ownerIdFromMetadata || existingRecord?.owner_id || '';
      if (!ownerId) {
        await markStripeWebhookProcessed(webhookState.stripeEventId);
        return;
      }

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
        stripe_customer_id:
          getStripeResourceId(subscription.customer) ?? existingRecord?.stripe_customer_id ?? null,
        stripe_subscription_id: subscription.id ?? existingRecord?.stripe_subscription_id ?? null,
        stripe_price_id: stripePriceId,
        current_period_end: normalizeCurrentPeriodEnd(subscription.current_period_end)
      });
      await recordStripeBillingEvent({
        event,
        ownerId,
        object: subscription,
        billingCycle,
        subscriptionStatus: status
      });
      await recordProductEvent({
        ownerId,
        actorId: ownerId,
        actorType: 'SYSTEM',
        eventName: type === 'customer.subscription.deleted' ? 'subscription_canceled' : 'subscription_active',
        metadata: {
          stripeEventId: event.id ?? null,
          subscriptionStatus: status
        }
      }).catch(() => undefined);
      await recordProductEvent({
        ownerId,
        actorId: ownerId,
        actorType: 'SYSTEM',
        eventName: 'stripe_webhook_processed',
        metadata: {
          stripeEventId: event.id ?? null,
          type
        }
      }).catch(() => undefined);
      await markStripeWebhookProcessed(webhookState.stripeEventId);
      return;
    }

    if (type === 'invoice.payment_succeeded' || type === 'invoice.payment_failed') {
      const invoice = object as StripeInvoice;
      const existingRecord = await findSubscriptionByStripeIds({
        stripeCustomerId: getStripeResourceId(invoice.customer),
        stripeSubscriptionId: getStripeResourceId(invoice.subscription)
      });
      await recordStripeBillingEvent({
        event,
        ownerId: existingRecord?.owner_id ?? null,
        object: invoice,
        amountCents: type === 'invoice.payment_succeeded' ? Number(invoice.amount_paid ?? 0) : 0,
        currency: invoice.currency ?? null,
        billingCycle: existingRecord?.billing_cycle ?? null,
        subscriptionStatus: existingRecord?.subscription_status ?? invoice.status ?? null
      });
      await markStripeWebhookProcessed(webhookState.stripeEventId);
      return;
    }

    if (type === 'charge.refunded') {
      const charge = object as StripeCharge;
      const existingRecord = await findSubscriptionByStripeIds({
        stripeCustomerId: getStripeResourceId(charge.customer)
      });
      await recordStripeBillingEvent({
        event,
        ownerId: existingRecord?.owner_id ?? null,
        object: charge,
        amountCents: -Math.abs(Number(charge.amount_refunded ?? 0)),
        currency: charge.currency ?? null,
        billingCycle: existingRecord?.billing_cycle ?? null,
        subscriptionStatus: existingRecord?.subscription_status ?? null
      });
      await markStripeWebhookProcessed(webhookState.stripeEventId);
      return;
    }

    await markStripeWebhookProcessed(webhookState.stripeEventId);
  } catch (error) {
    await markStripeWebhookFailed(webhookState.stripeEventId, error);
    await recordProductEvent({
      actorType: 'SYSTEM',
      eventName: 'stripe_webhook_failed',
      severity: 'danger',
      metadata: {
        stripeEventId: event.id ?? null,
        type
      }
    }).catch(() => undefined);
    throw error;
  }
}
