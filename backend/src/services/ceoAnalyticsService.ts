import { supabaseAdmin } from '../config/supabaseClient';
import { PRO_PLAN_ID, getPlanDefinition } from '../config/plans';
import { getCeoPrimaryEmail } from '../middleware/ceoAdminMiddleware';

export type AnalyticsFilters = {
  from: string;
  to: string;
  tenant: string | null;
};

export type Pagination = {
  page: number;
  pageSize: number;
};

type OwnerProfileRecord = {
  owner_id?: string | null;
  created_at?: string | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  activated_at?: string | null;
};

type ProductEventRecord = {
  id?: string | null;
  owner_id?: string | null;
  actor_type?: string | null;
  event_name?: string | null;
  severity?: string | null;
  metadata?: Record<string, unknown> | null;
  occurred_at?: string | null;
};

type OwnerSubscriptionRecord = {
  owner_id?: string | null;
  plan_id?: string | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  subscription_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

type ApiRequestLogRecord = {
  owner_id?: string | null;
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  duration_ms?: number | null;
  occurred_at?: string | null;
};

type StripeWebhookRecord = {
  stripe_event_id?: string | null;
  event_type?: string | null;
  status?: string | null;
  attempts?: number | null;
  last_received_at?: string | null;
};

type StripeBillingEventRecord = {
  event_type?: string | null;
  owner_id?: string | null;
  amount_cents?: number | null;
  billing_cycle?: string | null;
  subscription_status?: string | null;
  occurred_at?: string | null;
};

type UnitRecord = {
  id?: string | null;
  owner_id?: string | null;
  created_at?: string | null;
};

type OwnerSeedRecord = {
  owner_id?: string | null;
  created_at?: string | null;
};

type RelatedOwnerRecord = {
  created_at?: string | null;
  units?: { owner_id?: string | null } | Array<{ owner_id?: string | null }> | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);
const PASSIVE_EVENTS = new Set(['owner_first_seen', 'signup_completed', 'login_completed', 'ceo_access_denied']);

function isMissingAnalyticsTable(error: { code?: string | null; message?: string | null } | null | undefined) {
  const message = String(error?.message ?? '').toLowerCase();
  return (
    String(error?.code ?? '') === '42P01' ||
    message.includes('owner_profiles') ||
    message.includes('product_events') ||
    message.includes('stripe_webhook_events') ||
    message.includes('stripe_billing_events') ||
    message.includes('api_request_logs')
  );
}

function buildMissingAnalyticsError() {
  const error = new Error('Falta aplicar sql/20260426_ceo_analytics.sql');
  (error as { status?: number }).status = 503;
  return error;
}

function parseDate(value: unknown) {
  const date = value ? new Date(String(value)) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function toIsoDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setUTCHours(23, 59, 59, 999);
  return next;
}

function clampPage(value: unknown) {
  const page = Number(value ?? 1);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function clampPageSize(value: unknown) {
  const pageSize = Number(value ?? 25);
  if (!Number.isInteger(pageSize) || pageSize <= 0) return 25;
  return Math.min(pageSize, 100);
}

function normalizeOwnerId(value?: string | null) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function normalizeTenantFilter(value: unknown) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized.toLowerCase() === 'all') return null;
  return normalized;
}

export function parseAnalyticsFilters(query: Record<string, unknown>, now = new Date()): AnalyticsFilters {
  const defaultTo = now;
  const defaultFrom = new Date(now.getTime() - 29 * DAY_MS);
  const parsedFrom = parseDate(query.from);
  const parsedTo = parseDate(query.to);
  const from = startOfDay(parsedFrom ?? defaultFrom);
  const to = endOfDay(parsedTo ?? defaultTo);

  if (from.getTime() > to.getTime()) {
    const error = new Error('El rango de fechas no es válido');
    (error as { status?: number }).status = 400;
    throw error;
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    tenant: normalizeTenantFilter(query.tenant)
  };
}

export function parsePagination(query: Record<string, unknown>): Pagination {
  return {
    page: clampPage(query.page),
    pageSize: clampPageSize(query.pageSize)
  };
}

function ownerFromRelated(record: RelatedOwnerRecord) {
  const units = record.units;
  if (Array.isArray(units)) return normalizeOwnerId(units[0]?.owner_id);
  return normalizeOwnerId(units?.owner_id);
}

async function resolveOwnerEmails(ownerIds: string[]) {
  const entries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      const email = await getCeoPrimaryEmail(ownerId).catch(() => null);
      return [ownerId, email] as const;
    })
  );
  return new Map(entries);
}

function inRange(value: string | null | undefined, filters: AnalyticsFilters) {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(time) && time >= new Date(filters.from).getTime() && time <= new Date(filters.to).getTime();
}

function groupCount<T>(items: T[], resolveKey: (item: T) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = String(resolveKey(item) ?? '').trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function uniqueOwners(events: ProductEventRecord[], options: { includePassive?: boolean } = {}) {
  const owners = new Set<string>();
  for (const event of events) {
    const ownerId = normalizeOwnerId(event.owner_id);
    const eventName = String(event.event_name ?? '');
    if (!ownerId) continue;
    if (!options.includePassive && PASSIVE_EVENTS.has(eventName)) continue;
    owners.add(ownerId);
  }
  return owners;
}

function percentile(values: number[], target: number) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.ceil((target / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function subscriptionMonthlyValueCents(subscription: OwnerSubscriptionRecord) {
  if (subscription.plan_id !== PRO_PLAN_ID || !ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.subscription_status ?? ''))) {
    return 0;
  }
  const plan = getPlanDefinition(PRO_PLAN_ID);
  return subscription.billing_cycle === 'yearly'
    ? Math.round(plan.yearlyPriceCents / 12)
    : plan.monthlyPriceCents;
}

function buildDayTrend(filters: AnalyticsFilters, ownerProfiles: OwnerProfileRecord[], events: ProductEventRecord[]) {
  const from = startOfDay(new Date(filters.from));
  const to = startOfDay(new Date(filters.to));
  const labels: Array<{ key: string; label: string; start: Date; end: Date }> = [];
  for (let cursor = new Date(from); cursor.getTime() <= to.getTime(); cursor = new Date(cursor.getTime() + DAY_MS)) {
    labels.push({
      key: toIsoDateInput(cursor),
      label: `${String(cursor.getDate()).padStart(2, '0')}/${String(cursor.getMonth() + 1).padStart(2, '0')}`,
      start: startOfDay(cursor),
      end: endOfDay(cursor)
    });
    if (labels.length >= 62) break;
  }

  return labels.map((bucket) => {
    const bucketEvents = events.filter((event) => inRange(event.occurred_at, {
      ...filters,
      from: bucket.start.toISOString(),
      to: bucket.end.toISOString()
    }));
    const newOwners = ownerProfiles.filter((owner) => inRange(owner.created_at, {
      ...filters,
      from: bucket.start.toISOString(),
      to: bucket.end.toISOString()
    })).length;
    return {
      label: bucket.label,
      activeOwners: uniqueOwners(bucketEvents).size,
      newOwners,
      events: bucketEvents.length
    };
  });
}

async function runAnalyticsQuery<T>(query: PromiseLike<{ data: unknown; error: any }>) {
  const { data, error } = await query;
  if (error) {
    if (isMissingAnalyticsTable(error)) throw buildMissingAnalyticsError();
    throw error;
  }
  return (data ?? []) as T[];
}

async function backfillOwnerProfilesFromExistingData(filters: AnalyticsFilters) {
  const [existingProfiles, units, subscriptions, portalAccess] = await Promise.all([
    runAnalyticsQuery<OwnerProfileRecord>(supabaseAdmin.from('owner_profiles').select('owner_id')),
    runAnalyticsQuery<OwnerSeedRecord>(supabaseAdmin.from('units').select('owner_id, created_at')),
    runAnalyticsQuery<OwnerSeedRecord>(supabaseAdmin.from('owner_subscriptions').select('owner_id, created_at')),
    runAnalyticsQuery<OwnerSeedRecord>(supabaseAdmin.from('tenant_portal_access').select('owner_id, created_at'))
  ]).catch((error) => {
    if ((error as { status?: number })?.status === 503) return [[], [], [], []] as OwnerSeedRecord[][];
    throw error;
  });

  const existingOwnerIds = new Set(existingProfiles.map((profile) => normalizeOwnerId(profile.owner_id)).filter(Boolean));
  const seeds = [...units, ...subscriptions, ...portalAccess];
  const byOwner = new Map<string, string>();

  for (const seed of seeds) {
    const ownerId = normalizeOwnerId(seed.owner_id);
    if (!ownerId || existingOwnerIds.has(ownerId)) continue;
    if (filters.tenant && ownerId !== filters.tenant) continue;

    const createdAt = parseDate(seed.created_at)?.toISOString() ?? new Date().toISOString();
    const previous = byOwner.get(ownerId);
    if (!previous || new Date(createdAt).getTime() < new Date(previous).getTime()) {
      byOwner.set(ownerId, createdAt);
    }
  }

  const rows = [...byOwner.entries()].map(([ownerId, createdAt]) => ({
    owner_id: ownerId,
    created_at: createdAt,
    first_seen_at: createdAt,
    last_seen_at: createdAt,
    updated_at: new Date().toISOString()
  }));

  if (!rows.length) return;

  const { error } = await supabaseAdmin.from('owner_profiles').insert(rows);
  if (error && !isMissingAnalyticsTable(error) && error.code !== '23505') {
    throw error;
  }
}

async function loadAnalyticsDataset(filters: AnalyticsFilters) {
  await backfillOwnerProfilesFromExistingData(filters);

  const ownerFilter = filters.tenant;
  const usageFrom = new Date(new Date(filters.to).getTime() - 90 * DAY_MS).toISOString();

  let ownerProfilesQuery = supabaseAdmin.from('owner_profiles').select('*').order('created_at', { ascending: true });
  if (ownerFilter) ownerProfilesQuery = ownerProfilesQuery.eq('owner_id', ownerFilter);

  let productEventsQuery = supabaseAdmin
    .from('product_events')
    .select('*')
    .gte('occurred_at', usageFrom)
    .lte('occurred_at', filters.to)
    .order('occurred_at', { ascending: false });
  if (ownerFilter) productEventsQuery = productEventsQuery.eq('owner_id', ownerFilter);

  let subscriptionsQuery = supabaseAdmin.from('owner_subscriptions').select('*');
  if (ownerFilter) subscriptionsQuery = subscriptionsQuery.eq('owner_id', ownerFilter);

  let unitsQuery = supabaseAdmin.from('units').select('id, owner_id, created_at');
  if (ownerFilter) unitsQuery = unitsQuery.eq('owner_id', ownerFilter);

  let tenantPersonsQuery = supabaseAdmin.from('tenant_persons').select('created_at, units!inner(owner_id)');
  if (ownerFilter) tenantPersonsQuery = tenantPersonsQuery.eq('units.owner_id', ownerFilter);

  let paymentsQuery = supabaseAdmin.from('payments').select('created_at, paid_date, status, units!inner(owner_id)');
  if (ownerFilter) paymentsQuery = paymentsQuery.eq('units.owner_id', ownerFilter);

  let requestLogsQuery = supabaseAdmin
    .from('api_request_logs')
    .select('*')
    .gte('occurred_at', filters.from)
    .lte('occurred_at', filters.to);
  if (ownerFilter) requestLogsQuery = requestLogsQuery.eq('owner_id', ownerFilter);

  const [ownerProfiles, productEvents, subscriptions, units, tenantPersons, payments, requestLogs, webhooks, billingEvents] =
    await Promise.all([
      runAnalyticsQuery<OwnerProfileRecord>(ownerProfilesQuery),
      runAnalyticsQuery<ProductEventRecord>(productEventsQuery),
      runAnalyticsQuery<OwnerSubscriptionRecord>(subscriptionsQuery),
      runAnalyticsQuery<UnitRecord>(unitsQuery),
      runAnalyticsQuery<RelatedOwnerRecord>(tenantPersonsQuery),
      runAnalyticsQuery<RelatedOwnerRecord & { status?: string | null; paid_date?: string | null }>(paymentsQuery),
      runAnalyticsQuery<ApiRequestLogRecord>(requestLogsQuery),
      runAnalyticsQuery<StripeWebhookRecord>(
        supabaseAdmin
          .from('stripe_webhook_events')
          .select('*')
          .gte('last_received_at', filters.from)
          .lte('last_received_at', filters.to)
      ),
      runAnalyticsQuery<StripeBillingEventRecord>(
        supabaseAdmin
          .from('stripe_billing_events')
          .select('*')
          .gte('occurred_at', filters.from)
          .lte('occurred_at', filters.to)
      )
    ]);

  const rangeEvents = productEvents.filter((event) => inRange(event.occurred_at, filters));
  const tenantOwnerCounts = groupCount(tenantPersons, ownerFromRelated);
  const paymentOwnerCounts = groupCount(payments, ownerFromRelated);
  const unitOwnerCounts = groupCount(units, (unit) => unit.owner_id);

  return {
    ownerProfiles,
    productEvents,
    rangeEvents,
    subscriptions,
    units,
    tenantPersons,
    payments,
    requestLogs,
    webhooks,
    billingEvents,
    tenantOwnerCounts,
    paymentOwnerCounts,
    unitOwnerCounts
  };
}

function calculateActivation(ownerProfiles: OwnerProfileRecord[], dataset: Awaited<ReturnType<typeof loadAnalyticsDataset>>) {
  let activatedCount = 0;
  const activationDurations: number[] = [];

  for (const owner of ownerProfiles) {
    const ownerId = normalizeOwnerId(owner.owner_id);
    if (!ownerId) continue;
    const hasUnit = (dataset.unitOwnerCounts.get(ownerId) ?? 0) > 0;
    const hasTenant = (dataset.tenantOwnerCounts.get(ownerId) ?? 0) > 0;
    const hasPayment = (dataset.paymentOwnerCounts.get(ownerId) ?? 0) > 0;
    if (!hasUnit || !hasTenant || !hasPayment) continue;

    activatedCount += 1;
    const createdAt = parseDate(owner.created_at);
    const activatedAt = parseDate(owner.activated_at) ?? parseDate(owner.last_seen_at);
    if (createdAt && activatedAt) {
      activationDurations.push(Math.max(0, activatedAt.getTime() - createdAt.getTime()) / DAY_MS);
    }
  }

  const totalOwners = ownerProfiles.length;
  return {
    activatedOwners: activatedCount,
    activationRate: totalOwners ? Math.round((activatedCount / totalOwners) * 100) : 0,
    averageDaysToActivation: activationDurations.length
      ? Math.round((activationDurations.reduce((sum, value) => sum + value, 0) / activationDurations.length) * 10) / 10
      : null
  };
}

function buildRetention(ownerProfiles: OwnerProfileRecord[], productEvents: ProductEventRecord[], filters: AnalyticsFilters) {
  const cohorts = [7, 30, 90].map((days) => {
    const eligibleOwners = ownerProfiles.filter((owner) => {
      const createdAt = parseDate(owner.created_at);
      return createdAt && createdAt.getTime() + days * DAY_MS <= new Date(filters.to).getTime();
    });
    const retained = eligibleOwners.filter((owner) => {
      const ownerId = normalizeOwnerId(owner.owner_id);
      const createdAt = parseDate(owner.created_at);
      if (!ownerId || !createdAt) return false;
      const target = createdAt.getTime() + days * DAY_MS;
      return productEvents.some((event) => {
        const eventTime = parseDate(event.occurred_at)?.getTime() ?? 0;
        return event.owner_id === ownerId && !PASSIVE_EVENTS.has(String(event.event_name ?? '')) && eventTime >= target;
      });
    }).length;

    return {
      days,
      eligibleOwners: eligibleOwners.length,
      retainedOwners: retained,
      retentionRate: eligibleOwners.length ? Math.round((retained / eligibleOwners.length) * 100) : 0
    };
  });

  return cohorts;
}

export async function getCeoAnalyticsSummary(filters: AnalyticsFilters) {
  const dataset = await loadAnalyticsDataset(filters);
  const ownerProfiles = dataset.ownerProfiles;
  const rangeEvents = dataset.rangeEvents;
  const activeOwnerSet = uniqueOwners(rangeEvents);
  const newOwners = ownerProfiles.filter((owner) => inRange(owner.created_at, filters)).length;
  const activation = calculateActivation(ownerProfiles, dataset);
  const activeSubscriptions = dataset.subscriptions.filter((subscription) =>
    ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.subscription_status ?? ''))
  );
  const mrrCents = activeSubscriptions.reduce((sum, subscription) => sum + subscriptionMonthlyValueCents(subscription), 0);
  const canceledSubscriptions = dataset.subscriptions.filter((subscription) => subscription.subscription_status === 'canceled').length;
  const subscriptionChurnRate = activeSubscriptions.length + canceledSubscriptions
    ? Math.round((canceledSubscriptions / (activeSubscriptions.length + canceledSubscriptions)) * 100)
    : 0;
  const revenueNetCents = dataset.billingEvents.reduce((sum, event) => sum + Number(event.amount_cents ?? 0), 0);
  const webhookFailures = dataset.webhooks.filter((webhook) => webhook.status === 'failed').length;
  const requestDurations = dataset.requestLogs.map((log) => Number(log.duration_ms ?? 0));
  const endpointErrors = [...groupCount(
    dataset.requestLogs.filter((log) => Number(log.status_code ?? 0) >= 500),
    (log) => `${log.method ?? 'GET'} ${log.path ?? '/'}`
  )]
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const eventCounts = [...groupCount(rangeEvents, (event) => event.event_name)]
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count);
  const topFeatures = eventCounts.filter((item) => !PASSIVE_EVENTS.has(item.eventName)).slice(0, 8);
  const deniedCeoAccess = rangeEvents.filter((event) => event.event_name === 'ceo_access_denied').length;
  const suspiciousInvites = eventCounts.find((item) => item.eventName === 'tenant_invite_sent')?.count ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    filters,
    kpis: {
      tenants: {
        totalOwners: ownerProfiles.length,
        newOwners,
        activeOwners: activeOwnerSet.size,
        subscriptionChurnRate,
        netGrowth: newOwners - canceledSubscriptions
      },
      activation,
      usage: {
        dau: uniqueOwners(dataset.productEvents.filter((event) => {
          const eventTime = parseDate(event.occurred_at)?.getTime() ?? 0;
          return eventTime >= new Date(filters.to).getTime() - DAY_MS;
        })).size,
        wau: uniqueOwners(dataset.productEvents.filter((event) => {
          const eventTime = parseDate(event.occurred_at)?.getTime() ?? 0;
          return eventTime >= new Date(filters.to).getTime() - 7 * DAY_MS;
        })).size,
        mau: uniqueOwners(dataset.productEvents.filter((event) => {
          const eventTime = parseDate(event.occurred_at)?.getTime() ?? 0;
          return eventTime >= new Date(filters.to).getTime() - 30 * DAY_MS;
        })).size,
        eventCounts
      },
      retention: buildRetention(ownerProfiles, dataset.productEvents, filters),
      monetization: {
        mrrCents,
        arrCents: mrrCents * 12,
        revenueNetCents,
        refundsCents: Math.abs(dataset.billingEvents
          .filter((event) => String(event.event_type ?? '').includes('refund'))
          .reduce((sum, event) => sum + Number(event.amount_cents ?? 0), 0)),
        feesCents: null,
        arpaCents: activeSubscriptions.length ? Math.round(mrrCents / activeSubscriptions.length) : 0,
        ltvApproxCents: subscriptionChurnRate > 0 ? Math.round((mrrCents / Math.max(activeSubscriptions.length, 1)) / (subscriptionChurnRate / 100)) : null,
        activeSubscriptions: activeSubscriptions.length,
        subscriptionChurnRate
      },
      funnel: [
        { stage: 'visit', owners: eventCounts.find((item) => item.eventName === 'landing_visit')?.count ?? 0 },
        { stage: 'signup', owners: uniqueOwners(rangeEvents.filter((event) => event.event_name === 'signup_completed'), { includePassive: true }).size },
        { stage: 'owner_created', owners: newOwners },
        { stage: 'activated', owners: activation.activatedOwners },
        { stage: 'paid', owners: activeSubscriptions.length }
      ],
      operation: {
        deploy: {
          environment: process.env.NODE_ENV ?? 'development',
          release: process.env.RENDER_GIT_COMMIT ?? process.env.SENTRY_RELEASE ?? null
        },
        requestCount: dataset.requestLogs.length,
        errorCount: dataset.requestLogs.filter((log) => Number(log.status_code ?? 0) >= 500).length,
        latencyP95Ms: percentile(requestDurations, 95),
        latencyP99Ms: percentile(requestDurations, 99),
        endpointErrors,
        webhooks: {
          total: dataset.webhooks.length,
          failed: webhookFailures,
          retries: dataset.webhooks.reduce((sum, webhook) => sum + Math.max(Number(webhook.attempts ?? 1) - 1, 0), 0)
        }
      },
      risk: {
        deniedCeoAccess,
        suspiciousInvites,
        warningEvents: rangeEvents.filter((event) => event.severity === 'warning').length,
        dangerEvents: rangeEvents.filter((event) => event.severity === 'danger').length
      }
    },
    trends: buildDayTrend(filters, ownerProfiles, rangeEvents),
    topFeatures,
    alerts: [
      ...(webhookFailures ? [{ severity: 'danger', title: 'Webhooks Stripe fallando', detail: `${webhookFailures} entregas fallidas en el rango` }] : []),
      ...(deniedCeoAccess ? [{ severity: 'danger', title: 'Intentos de acceso CEO denegados', detail: `${deniedCeoAccess} intentos bloqueados` }] : []),
      ...(endpointErrors.length ? [{ severity: 'warning', title: 'Errores backend', detail: `${endpointErrors[0].endpoint}: ${endpointErrors[0].count}` }] : [])
    ],
    dataDefinitions: getDataDefinitions()
  };
}

export async function listCeoTenants(filters: AnalyticsFilters, pagination: Pagination) {
  const dataset = await loadAnalyticsDataset(filters);
  const eventsByOwner = groupCount(dataset.rangeEvents, (event) => event.owner_id);
  const activeSubscriptions = new Map(dataset.subscriptions.map((subscription) => [subscription.owner_id, subscription]));
  const items = dataset.ownerProfiles
    .map((owner) => {
      const ownerId = normalizeOwnerId(owner.owner_id) ?? 'unknown';
      const subscription = activeSubscriptions.get(ownerId);
      return {
        ownerId,
        createdAt: owner.created_at ?? null,
        lastSeenAt: owner.last_seen_at ?? null,
        activatedAt: owner.activated_at ?? null,
        units: dataset.unitOwnerCounts.get(ownerId) ?? 0,
        tenants: dataset.tenantOwnerCounts.get(ownerId) ?? 0,
        payments: dataset.paymentOwnerCounts.get(ownerId) ?? 0,
        events: eventsByOwner.get(ownerId) ?? 0,
        planId: subscription?.plan_id ?? 'freemium',
        subscriptionStatus: subscription?.subscription_status ?? 'inactive',
        mrrCents: subscription ? subscriptionMonthlyValueCents(subscription) : 0
      };
    })
    .sort((a, b) => b.events - a.events || String(b.lastSeenAt ?? '').localeCompare(String(a.lastSeenAt ?? '')));
  const ownerEmails = await resolveOwnerEmails(items.map((item) => item.ownerId).filter((ownerId) => ownerId !== 'unknown'));
  const itemsWithEmails = items.map((item) => ({
    ...item,
    email: ownerEmails.get(item.ownerId) ?? null
  }));

  const start = (pagination.page - 1) * pagination.pageSize;
  return {
    items: itemsWithEmails.slice(start, start + pagination.pageSize),
    pagination: {
      ...pagination,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pagination.pageSize))
    }
  };
}

export async function listCeoEvents(filters: AnalyticsFilters, pagination: Pagination, severity?: string) {
  let events = (await loadAnalyticsDataset(filters)).rangeEvents;
  if (severity && ['info', 'warning', 'danger'].includes(severity)) {
    events = events.filter((event) => event.severity === severity);
  }
  const start = (pagination.page - 1) * pagination.pageSize;
  return {
    items: events.slice(start, start + pagination.pageSize).map((event) => ({
      id: event.id,
      ownerId: event.owner_id,
      actorType: event.actor_type,
      eventName: event.event_name,
      severity: event.severity,
      occurredAt: event.occurred_at,
      metadata: event.metadata ?? {}
    })),
    pagination: {
      ...pagination,
      total: events.length,
      totalPages: Math.max(1, Math.ceil(events.length / pagination.pageSize))
    }
  };
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function rowsToCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

export async function exportCeoAnalyticsCsv(filters: AnalyticsFilters, section: string) {
  if (section === 'tenants') {
    const tenants = await listCeoTenants(filters, { page: 1, pageSize: 100 });
    return rowsToCsv(
      ['owner_id', 'created_at', 'last_seen_at', 'activated_at', 'events', 'units', 'tenants', 'payments', 'plan_id', 'subscription_status', 'mrr_cents'],
      tenants.items.map((item) => [
        item.ownerId,
        item.createdAt,
        item.lastSeenAt,
        item.activatedAt,
        item.events,
        item.units,
        item.tenants,
        item.payments,
        item.planId,
        item.subscriptionStatus,
        item.mrrCents
      ])
    );
  }

  if (section === 'events') {
    const events = await listCeoEvents(filters, { page: 1, pageSize: 100 });
    return rowsToCsv(
      ['occurred_at', 'owner_id', 'actor_type', 'event_name', 'severity'],
      events.items.map((item) => [item.occurredAt, item.ownerId, item.actorType, item.eventName, item.severity])
    );
  }

  const summary = await getCeoAnalyticsSummary(filters);
  return rowsToCsv(
    ['metric', 'value'],
    [
      ['new_owners', summary.kpis.tenants.newOwners],
      ['active_owners', summary.kpis.tenants.activeOwners],
      ['activation_rate', summary.kpis.activation.activationRate],
      ['mrr_cents', summary.kpis.monetization.mrrCents],
      ['arr_cents', summary.kpis.monetization.arrCents],
      ['webhook_failures', summary.kpis.operation.webhooks.failed],
      ['latency_p95_ms', summary.kpis.operation.latencyP95Ms]
    ]
  );
}

export function getDataDefinitions() {
  return [
    { metric: 'Tenant SaaS', definition: 'Cliente propietario identificado por owner_id; no es el inquilino final.' },
    { metric: 'Activo', definition: 'Owner con eventos de producto no pasivos dentro del rango seleccionado.' },
    { metric: 'Activación', definition: 'Owner con al menos una propiedad, un inquilino y un pago registrados.' },
    { metric: 'DAU/WAU/MAU', definition: 'Owners únicos con eventos de producto no pasivos en 1/7/30 días hasta la fecha final.' },
    { metric: 'MRR/ARR', definition: 'Suscripciones Pro activas mensualizadas con precios configurados en el producto.' },
    { metric: 'Retención 7/30/90', definition: 'Owners creados con actividad no pasiva después de cada ventana.' },
    { metric: 'Webhooks Stripe', definition: 'Entregas persistidas por event.id; duplicados no reejecutan efectos.' },
    { metric: 'Fees Stripe', definition: 'No disponible en v1 salvo que Stripe incluya el dato en eventos persistidos.' }
  ];
}
