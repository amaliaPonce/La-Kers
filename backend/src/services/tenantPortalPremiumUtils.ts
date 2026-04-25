import { TenantPaymentRecord } from './paymentsService';

export type TenantPortalPremiumReason = 'disabled_by_env' | 'owner_plan_required' | null;

export type TenantPortalPremiumAvailability = {
  enabled: boolean;
  reason: TenantPortalPremiumReason;
};

export type TenantPortalRenewalNotice = {
  visible: boolean;
  thresholdDays: number;
  daysRemaining: number | null;
  contractEnd: string | null;
  tone: 'info' | 'warning' | 'critical' | null;
};

export type TenantPortalPaymentSummary = {
  pendingCount: number;
  lateCount: number;
  paidCount: number;
  outstandingAmount: number;
  paidAmount: number;
};

export function resolveTenantPortalPremiumAvailability(options: {
  featureFlagEnabled: boolean;
  ownerHasProPlan: boolean;
}): TenantPortalPremiumAvailability {
  if (!options.featureFlagEnabled) {
    return { enabled: false, reason: 'disabled_by_env' };
  }

  if (!options.ownerHasProPlan) {
    return { enabled: false, reason: 'owner_plan_required' };
  }

  return { enabled: true, reason: null };
}

function toDayKey(value: string | Date | null | undefined) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function differenceInDays(fromDateKey: string, toDateKey: string) {
  const fromDate = new Date(`${fromDateKey}T00:00:00.000Z`);
  const toDate = new Date(`${toDateKey}T00:00:00.000Z`);
  return Math.ceil((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
}

export function buildTenantContractRenewalNotice(
  contractEnd: string | null,
  thresholdDays: number,
  now: Date = new Date()
): TenantPortalRenewalNotice {
  const contractEndKey = toDayKey(contractEnd);
  const todayKey = toDayKey(now);

  if (!contractEndKey || !todayKey) {
    return {
      visible: false,
      thresholdDays,
      daysRemaining: null,
      contractEnd: contractEndKey,
      tone: null
    };
  }

  const daysRemaining = differenceInDays(todayKey, contractEndKey);
  const visible = daysRemaining >= 0 && daysRemaining <= thresholdDays;

  return {
    visible,
    thresholdDays,
    daysRemaining,
    contractEnd: contractEndKey,
    tone: visible ? (daysRemaining <= 7 ? 'critical' : daysRemaining <= 14 ? 'warning' : 'info') : null
  };
}

export function groupTenantPaymentsByStatus(payments: TenantPaymentRecord[]) {
  const pending = payments.filter((payment) => payment.status === 'PENDING' || payment.status === 'LATE');
  const history = payments.filter((payment) => payment.status === 'PAID');

  const summary = payments.reduce<TenantPortalPaymentSummary>(
    (accumulator, payment) => {
      const amount = Number(payment.amount ?? 0);
      const normalizedStatus = String(payment.status ?? '').trim().toUpperCase();

      if (normalizedStatus === 'PAID') {
        accumulator.paidCount += 1;
        accumulator.paidAmount += amount;
      }

      if (normalizedStatus === 'PENDING') {
        accumulator.pendingCount += 1;
        accumulator.outstandingAmount += amount;
      }

      if (normalizedStatus === 'LATE') {
        accumulator.lateCount += 1;
        accumulator.outstandingAmount += amount;
      }

      return accumulator;
    },
    {
      pendingCount: 0,
      lateCount: 0,
      paidCount: 0,
      outstandingAmount: 0,
      paidAmount: 0
    }
  );

  return {
    pending,
    history,
    summary
  };
}

export function isTenantIncidentVisible(options: {
  contractStart: string | null;
  contractEnd: string | null;
  incidentCreatedAt: string | null | undefined;
  incidentTenantPersonId?: string | null;
  tenantPersonId: string;
}) {
  const incidentDateKey = toDayKey(options.incidentCreatedAt);
  const contractStartKey = toDayKey(options.contractStart);
  const contractEndKey = toDayKey(options.contractEnd);

  if (!incidentDateKey || !contractStartKey || !contractEndKey) {
    return false;
  }

  if (options.incidentTenantPersonId && options.incidentTenantPersonId !== options.tenantPersonId) {
    return false;
  }

  return incidentDateKey >= contractStartKey && incidentDateKey <= contractEndKey;
}

export function assertTenantPaymentAccess(options: {
  expectedTenantPersonId: string;
  paymentTenantPersonId?: string | null;
  paymentStatus?: string | null;
}) {
  if (!options.paymentTenantPersonId || options.paymentTenantPersonId !== options.expectedTenantPersonId) {
    const error = new Error('Pago no encontrado');
    (error as { status?: number }).status = 404;
    throw error;
  }

  if (String(options.paymentStatus ?? '').trim().toUpperCase() !== 'PAID') {
    const error = new Error('Solo se puede descargar un recibo de pagos abonados');
    (error as { status?: number }).status = 409;
    throw error;
  }
}
