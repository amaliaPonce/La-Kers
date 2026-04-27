import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabaseClient';

export type ProductEventSeverity = 'info' | 'warning' | 'danger';
export type ProductEventActorType = 'OWNER' | 'TENANT' | 'ADMIN' | 'SYSTEM';

type ProductEventPayload = {
  ownerId?: string | null;
  actorId?: string | null;
  actorType?: ProductEventActorType;
  eventName: string;
  severity?: ProductEventSeverity;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
};

type ApiRequestLogPayload = {
  ownerId?: string | null;
  actorType?: ProductEventActorType | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  occurredAt?: string;
};

const missingAnalyticsTableCodes = new Set(['42P01', '42703']);

function isMissingAnalyticsTable(error: { code?: string | null; message?: string | null } | null | undefined) {
  const message = String(error?.message ?? '').toLowerCase();
  return (
    missingAnalyticsTableCodes.has(String(error?.code ?? '')) ||
    message.includes('owner_profiles') ||
    message.includes('product_events') ||
    message.includes('api_request_logs')
  );
}

function safeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return {};
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !/email|token|secret|password|authorization|identification/i.test(key))
  );
}

export async function ensureOwnerProfile(ownerId?: string | null, options: { activated?: boolean } = {}) {
  const normalizedOwnerId = String(ownerId ?? '').trim();
  if (!normalizedOwnerId) return null;

  const now = new Date().toISOString();
  const existing = await supabaseAdmin
    .from('owner_profiles')
    .select('owner_id')
    .eq('owner_id', normalizedOwnerId)
    .maybeSingle();

  if (existing.error) {
    if (isMissingAnalyticsTable(existing.error)) return null;
    throw existing.error;
  }

  const payload: Record<string, unknown> = existing.data
    ? {
        last_seen_at: now,
        updated_at: now
      }
    : {
        owner_id: normalizedOwnerId,
        created_at: now,
        first_seen_at: now,
        last_seen_at: now,
        updated_at: now
      };

  if (options.activated) {
    payload.activated_at = now;
  }

  const query = existing.data
    ? supabaseAdmin.from('owner_profiles').update(payload).eq('owner_id', normalizedOwnerId)
    : supabaseAdmin.from('owner_profiles').insert(payload);

  const { error } = await query;

  if (error) {
    if (isMissingAnalyticsTable(error)) return null;
    throw error;
  }

  if (!existing.data) {
    await supabaseAdmin
      .from('product_events')
      .insert({
        owner_id: normalizedOwnerId,
        actor_id: normalizedOwnerId,
        actor_type: 'OWNER',
        event_name: 'owner_first_seen',
        severity: 'info',
        metadata: {},
        occurred_at: now
      })
      .then(() => null, () => null);
  }

  return payload;
}

export async function markOwnerActivated(ownerId?: string | null) {
  const normalizedOwnerId = String(ownerId ?? '').trim();
  if (!normalizedOwnerId) return;

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('owner_profiles')
    .update({
      activated_at: now,
      last_seen_at: now,
      updated_at: now
    })
    .eq('owner_id', normalizedOwnerId)
    .is('activated_at', null);

  if (error && !isMissingAnalyticsTable(error)) {
    throw error;
  }
}

export async function recordProductEvent({
  ownerId,
  actorId,
  actorType = 'OWNER',
  eventName,
  severity = 'info',
  metadata,
  occurredAt
}: ProductEventPayload) {
  const normalizedEventName = String(eventName ?? '').trim();
  if (!normalizedEventName) return null;

  const normalizedOwnerId = ownerId ? String(ownerId).trim() : null;
  if (normalizedOwnerId) {
    await ensureOwnerProfile(normalizedOwnerId).catch(() => null);
  }

  const { data, error } = await supabaseAdmin
    .from('product_events')
    .insert({
      owner_id: normalizedOwnerId,
      actor_id: actorId ? String(actorId).trim() : null,
      actor_type: actorType,
      event_name: normalizedEventName,
      severity,
      metadata: safeMetadata(metadata),
      occurred_at: occurredAt ?? new Date().toISOString()
    })
    .select('id')
    .maybeSingle();

  if (error) {
    if (isMissingAnalyticsTable(error)) return null;
    throw error;
  }

  return data;
}

export async function recordApiRequestLog(payload: ApiRequestLogPayload) {
  const { error } = await supabaseAdmin
    .from('api_request_logs')
    .insert({
      owner_id: payload.ownerId ? String(payload.ownerId) : null,
      actor_type: payload.actorType ?? null,
      method: payload.method.slice(0, 12),
      path: payload.path.slice(0, 220),
      status_code: payload.statusCode,
      duration_ms: Math.max(0, Math.round(payload.durationMs)),
      occurred_at: payload.occurredAt ?? new Date().toISOString()
    });

  if (error && !isMissingAnalyticsTable(error)) {
    throw error;
  }
}

export function trackApiRequest(req: AuthenticatedRequest, res: Response, startedAt = Date.now()) {
  res.on('finish', () => {
    const actor = req.authActor;
    const ownerId = actor?.ownerId ?? req.authUser?.id ?? null;
    void recordApiRequestLog({
      ownerId,
      actorType: actor?.actorType ?? null,
      method: req.method,
      path: req.route?.path ? `${req.baseUrl}${String(req.route.path)}` : req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    }).catch(() => undefined);

    if (ownerId && actor?.actorType === 'OWNER') {
      void ensureOwnerProfile(ownerId).catch(() => undefined);
    }
  });
}

export async function maybeMarkOwnerActivated(ownerId: string) {
  const [unitsResponse, tenantsResponse, paymentsResponse] = await Promise.all([
    supabaseAdmin
      .from('units')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', ownerId),
    supabaseAdmin
      .from('tenant_persons')
      .select('id, units!inner(owner_id)', { count: 'exact', head: true })
      .eq('units.owner_id', ownerId),
    supabaseAdmin
      .from('payments')
      .select('id, units!inner(owner_id)', { count: 'exact', head: true })
      .eq('units.owner_id', ownerId)
  ]);

  if (unitsResponse.error || tenantsResponse.error || paymentsResponse.error) return;
  if ((unitsResponse.count ?? 0) > 0 && (tenantsResponse.count ?? 0) > 0 && (paymentsResponse.count ?? 0) > 0) {
    await markOwnerActivated(ownerId).catch(() => undefined);
  }
}
