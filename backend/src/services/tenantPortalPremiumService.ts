import { appConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';
import { resolveContractLandlordProfile } from '../utils/contractLandlordProfile';
import { hasOwnerProPlan } from './billingService';
import { generatePaymentReceiptPdf, generateRentalContractPdf } from './documentPdfService';
import { createIncident } from './incidentsService';
import {
  ensurePendingPaymentsForTenant,
  listTenantPaymentsByOwner,
  markPendingPaymentsAsLateForTenant,
  TenantPaymentRecord
} from './paymentsService';
import {
  assertTenantPaymentAccess,
  buildTenantContractRenewalNotice,
  groupTenantPaymentsByStatus,
  isTenantIncidentVisible,
  resolveTenantPortalPremiumAvailability
} from './tenantPortalPremiumUtils';
import {
  getTenantPortalContext,
  TenantPortalContext,
  TenantPortalProfile
} from './tenantPortalService';
import { getTenantContractProfilePdfFields } from './tenantContractProfilesService';

type TenantPortalPaymentItem = {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'LATE';
  dueDate: string | null;
  paidDate: string | null;
  paymentMethod: 'CASH' | 'BANK' | null;
  month: number | null;
  year: number | null;
  unitName: string | null;
  receiptDownloadUrl: string | null;
};

type TenantPortalIncidentItem = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string | null;
  updatedAt: string | null;
  statusUpdatedAt: string | null;
  closedAt: string | null;
  reportedBy: 'OWNER' | 'TENANT' | 'SYSTEM';
  unitName: string | null;
  cost: number | null;
};

export type TenantPortalOverview = TenantPortalProfile & {
  premium: {
    enabled: boolean;
    reason: 'disabled_by_env' | 'owner_plan_required' | null;
    renewalNotice: ReturnType<typeof buildTenantContractRenewalNotice> | null;
    payments: {
      pending: TenantPortalPaymentItem[];
      history: TenantPortalPaymentItem[];
      summary: {
        pendingCount: number;
        lateCount: number;
        paidCount: number;
        outstandingAmount: number;
        paidAmount: number;
      };
    } | null;
    documents: {
      contract: {
        available: boolean;
        downloadUrl: string | null;
      };
      receipts: Array<{
        id: string;
        paymentId: string;
        title: string;
        paidDate: string | null;
        amount: number;
        downloadUrl: string;
      }>;
    } | null;
    incidents: {
      items: TenantPortalIncidentItem[];
      openCount: number;
      closedCount: number;
      canCreate: boolean;
    } | null;
  };
};

const tenantPortalPremiumMigrationHint = 'Falta aplicar sql/20260423_tenant_portal_premium.sql';

function isMissingPremiumMigration(error: { code?: string | null; message?: string | null } | null | undefined) {
  const code = String(error?.code ?? '').trim();
  const message = String(error?.message ?? '').toLowerCase();
  return code === '42703' || code === '42P01' || message.includes('status_updated_at') || message.includes('reported_by');
}

function mapTenantPayment(payment: TenantPaymentRecord): TenantPortalPaymentItem {
  const status = String(payment.status ?? '').trim().toUpperCase();

  return {
    id: String(payment.id),
    amount: Number(payment.amount ?? 0),
    status: (status === 'PAID' || status === 'LATE' ? status : 'PENDING') as 'PENDING' | 'PAID' | 'LATE',
    dueDate: payment.due_date ? String(payment.due_date) : null,
    paidDate: payment.paid_date ? String(payment.paid_date) : null,
    paymentMethod: payment.payment_method ?? null,
    month: payment.month ?? null,
    year: payment.year ?? null,
    unitName: payment.units?.name ? String(payment.units.name) : null,
    receiptDownloadUrl: status === 'PAID' ? `/documents/receipt/${payment.id}` : null
  };
}

function mapTenantIncident(incident: any): TenantPortalIncidentItem {
  const status = String(incident.status ?? '').trim().toUpperCase();
  const reportedBy = String(incident.reported_by ?? 'OWNER').trim().toUpperCase();

  return {
    id: String(incident.id ?? ''),
    title: String(incident.title ?? 'Incidencia'),
    description: String(incident.description ?? ''),
    status: (status === 'IN_PROGRESS' || status === 'CLOSED' ? status : 'OPEN') as 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
    createdAt: incident.created_at ? String(incident.created_at) : null,
    updatedAt: incident.updated_at ? String(incident.updated_at) : null,
    statusUpdatedAt: incident.status_updated_at ? String(incident.status_updated_at) : null,
    closedAt: incident.closed_at ? String(incident.closed_at) : null,
    reportedBy: (reportedBy === 'TENANT' || reportedBy === 'SYSTEM' ? reportedBy : 'OWNER') as 'OWNER' | 'TENANT' | 'SYSTEM',
    unitName: incident.units?.name ? String(incident.units.name) : null,
    cost: incident.cost === undefined || incident.cost === null ? null : Number(incident.cost)
  };
}

function buildPremiumDisabledOverview(profile: TenantPortalProfile, reason: 'disabled_by_env' | 'owner_plan_required'): TenantPortalOverview {
  return {
    ...profile,
    premium: {
      enabled: false,
      reason,
      renewalNotice: null,
      payments: null,
      documents: null,
      incidents: null
    }
  };
}

async function assertTenantPremiumEnabled(context: TenantPortalContext) {
  const availability = resolveTenantPortalPremiumAvailability({
    featureFlagEnabled: appConfig.enableTenantPortalPremium,
    ownerHasProPlan: await hasOwnerProPlan(context.access.owner_id)
  });

  if (availability.enabled) {
    return availability;
  }

  const error = new Error(
    availability.reason === 'disabled_by_env'
      ? 'El portal premium del inquilino está desactivado en este entorno'
      : 'La funcionalidad premium del portal del inquilino requiere plan Pro'
  );
  (error as { status?: number }).status = 404;
  throw error;
}

async function listTenantVisibleIncidents(context: TenantPortalContext) {
  if (!context.unitRecord?.id) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('incidents')
    .select('*, units!inner(owner_id, name)')
    .eq('unit_id', context.unitRecord.id)
    .eq('units.owner_id', context.access.owner_id)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingPremiumMigration(error)) {
      const migrationError = new Error(tenantPortalPremiumMigrationHint);
      (migrationError as { status?: number }).status = 503;
      throw migrationError;
    }
    throw error;
  }

  return (data ?? []).filter((incident) =>
    isTenantIncidentVisible({
      contractStart: context.profile.tenant.contractStart,
      contractEnd: context.profile.tenant.contractEnd,
      incidentCreatedAt: incident.created_at ? String(incident.created_at) : null,
      incidentTenantPersonId: incident.tenant_person_id ? String(incident.tenant_person_id) : null,
      tenantPersonId: context.profile.tenant.id
    })
  );
}

export async function getTenantPortalOverview(clerkUserId: string): Promise<TenantPortalOverview> {
  const context = await getTenantPortalContext(clerkUserId);
  const ownerHasProPlan = await hasOwnerProPlan(context.access.owner_id);
  const availability = resolveTenantPortalPremiumAvailability({
    featureFlagEnabled: appConfig.enableTenantPortalPremium,
    ownerHasProPlan
  });

  if (!availability.enabled) {
    return buildPremiumDisabledOverview(context.profile, availability.reason as 'disabled_by_env' | 'owner_plan_required');
  }

  const untilDate = new Date().toISOString().slice(0, 10);
  await ensurePendingPaymentsForTenant(context.access.owner_id, {
    id: context.profile.tenant.id,
    unit_id: context.unitRecord?.id ?? null,
    contract_start: context.profile.tenant.contractStart,
    contract_end: context.profile.tenant.contractEnd,
    units: context.unitRecord
      ? {
          id: context.unitRecord.id ?? null,
          monthly_rent: context.unitRecord.monthly_rent ?? null
        }
      : null
  }, { untilDate });
  await markPendingPaymentsAsLateForTenant(
    context.profile.tenant.id,
    untilDate,
    context.access.owner_id
  );

  const [payments, incidents] = await Promise.all([
    listTenantPaymentsByOwner(context.profile.tenant.id, context.access.owner_id),
    listTenantVisibleIncidents(context)
  ]);

  const groupedPayments = groupTenantPaymentsByStatus(payments);
  const pendingPayments = groupedPayments.pending.map(mapTenantPayment);
  const paymentHistory = groupedPayments.history.map(mapTenantPayment);
  const incidentItems = incidents.map(mapTenantIncident);
  const renewalNotice = buildTenantContractRenewalNotice(
    context.profile.tenant.contractEnd,
    appConfig.tenantContractRenewalNoticeDays
  );

  return {
    ...context.profile,
    premium: {
      enabled: true,
      reason: null,
      renewalNotice,
      payments: {
        pending: pendingPayments,
        history: paymentHistory,
        summary: groupedPayments.summary
      },
      documents: {
        contract: {
          available: Boolean(context.tenantRecord && context.unitRecord),
          downloadUrl: context.tenantRecord && context.unitRecord ? '/documents/contract' : null
        },
        receipts: paymentHistory.map((payment) => ({
          id: payment.id,
          paymentId: payment.id,
          title: `Recibo ${payment.month ?? '—'}/${payment.year ?? '—'}`,
          paidDate: payment.paidDate,
          amount: payment.amount,
          downloadUrl: `/documents/receipt/${payment.id}`
        }))
      },
      incidents: {
        items: incidentItems,
        openCount: incidentItems.filter((incident) => incident.status !== 'CLOSED').length,
        closedCount: incidentItems.filter((incident) => incident.status === 'CLOSED').length,
        canCreate: Boolean(context.unitRecord?.id)
      }
    }
  };
}

export async function createTenantPortalIncident(
  clerkUserId: string,
  payload: {
    title: string;
    description: string;
  }
) {
  const context = await getTenantPortalContext(clerkUserId);
  await assertTenantPremiumEnabled(context);

  if (!context.unitRecord?.id) {
    const error = new Error('No se encontró una unidad activa para este inquilino');
    (error as { status?: number }).status = 409;
    throw error;
  }

  const incident = await createIncident(context.access.owner_id, {
    unit_id: String(context.unitRecord.id),
    title: payload.title,
    description: payload.description,
    status: 'OPEN',
    tenant_person_id: context.profile.tenant.id,
    reported_by: 'TENANT'
  });

  return mapTenantIncident({
    ...incident,
    units: {
      name: context.unitRecord.name ?? null
    }
  });
}

export async function getTenantPortalReceiptPdf(clerkUserId: string, paymentId: string) {
  const context = await getTenantPortalContext(clerkUserId);
  await assertTenantPremiumEnabled(context);

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, units!inner(owner_id, name), tenant_persons(id, full_name)')
    .eq('id', paymentId)
    .eq('tenant_person_id', context.profile.tenant.id)
    .eq('units.owner_id', context.access.owner_id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const notFound = new Error('Pago no encontrado');
    (notFound as { status?: number }).status = 404;
    throw notFound;
  }

  assertTenantPaymentAccess({
    expectedTenantPersonId: context.profile.tenant.id,
    paymentTenantPersonId: data.tenant_person_id ? String(data.tenant_person_id) : null,
    paymentStatus: data.status ? String(data.status) : null
  });

  return {
    fileName: `tenant-receipt-${paymentId}.pdf`,
    buffer: await generatePaymentReceiptPdf(data)
  };
}

export async function getTenantPortalContractPdf(clerkUserId: string) {
  const context = await getTenantPortalContext(clerkUserId);
  await assertTenantPremiumEnabled(context);

  if (!context.tenantRecord || !context.unitRecord) {
    const error = new Error('No hay contrato disponible para este inquilino');
    (error as { status?: number }).status = 404;
    throw error;
  }

  const contractProfile = await getTenantContractProfilePdfFields(
    context.access.owner_id,
    context.profile.tenant.id
  );
  const buffer = await generateRentalContractPdf(
    {
      ...context.tenantRecord,
      units: context.unitRecord
    },
    resolveContractLandlordProfile(context.unitRecord),
    contractProfile
  );

  return {
    fileName: `tenant-contract-${context.profile.tenant.id}.pdf`,
    buffer
  };
}
