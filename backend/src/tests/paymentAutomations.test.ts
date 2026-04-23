import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPaymentAutomationService,
  groupLatePaymentsByOwner,
  PaymentAutomationRecord
} from '../services/paymentAutomationService';

type StoredEvent = {
  id: string;
  payment_id: string | null;
  owner_id: string | null;
  tenant_person_id: string | null;
  notification_type: string;
  recipient: string | null;
  status: 'PENDING' | 'SENT' | 'SKIPPED' | 'FAILED';
  sent_at: string | null;
  dedupe_key: string;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

function createPayment(overrides: Partial<PaymentAutomationRecord> = {}): PaymentAutomationRecord {
  return {
    id: 'payment-1',
    unit_id: 'unit-1',
    tenant_person_id: 'tenant-1',
    amount: 950,
    due_date: '2026-04-23',
    paid_date: '2026-04-24T10:00:00.000Z',
    payment_method: 'BANK',
    status: 'PAID',
    month: 4,
    year: 2026,
    units: {
      id: 'unit-1',
      owner_id: 'owner-1',
      name: 'Piso Centro',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      postal_code: '28001'
    },
    tenant_persons: {
      id: 'tenant-1',
      full_name: 'Ana Pérez',
      email: 'ana@example.com'
    },
    ...overrides
  };
}

function createAutomationHarness(options: {
  ownerEmail?: string | null;
  ownerEligible?: boolean;
  emailSendResult?: 'sent' | 'skipped';
  emailSkipReason?: string;
} = {}) {
  let sequence = 0;
  const events = new Map<string, StoredEvent>();
  const sentEmails: Array<{ to: string | string[]; subject: string; attachments?: unknown[] }> = [];

  const service = createPaymentAutomationService({
    config: {
      enablePaymentAutomations: true,
      paymentReminderDaysBeforeDue: 3,
      latePaymentOwnerReminderEveryDays: 7
    },
    now: () => new Date('2026-04-20T09:00:00.000Z'),
    sendEmail: async (payload) => {
      sentEmails.push({
        to: payload.to,
        subject: payload.subject,
        attachments: payload.attachments
      });

      if (options.emailSendResult === 'skipped') {
        return {
          status: 'skipped' as const,
          provider: 'noop' as const,
          reason: options.emailSkipReason ?? 'provider_not_configured'
        };
      }

      return {
        status: 'sent' as const,
        provider: 'resend' as const,
        messageId: `msg-${sentEmails.length}`
      };
    },
    resolveOwnerEmail: async () => options.ownerEmail ?? 'owner@example.com',
    isOwnerEligibleForAutomations: async () => options.ownerEligible ?? true,
    reserveEvent: async (input) => {
      const existing = events.get(input.dedupeKey);
      if (existing) {
        return {
          created: false,
          event: existing
        };
      }

      const timestamp = new Date('2026-04-20T09:00:00.000Z').toISOString();
      const event: StoredEvent = {
        id: `event-${++sequence}`,
        payment_id: input.paymentId ?? null,
        owner_id: input.ownerId ?? null,
        tenant_person_id: input.tenantPersonId ?? null,
        notification_type: input.notificationType,
        recipient: input.recipient ?? null,
        status: 'PENDING',
        sent_at: null,
        dedupe_key: input.dedupeKey,
        metadata: input.metadata ?? null,
        error_message: null,
        created_at: timestamp,
        updated_at: timestamp
      };
      events.set(input.dedupeKey, event);
      return {
        created: true,
        event
      };
    },
    markEventSent: async (eventId, metadata) => {
      for (const event of events.values()) {
        if (event.id !== eventId) continue;
        event.status = 'SENT';
        event.sent_at = '2026-04-20T09:00:00.000Z';
        event.metadata = metadata ?? null;
      }
    },
    markEventSkipped: async (eventId, reason, metadata) => {
      for (const event of events.values()) {
        if (event.id !== eventId) continue;
        event.status = 'SKIPPED';
        event.metadata = {
          ...(metadata ?? {}),
          reason
        };
      }
    },
    markEventFailed: async (eventId, errorMessage, metadata) => {
      for (const event of events.values()) {
        if (event.id !== eventId) continue;
        event.status = 'FAILED';
        event.error_message = errorMessage;
        event.metadata = metadata ?? null;
      }
    },
    generateReceiptPdf: async () => Buffer.from('fake-pdf'),
    log: {
      error: () => {},
      warn: () => {}
    }
  });

  return {
    service,
    events,
    sentEmails
  };
}

test('upcoming reminders are deduplicated by payment and type', async () => {
  const { service, events, sentEmails } = createAutomationHarness();
  const payment = createPayment({
    status: 'PENDING',
    due_date: '2026-04-23',
    paid_date: null
  });

  await service.sendUpcomingPaymentReminder(payment, '2026-04-20');
  await service.sendUpcomingPaymentReminder(payment, '2026-04-20');

  assert.equal(sentEmails.length, 1);
  assert.equal(events.size, 1);
  assert.equal(events.get('payment:payment-1:due_soon:3')?.status, 'SENT');
});

test('late notices are not sent twice when the same transition is processed twice', async () => {
  const { service, events, sentEmails } = createAutomationHarness();
  const payment = createPayment({
    status: 'LATE',
    due_date: '2026-04-19'
  });

  await service.sendLateTransitionNotifications(payment, '2026-04-20');
  await service.sendLateTransitionNotifications(payment, '2026-04-20');

  assert.equal(sentEmails.length, 2);
  assert.equal(events.get('payment:payment-1:late_tenant')?.status, 'SENT');
  assert.equal(events.get('payment:payment-1:late_owner')?.status, 'SENT');
});

test('automatic receipt notifications register receipt events and include attachments', async () => {
  const { service, events, sentEmails } = createAutomationHarness();
  const payment = createPayment();

  await service.sendAutomaticReceipt(payment);

  assert.equal(sentEmails.length, 2);
  assert.equal(events.get('payment:payment-1:receipt_tenant')?.status, 'SENT');
  assert.equal(events.get('payment:payment-1:receipt_owner')?.status, 'SENT');
  assert.equal(Array.isArray(sentEmails[0]?.attachments), true);
  assert.equal((sentEmails[0]?.attachments ?? []).length, 1);
});

test('weekly late summary groups payments by owner and totals pending amount', () => {
  const groups = groupLatePaymentsByOwner([
    createPayment({ id: 'payment-1', status: 'LATE', amount: 800, units: { id: 'u1', owner_id: 'owner-1', name: 'A' } }),
    createPayment({ id: 'payment-2', status: 'LATE', amount: 200, units: { id: 'u2', owner_id: 'owner-1', name: 'B' } }),
    createPayment({ id: 'payment-3', status: 'LATE', amount: 300, units: { id: 'u3', owner_id: 'owner-2', name: 'C' } })
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.ownerId, 'owner-1');
  assert.equal(groups[0]?.payments.length, 2);
  assert.equal(groups[0]?.totalPending, 1000);
  assert.equal(groups[1]?.ownerId, 'owner-2');
  assert.equal(groups[1]?.totalPending, 300);
});

test('automatic receipts skip tenant delivery safely when tenant email is missing', async () => {
  const { service, events, sentEmails } = createAutomationHarness();
  const payment = createPayment({
    tenant_persons: {
      id: 'tenant-1',
      full_name: 'Ana Pérez',
      email: null
    }
  });

  await service.sendAutomaticReceipt(payment);

  assert.equal(sentEmails.length, 1);
  assert.equal(events.get('payment:payment-1:receipt_tenant')?.status, 'SKIPPED');
  assert.equal(events.get('payment:payment-1:receipt_owner')?.status, 'SENT');
});

test('automations do not send when the owner is not on Pro', async () => {
  const { service, events, sentEmails } = createAutomationHarness({
    ownerEligible: false
  });

  await service.sendUpcomingPaymentReminder(createPayment({
    status: 'PENDING',
    due_date: '2026-04-23',
    paid_date: null
  }), '2026-04-20');

  assert.equal(sentEmails.length, 0);
  assert.equal(events.size, 0);
});
