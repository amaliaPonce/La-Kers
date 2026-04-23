import { appConfig, AppConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';
import { isOwnerOnProPlan } from './billingService';
import { emailService, EmailAttachment, EmailPayload, EmailSendResult } from './emailService';
import { getClerkPrimaryEmail } from './clerkUsersService';
import {
  markNotificationEventFailed,
  markNotificationEventSent,
  markNotificationEventSkipped,
  reserveNotificationEvent
} from './notificationEventsService';
import {
  buildPaymentReceiptFilename,
  generatePaymentReceiptPdf,
  PaymentReceiptRecord
} from './paymentReceiptService';

export type PaymentAutomationRecord = PaymentReceiptRecord & {
  units?: {
    id?: string | null;
    owner_id?: string | null;
    name?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
  } | null;
  tenant_persons?: {
    id?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
};

export type PaymentOwnerGroup = {
  ownerId: string;
  payments: PaymentAutomationRecord[];
  totalPending: number;
};

export type LateReminderWindow = {
  daysLate: number;
  windowIndex: number;
  windowStart: string;
  windowEnd: string;
};

type DispatchResult = 'disabled' | 'duplicate' | 'sent' | 'skipped' | 'failed';

type DispatchNotificationParams = {
  payment?: PaymentAutomationRecord | null;
  ownerId?: string | null;
  tenantPersonId?: string | null;
  recipient?: string | null;
  resolveRecipient?: () => Promise<string | null>;
  notificationType: string;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
  missingRecipientReason?: string;
  buildMessage: (recipient: string) => Promise<Omit<EmailPayload, 'to' | 'idempotencyKey'>>;
};

type PaymentAutomationDependencies = {
  config: Pick<
    AppConfig,
    'enablePaymentAutomations' | 'paymentReminderDaysBeforeDue' | 'latePaymentOwnerReminderEveryDays'
  >;
  now: () => Date;
  sendEmail: (payload: EmailPayload) => Promise<EmailSendResult>;
  resolveOwnerEmail: (ownerId: string) => Promise<string | null>;
  isOwnerEligibleForAutomations: (ownerId: string) => Promise<boolean>;
  reserveEvent: typeof reserveNotificationEvent;
  markEventSent: typeof markNotificationEventSent;
  markEventSkipped: typeof markNotificationEventSkipped;
  markEventFailed: typeof markNotificationEventFailed;
  generateReceiptPdf: (payment: PaymentAutomationRecord) => Promise<Buffer>;
  log: Pick<Console, 'error' | 'warn'>;
};

const AUTOMATION_PAYMENT_SELECT = [
  'id',
  'amount',
  'due_date',
  'paid_date',
  'payment_method',
  'status',
  'month',
  'year',
  'unit_id',
  'tenant_person_id',
  'units!inner(id, owner_id, name, address, city, postal_code)',
  'tenant_persons(id, full_name, email)'
].join(', ');

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

function formatDisplayDate(value?: string | null) {
  const normalized = normalizeDateKey(value);
  if (!normalized) return '—';
  const [year, month, day] = normalized.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function formatMonthLabel(month?: number | null, year?: number | null) {
  if (!month || !year) return '—';
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function normalizeDateKey(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string' && DATE_KEY_PATTERN.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0')
  ].join('-');
}

function parseDateKey(dateKey: string) {
  const normalized = normalizeDateKey(dateKey);
  if (!normalized) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const [year, month, day] = normalized.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return normalizeDateKey(date) as string;
}

export function diffDateKeysInDays(startDateKey: string, endDateKey: string) {
  const start = parseDateKey(startDateKey);
  const end = parseDateKey(endDateKey);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export function getWeekStartDateKey(dateKey: string) {
  const date = parseDateKey(dateKey);
  const dayOfWeek = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayOfWeek);
  return normalizeDateKey(date) as string;
}

function paymentLabel(payment: PaymentAutomationRecord) {
  return `${payment.units?.name ?? 'Unidad'} · ${payment.tenant_persons?.full_name ?? 'Inquilino'} · ${formatMonthLabel(payment.month, payment.year)}`;
}

function paymentSummaryLine(payment: PaymentAutomationRecord) {
  return `${paymentLabel(payment)} · ${formatCurrency(payment.amount)} · venció el ${formatDisplayDate(payment.due_date)}`;
}

function getOwnerId(payment: PaymentAutomationRecord) {
  return String(payment.units?.owner_id ?? '').trim();
}

function getTenantEmail(payment: PaymentAutomationRecord) {
  const email = String(payment.tenant_persons?.email ?? '').trim().toLowerCase();
  return email || null;
}

function getTenantPersonId(payment: PaymentAutomationRecord) {
  const tenantPersonId = String(payment.tenant_persons?.id ?? payment.tenant_person_id ?? '').trim();
  return tenantPersonId || null;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return String(error ?? 'Unknown error');
}

export function calculateLateReminderWindow(
  dueDate: string,
  asOfDate: string,
  intervalDays: number
): LateReminderWindow | null {
  const normalizedDueDate = normalizeDateKey(dueDate);
  const normalizedAsOfDate = normalizeDateKey(asOfDate);
  if (!normalizedDueDate || !normalizedAsOfDate) return null;

  const daysLate = diffDateKeysInDays(normalizedDueDate, normalizedAsOfDate);
  if (daysLate < intervalDays) return null;

  const windowIndex = Math.floor((daysLate - intervalDays) / intervalDays);
  const windowStart = addDaysToDateKey(normalizedDueDate, intervalDays + windowIndex * intervalDays);
  return {
    daysLate,
    windowIndex,
    windowStart,
    windowEnd: addDaysToDateKey(windowStart, intervalDays - 1)
  };
}

export function groupLatePaymentsByOwner(payments: PaymentAutomationRecord[]): PaymentOwnerGroup[] {
  const groups = new Map<string, PaymentOwnerGroup>();

  for (const payment of payments) {
    const ownerId = getOwnerId(payment);
    if (!ownerId) continue;

    const existing = groups.get(ownerId);
    if (existing) {
      existing.payments.push(payment);
      existing.totalPending += Number(payment.amount ?? 0);
      continue;
    }

    groups.set(ownerId, {
      ownerId,
      payments: [payment],
      totalPending: Number(payment.amount ?? 0)
    });
  }

  return [...groups.values()].sort((left, right) => left.ownerId.localeCompare(right.ownerId));
}

function buildTenantReminderMessage(payment: PaymentAutomationRecord, daysBeforeDue: number) {
  const subject = `Recordatorio de pago: vence en ${daysBeforeDue} día${daysBeforeDue === 1 ? '' : 's'}`;
  const summary = paymentSummaryLine(payment);
  return {
    subject,
    text: [
      'Hola,',
      '',
      `Te recordamos que tu pago sigue pendiente y vence el ${formatDisplayDate(payment.due_date)}.`,
      summary,
      '',
      'Si ya has abonado el importe, puedes ignorar este correo.'
    ].join('\n'),
    html: [
      '<p>Hola,</p>',
      `<p>Te recordamos que tu pago sigue pendiente y vence el <strong>${escapeHtml(formatDisplayDate(payment.due_date))}</strong>.</p>`,
      `<p>${escapeHtml(summary)}</p>`,
      '<p>Si ya has abonado el importe, puedes ignorar este correo.</p>'
    ].join('')
  };
}

function buildTenantLateMessage(payment: PaymentAutomationRecord) {
  const subject = 'Tu pago figura como impagado';
  const summary = paymentSummaryLine(payment);
  return {
    subject,
    text: [
      'Hola,',
      '',
      'Tu pago ha pasado a estado atrasado.',
      summary,
      '',
      'Por favor, regularízalo lo antes posible o contacta con el propietario si necesitas aclararlo.'
    ].join('\n'),
    html: [
      '<p>Hola,</p>',
      '<p>Tu pago ha pasado a estado <strong>atrasado</strong>.</p>',
      `<p>${escapeHtml(summary)}</p>`,
      '<p>Por favor, regularízalo lo antes posible o contacta con el propietario si necesitas aclararlo.</p>'
    ].join('')
  };
}

function buildOwnerLateMessage(payment: PaymentAutomationRecord, recurring = false) {
  const subject = recurring ? 'Recordatorio: cobro sigue impagado' : 'Aviso: pago marcado como atrasado';
  const summary = paymentSummaryLine(payment);
  return {
    subject,
    text: [
      'Hola,',
      '',
      recurring
        ? 'Este cobro sigue en estado atrasado.'
        : 'Se ha marcado un pago como atrasado.',
      summary
    ].join('\n'),
    html: [
      '<p>Hola,</p>',
      `<p>${escapeHtml(recurring ? 'Este cobro sigue en estado atrasado.' : 'Se ha marcado un pago como atrasado.')}</p>`,
      `<p>${escapeHtml(summary)}</p>`
    ].join('')
  };
}

function buildReceiptMessage(payment: PaymentAutomationRecord, recipientKind: 'tenant' | 'owner') {
  const subject = 'Recibo de pago disponible';
  const monthLabel = formatMonthLabel(payment.month, payment.year);
  const recipientIntro =
    recipientKind === 'tenant'
      ? 'Adjuntamos el recibo de tu pago registrado.'
      : 'Adjuntamos el recibo del pago registrado.';
  return {
    subject,
    text: [
      'Hola,',
      '',
      recipientIntro,
      `${payment.units?.name ?? 'Unidad'} · ${monthLabel} · ${formatCurrency(payment.amount)}`,
      `Fecha de pago: ${formatDisplayDate(payment.paid_date)}`
    ].join('\n'),
    html: [
      '<p>Hola,</p>',
      `<p>${escapeHtml(recipientIntro)}</p>`,
      `<p>${escapeHtml(`${payment.units?.name ?? 'Unidad'} · ${monthLabel} · ${formatCurrency(payment.amount)}`)}</p>`,
      `<p>Fecha de pago: <strong>${escapeHtml(formatDisplayDate(payment.paid_date))}</strong></p>`
    ].join('')
  };
}

function buildWeeklySummaryMessage(ownerGroup: PaymentOwnerGroup, weekStartDateKey: string) {
  const lines = ownerGroup.payments
    .slice()
    .sort((left, right) => String(left.due_date ?? '').localeCompare(String(right.due_date ?? '')))
    .map((payment) => `- ${paymentSummaryLine(payment)}`);

  const htmlLines = ownerGroup.payments
    .slice()
    .sort((left, right) => String(left.due_date ?? '').localeCompare(String(right.due_date ?? '')))
    .map((payment) => `<li>${escapeHtml(paymentSummaryLine(payment))}</li>`)
    .join('');

  return {
    subject: `Resumen semanal de morosidad · ${ownerGroup.payments.length} pago${ownerGroup.payments.length === 1 ? '' : 's'} atrasado${ownerGroup.payments.length === 1 ? '' : 's'}`,
    text: [
      'Hola,',
      '',
      `Semana de referencia: ${formatDisplayDate(weekStartDateKey)}`,
      `Pagos atrasados abiertos: ${ownerGroup.payments.length}`,
      `Total pendiente: ${formatCurrency(ownerGroup.totalPending)}`,
      '',
      ...lines
    ].join('\n'),
    html: [
      '<p>Hola,</p>',
      `<p>Semana de referencia: <strong>${escapeHtml(formatDisplayDate(weekStartDateKey))}</strong></p>`,
      `<p>Pagos atrasados abiertos: <strong>${ownerGroup.payments.length}</strong><br/>Total pendiente: <strong>${escapeHtml(formatCurrency(ownerGroup.totalPending))}</strong></p>`,
      `<ul>${htmlLines}</ul>`
    ].join('')
  };
}

export function createPaymentAutomationService(
  overrides: Partial<PaymentAutomationDependencies> = {}
) {
  const overrideConfig: Partial<PaymentAutomationDependencies['config']> = overrides.config ?? {};
  const dependencies: PaymentAutomationDependencies = {
    config: {
      enablePaymentAutomations:
        overrideConfig.enablePaymentAutomations ?? appConfig.enablePaymentAutomations,
      paymentReminderDaysBeforeDue:
        overrideConfig.paymentReminderDaysBeforeDue ?? appConfig.paymentReminderDaysBeforeDue,
      latePaymentOwnerReminderEveryDays:
        overrideConfig.latePaymentOwnerReminderEveryDays ?? appConfig.latePaymentOwnerReminderEveryDays
    },
    now: () => new Date(),
    sendEmail: (payload) => emailService.sendEmail(payload),
    resolveOwnerEmail: getClerkPrimaryEmail,
    isOwnerEligibleForAutomations: isOwnerOnProPlan,
    reserveEvent: reserveNotificationEvent,
    markEventSent: markNotificationEventSent,
    markEventSkipped: markNotificationEventSkipped,
    markEventFailed: markNotificationEventFailed,
    generateReceiptPdf: (payment) => generatePaymentReceiptPdf(payment),
    log: console,
    ...overrides
  };

  dependencies.config = {
    enablePaymentAutomations:
      overrideConfig.enablePaymentAutomations ?? dependencies.config.enablePaymentAutomations,
    paymentReminderDaysBeforeDue:
      overrideConfig.paymentReminderDaysBeforeDue ?? dependencies.config.paymentReminderDaysBeforeDue,
    latePaymentOwnerReminderEveryDays:
      overrideConfig.latePaymentOwnerReminderEveryDays ?? dependencies.config.latePaymentOwnerReminderEveryDays
  };

  const dispatchNotification = async (params: DispatchNotificationParams): Promise<DispatchResult> => {
    if (!dependencies.config.enablePaymentAutomations) {
      return 'disabled';
    }

    const ownerId = String(params.ownerId ?? (params.payment ? getOwnerId(params.payment) : '')).trim();
    if (!ownerId) {
      return 'skipped';
    }

    const ownerEligible = await dependencies.isOwnerEligibleForAutomations(ownerId);
    if (!ownerEligible) {
      return 'skipped';
    }

    let recipient = params.recipient ?? null;
    let recipientResolutionError: unknown = null;

    if (params.resolveRecipient) {
      try {
        recipient = await params.resolveRecipient();
      } catch (error) {
        recipientResolutionError = error;
      }
    }

    const reservation = await dependencies.reserveEvent({
      paymentId: params.payment?.id ?? null,
      ownerId,
      tenantPersonId: params.tenantPersonId ?? null,
      notificationType: params.notificationType,
      recipient,
      dedupeKey: params.dedupeKey,
      metadata: params.metadata
    });

    if (!reservation.created || !reservation.event) {
      return 'duplicate';
    }

    if (recipientResolutionError) {
      await dependencies.markEventFailed(
        reservation.event.id,
        toErrorMessage(recipientResolutionError),
        {
          ...(params.metadata ?? {}),
          stage: 'recipient_resolution'
        }
      );
      return 'failed';
    }

    if (!recipient) {
      await dependencies.markEventSkipped(
        reservation.event.id,
        params.missingRecipientReason ?? 'missing_recipient',
        params.metadata
      );
      return 'skipped';
    }

    try {
      const message = await params.buildMessage(recipient);
      const sendResult = await dependencies.sendEmail({
        ...message,
        to: recipient,
        idempotencyKey: params.dedupeKey
      });

      if (sendResult.status === 'skipped') {
        await dependencies.markEventSkipped(reservation.event.id, sendResult.reason, {
          ...(params.metadata ?? {}),
          provider: sendResult.provider
        });
        return 'skipped';
      }

      await dependencies.markEventSent(reservation.event.id, {
        ...(params.metadata ?? {}),
        provider: sendResult.provider,
        externalMessageId: sendResult.messageId
      });
      return 'sent';
    } catch (error) {
      await dependencies.markEventFailed(reservation.event.id, toErrorMessage(error), params.metadata);
      return 'failed';
    }
  };

  const runSafely = async (label: string, task: () => Promise<DispatchResult>) => {
    try {
      return await task();
    } catch (error) {
      dependencies.log.error(`[paymentAutomations][${label}]`, error);
      return 'failed' as const;
    }
  };

  return {
    async sendUpcomingPaymentReminder(payment: PaymentAutomationRecord, asOfDateKey?: string) {
      const ownerId = getOwnerId(payment);
      const tenantPersonId = getTenantPersonId(payment);
      const daysBeforeDue = dependencies.config.paymentReminderDaysBeforeDue;
      const normalizedAsOfDateKey = normalizeDateKey(asOfDateKey ?? dependencies.now()) ?? '';

      return runSafely('upcoming_payment_reminder', () =>
        dispatchNotification({
          payment,
          ownerId,
          tenantPersonId,
          recipient: getTenantEmail(payment),
          notificationType: 'PAYMENT_REMINDER_TENANT',
          dedupeKey: `payment:${payment.id}:due_soon:${daysBeforeDue}`,
          metadata: {
            asOfDate: normalizedAsOfDateKey,
            daysBeforeDue,
            dueDate: normalizeDateKey(payment.due_date)
          },
          missingRecipientReason: 'missing_tenant_email',
          buildMessage: async () => buildTenantReminderMessage(payment, daysBeforeDue)
        })
      );
    },

    async sendLateTransitionNotifications(payment: PaymentAutomationRecord, asOfDateKey?: string) {
      const ownerId = getOwnerId(payment);
      const tenantPersonId = getTenantPersonId(payment);
      const metadata = {
        asOfDate: normalizeDateKey(asOfDateKey ?? dependencies.now()),
        dueDate: normalizeDateKey(payment.due_date)
      };

      const results = await Promise.all([
        runSafely('late_transition_tenant', () =>
          dispatchNotification({
            payment,
            ownerId,
            tenantPersonId,
            recipient: getTenantEmail(payment),
            notificationType: 'PAYMENT_LATE_TENANT',
            dedupeKey: `payment:${payment.id}:late_tenant`,
            metadata,
            missingRecipientReason: 'missing_tenant_email',
            buildMessage: async () => buildTenantLateMessage(payment)
          })
        ),
        runSafely('late_transition_owner', () =>
          dispatchNotification({
            payment,
            ownerId,
            tenantPersonId,
            resolveRecipient: async () => ownerId ? dependencies.resolveOwnerEmail(ownerId) : null,
            notificationType: 'PAYMENT_LATE_OWNER',
            dedupeKey: `payment:${payment.id}:late_owner`,
            metadata,
            missingRecipientReason: 'missing_owner_email',
            buildMessage: async () => buildOwnerLateMessage(payment, false)
          })
        )
      ]);

      return results;
    },

    async sendAutomaticReceipt(payment: PaymentAutomationRecord) {
      const ownerId = getOwnerId(payment);
      const tenantPersonId = getTenantPersonId(payment);
      let receiptBufferPromise: Promise<Buffer> | null = null;

      const getReceiptAttachment = async (): Promise<EmailAttachment[]> => {
        if (!receiptBufferPromise) {
          receiptBufferPromise = dependencies.generateReceiptPdf(payment);
        }

        return [
          {
            filename: buildPaymentReceiptFilename(payment.id),
            content: await receiptBufferPromise,
            contentType: 'application/pdf'
          }
        ];
      };

      const sharedMetadata = {
        paidDate: normalizeDateKey(payment.paid_date),
        dueDate: normalizeDateKey(payment.due_date)
      };

      const results = await Promise.all([
        runSafely('receipt_tenant', () =>
          dispatchNotification({
            payment,
            ownerId,
            tenantPersonId,
            recipient: getTenantEmail(payment),
            notificationType: 'PAYMENT_RECEIPT_TENANT',
            dedupeKey: `payment:${payment.id}:receipt_tenant`,
            metadata: sharedMetadata,
            missingRecipientReason: 'missing_tenant_email',
            buildMessage: async () => ({
              ...buildReceiptMessage(payment, 'tenant'),
              attachments: await getReceiptAttachment()
            })
          })
        ),
        runSafely('receipt_owner', () =>
          dispatchNotification({
            payment,
            ownerId,
            tenantPersonId,
            resolveRecipient: async () => ownerId ? dependencies.resolveOwnerEmail(ownerId) : null,
            notificationType: 'PAYMENT_RECEIPT_OWNER',
            dedupeKey: `payment:${payment.id}:receipt_owner`,
            metadata: sharedMetadata,
            missingRecipientReason: 'missing_owner_email',
            buildMessage: async () => ({
              ...buildReceiptMessage(payment, 'owner'),
              attachments: await getReceiptAttachment()
            })
          })
        )
      ]);

      return results;
    },

    async sendRecurringOwnerLateReminder(payment: PaymentAutomationRecord, asOfDateKey?: string) {
      const ownerId = getOwnerId(payment);
      const tenantPersonId = getTenantPersonId(payment);
      const normalizedAsOfDate = normalizeDateKey(asOfDateKey ?? dependencies.now());
      const normalizedDueDate = normalizeDateKey(payment.due_date);
      if (!ownerId || !normalizedAsOfDate || !normalizedDueDate) {
        return 'skipped' as const;
      }

      const window = calculateLateReminderWindow(
        normalizedDueDate,
        normalizedAsOfDate,
        dependencies.config.latePaymentOwnerReminderEveryDays
      );
      if (!window) {
        return 'skipped' as const;
      }

      return runSafely('late_owner_recurring', () =>
        dispatchNotification({
          payment,
          ownerId,
          tenantPersonId,
          resolveRecipient: async () => dependencies.resolveOwnerEmail(ownerId),
          notificationType: 'PAYMENT_LATE_OWNER_REMINDER',
          dedupeKey: `payment:${payment.id}:late_owner_reminder:${window.windowStart}`,
          metadata: {
            asOfDate: normalizedAsOfDate,
            dueDate: normalizedDueDate,
            daysLate: window.daysLate,
            windowStart: window.windowStart,
            windowEnd: window.windowEnd
          },
          missingRecipientReason: 'missing_owner_email',
          buildMessage: async () => buildOwnerLateMessage(payment, true)
        })
      );
    },

    async sendWeeklyOwnerLateSummary(ownerGroup: PaymentOwnerGroup, asOfDateKey?: string) {
      const normalizedAsOfDate = normalizeDateKey(asOfDateKey ?? dependencies.now());
      if (!ownerGroup.ownerId || !normalizedAsOfDate) {
        return 'skipped' as const;
      }

      const weekStartDateKey = getWeekStartDateKey(normalizedAsOfDate);
      return runSafely('weekly_late_summary', () =>
        dispatchNotification({
          ownerId: ownerGroup.ownerId,
          recipient: null,
          resolveRecipient: async () => dependencies.resolveOwnerEmail(ownerGroup.ownerId),
          notificationType: 'OWNER_WEEKLY_LATE_SUMMARY',
          dedupeKey: `owner:${ownerGroup.ownerId}:weekly_late_summary:${weekStartDateKey}`,
          metadata: {
            asOfDate: normalizedAsOfDate,
            weekStart: weekStartDateKey,
            latePaymentsCount: ownerGroup.payments.length,
            totalPending: ownerGroup.totalPending
          },
          missingRecipientReason: 'missing_owner_email',
          buildMessage: async () => buildWeeklySummaryMessage(ownerGroup, weekStartDateKey)
        })
      );
    }
  };
}

export const paymentAutomationService = createPaymentAutomationService();

async function listAutomationPayments(queryBuilder: PromiseLike<{ data: unknown; error: unknown }>) {
  const { data, error } = await queryBuilder;
  if (error) throw error;
  return (data as PaymentAutomationRecord[] | null) ?? [];
}

export async function listPaymentsDueForReminder(asOfDateKey: string) {
  const targetDueDate = addDaysToDateKey(
    asOfDateKey,
    appConfig.paymentReminderDaysBeforeDue
  );

  return listAutomationPayments(
    supabaseAdmin
      .from('payments')
      .select(AUTOMATION_PAYMENT_SELECT)
      .eq('status', 'PENDING')
      .eq('due_date', targetDueDate)
  );
}

export async function listOpenLatePayments() {
  return listAutomationPayments(
    supabaseAdmin
      .from('payments')
      .select(AUTOMATION_PAYMENT_SELECT)
      .eq('status', 'LATE')
  );
}

export async function runUpcomingPaymentReminderSweep(asOfDateKey = normalizeDateKey(new Date()) as string) {
  if (!appConfig.enablePaymentAutomations) return;
  const payments = await listPaymentsDueForReminder(asOfDateKey);
  for (const payment of payments) {
    await paymentAutomationService.sendUpcomingPaymentReminder(payment, asOfDateKey);
  }
}

export async function runLatePaymentTransitionAutomation(
  payments: PaymentAutomationRecord[],
  asOfDateKey = normalizeDateKey(new Date()) as string
) {
  if (!appConfig.enablePaymentAutomations || !payments.length) return;
  for (const payment of payments) {
    await paymentAutomationService.sendLateTransitionNotifications(payment, asOfDateKey);
  }
}

export async function runRecurringLateOwnerReminderSweep(asOfDateKey = normalizeDateKey(new Date()) as string) {
  if (!appConfig.enablePaymentAutomations) return;
  const latePayments = await listOpenLatePayments();
  for (const payment of latePayments) {
    await paymentAutomationService.sendRecurringOwnerLateReminder(payment, asOfDateKey);
  }
}

export async function runWeeklyLateSummarySweep(asOfDateKey = normalizeDateKey(new Date()) as string) {
  if (!appConfig.enablePaymentAutomations) return;
  const latePayments = await listOpenLatePayments();
  const ownerGroups = groupLatePaymentsByOwner(latePayments);
  for (const ownerGroup of ownerGroups) {
    await paymentAutomationService.sendWeeklyOwnerLateSummary(ownerGroup, asOfDateKey);
  }
}
