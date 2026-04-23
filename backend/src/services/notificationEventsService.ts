import { supabaseAdmin } from '../config/supabaseClient';

export type NotificationEventStatus = 'PENDING' | 'SENT' | 'SKIPPED' | 'FAILED';

export type NotificationEventRecord = {
  id: string;
  payment_id: string | null;
  owner_id: string | null;
  tenant_person_id: string | null;
  notification_type: string;
  recipient: string | null;
  status: NotificationEventStatus;
  sent_at: string | null;
  dedupe_key: string;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationEventReservation = {
  created: boolean;
  event: NotificationEventRecord | null;
};

type NotificationEventInsert = {
  paymentId?: string | null;
  ownerId?: string | null;
  tenantPersonId?: string | null;
  notificationType: string;
  recipient?: string | null;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
};

const TABLE_NAME = 'notification_events';

function isUniqueViolation(error: { code?: string | null; message?: string | null } | null | undefined) {
  const code = String(error?.code ?? '').trim();
  const message = String(error?.message ?? '').toLowerCase();
  return code === '23505' || message.includes('duplicate key');
}

async function getNotificationEventByDedupeKey(dedupeKey: string): Promise<NotificationEventRecord | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select('*')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle();
  if (error) throw error;
  return (data as NotificationEventRecord | null) ?? null;
}

async function updateNotificationEvent(
  eventId: string,
  payload: {
    status: NotificationEventStatus;
    metadata?: Record<string, unknown>;
    errorMessage?: string | null;
    sentAt?: string | null;
  }
) {
  const { error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update({
      status: payload.status,
      metadata: payload.metadata ?? null,
      error_message: payload.errorMessage ?? null,
      sent_at: payload.sentAt ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId);
  if (error) throw error;
}

export async function reserveNotificationEvent(
  input: NotificationEventInsert
): Promise<NotificationEventReservation> {
  const payload = {
    payment_id: input.paymentId ?? null,
    owner_id: input.ownerId ?? null,
    tenant_person_id: input.tenantPersonId ?? null,
    notification_type: input.notificationType,
    recipient: input.recipient ?? null,
    status: 'PENDING' as const,
    dedupe_key: input.dedupeKey,
    metadata: input.metadata ?? null,
    error_message: null,
    sent_at: null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert(payload)
    .select('*')
    .maybeSingle();

  if (error) {
    if (isUniqueViolation(error)) {
      const existing = await getNotificationEventByDedupeKey(input.dedupeKey);
      return {
        created: false,
        event: existing
      };
    }
    throw error;
  }

  return {
    created: true,
    event: (data as NotificationEventRecord | null) ?? null
  };
}

export async function markNotificationEventSent(
  eventId: string,
  metadata?: Record<string, unknown>
) {
  await updateNotificationEvent(eventId, {
    status: 'SENT',
    metadata,
    sentAt: new Date().toISOString(),
    errorMessage: null
  });
}

export async function markNotificationEventSkipped(
  eventId: string,
  reason: string,
  metadata?: Record<string, unknown>
) {
  await updateNotificationEvent(eventId, {
    status: 'SKIPPED',
    metadata: {
      ...(metadata ?? {}),
      reason
    },
    errorMessage: null
  });
}

export async function markNotificationEventFailed(
  eventId: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
) {
  await updateNotificationEvent(eventId, {
    status: 'FAILED',
    metadata,
    errorMessage
  });
}
