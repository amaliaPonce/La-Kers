import { supabaseAdmin } from '../config/supabaseClient';
import { ensureOwnerOwnsUnit } from './ownersService';

type PaymentPayload = {
  unit_id: string;
  tenant_person_id: string;
  amount: number;
  due_date: string;
  month: number;
  year: number;
  status?: 'PENDING' | 'PAID' | 'LATE';
  payment_method?: 'CASH' | 'BANK' | null;
};

export type PaymentMethod = 'CASH' | 'BANK';

export type TenantPaymentSummaryOptions = {
  untilDate?: string;
};

export type TenantPaymentSummary = {
  monthsContracted: number;
  totalAccrued: number;
  totalPaid: number;
  outstanding: number;
  lastPaymentDate: string | null;
};

export type PaymentTenantContract = {
  id: string;
  unit_id?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  units?: {
    id?: string | null;
    monthly_rent?: number | string | null;
  } | null;
};

const PAYMENT_SELECT = '*, units!inner(id, owner_id, name, status), tenant_persons(id, full_name)';

const padDatePart = (value: number) => String(value).padStart(2, '0');
const createMonthKey = (year: number, month: number) => `${year}-${padDatePart(month)}`;

const toDateKey = (value: string | Date | null | undefined) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

const buildMonthStartDate = (year: number, month: number) => `${year}-${padDatePart(month)}-01`;

const buildMonthRange = (startDateKey: string, endDateKey: string) => {
  const [startYear, startMonth] = startDateKey.split('-').map(Number);
  const [endYear, endMonth] = endDateKey.split('-').map(Number);
  const months: Array<{ month: number; year: number; dueDate: string }> = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    months.push({
      month: currentMonth,
      year: currentYear,
      dueDate: buildMonthStartDate(currentYear, currentMonth)
    });
    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }

  return months;
};

async function resolveUnitRent(unitId: string, fallbackRent?: number | string | null) {
  const fallback = Number(fallbackRent ?? 0);
  if (fallback > 0) return fallback;

  const { data, error } = await supabaseAdmin
    .from('units')
    .select('monthly_rent')
    .eq('id', unitId)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.monthly_rent ?? 0);
}

type UnpaidTenantPaymentRecord = {
  id: string;
  unit_id?: string | null;
  amount?: number | string | null;
  due_date?: string | null;
  month?: number | null;
  year?: number | null;
};

export async function listPayments(ownerId: string) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('units.owner_id', ownerId)
    .order('due_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPaymentById(id: string, ownerId?: string) {
  let query = supabaseAdmin
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('id', id);
  if (ownerId) {
    query = query.eq('units.owner_id', ownerId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPayment(payload: PaymentPayload, ownerId?: string) {
  if (ownerId) {
    await ensureOwnerOwnsUnit(ownerId, payload.unit_id);
  }
  const { data, error } = await supabaseAdmin.from('payments').insert({
    ...payload,
    status: payload.status ?? 'PENDING'
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function markPaymentPaid(id: string, paymentMethod: PaymentMethod, ownerId?: string) {
  const payment = await getPaymentById(id, ownerId);
  if (!payment) {
    const error = new Error('Pago no encontrado');
    (error as any).status = 404;
    throw error;
  }
  if (payment.status === 'PAID') {
    if (payment.payment_method === paymentMethod) {
      return payment;
    }
    const { error } = await supabaseAdmin
      .from('payments')
      .update({ payment_method: paymentMethod })
      .eq('id', id);
    if (error) throw error;
    return getPaymentById(id, ownerId);
  }
  const { error } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'PAID',
      paid_date: new Date().toISOString(),
      payment_method: paymentMethod
    })
    .eq('id', id);
  if (error) throw error;
  return getPaymentById(id, ownerId);
}

export async function hasPaymentForMonth(unit_id: string, month: number, year: number) {
  const { count, error } = await supabaseAdmin
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('unit_id', unit_id)
    .eq('month', month)
    .eq('year', year);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getPaymentForMonth(unit_id: string, month: number, year: number) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('unit_id', unit_id)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOccupiedContracts(date: string, ownerId?: string) {
  const comparisonDateKey = toDateKey(date);
  if (!comparisonDateKey) return [];

  let query = supabaseAdmin
    .from('tenant_persons')
    .select('*, units(owner_id, id, name, status, monthly_rent)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });
  if (ownerId) {
    query = query.eq('units.owner_id', ownerId);
  }
  const { data, error } = await query;
  if (error) throw error;

  return data?.filter((tenant) => {
    const unit = tenant.units;
    if (!unit) return false;
    const contractStart = toDateKey(tenant.contract_start);
    const contractEnd = toDateKey(tenant.contract_end);
    if (!contractStart || !contractEnd) return false;
    return contractStart <= comparisonDateKey && contractEnd >= comparisonDateKey;
  }) ?? [];
}

export async function markPendingPaymentsAsLate(date: string, ownerId?: string) {
  const targetDate = toDateKey(date);
  if (!targetDate) return;

  let query = supabaseAdmin
    .from('payments')
    .update({ status: 'LATE' })
    .lt('due_date', targetDate)
    .eq('status', 'PENDING');

  if (ownerId) {
    const { data: units, error: unitsError } = await supabaseAdmin
      .from('units')
      .select('id')
      .eq('owner_id', ownerId);
    if (unitsError) throw unitsError;

    const unitIds = (units ?? []).map((unit) => String(unit.id ?? '')).filter(Boolean);
    if (!unitIds.length) return;
    query = query.in('unit_id', unitIds);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function ensurePendingPaymentsForDate(date: string, ownerId?: string) {
  const targetDateKey = toDateKey(date);
  if (!targetDateKey) return;
  const contracts = await getOccupiedContracts(targetDateKey, ownerId);

  for (const tenant of contracts) {
    await ensurePendingPaymentsForTenant(ownerId ?? '', tenant, { untilDate: targetDateKey });
  }
}

export async function ensurePendingPaymentsForTenant(
  ownerId: string,
  tenant: PaymentTenantContract,
  options: { untilDate?: string } = {}
) {
  const unitId = String(tenant.unit_id ?? tenant.units?.id ?? '');
  const contractStart = toDateKey(tenant.contract_start);
  const contractEnd = toDateKey(tenant.contract_end);
  const limitDate = toDateKey(options.untilDate ?? new Date());

  if (!tenant.id || !unitId || !contractStart || !contractEnd || !limitDate) return;
  if (contractEnd < contractStart || contractStart > limitDate) return;

  const effectiveEndDate = contractEnd < limitDate ? contractEnd : limitDate;
  const amount = await resolveUnitRent(unitId, tenant.units?.monthly_rent);
  if (!(amount > 0)) return;

  const monthRange = buildMonthRange(contractStart, effectiveEndDate);
  for (const entry of monthRange) {
    const alreadyExists = await hasPaymentForMonth(unitId, entry.month, entry.year);
    if (alreadyExists) continue;
    await createPayment(
      {
        unit_id: unitId,
        tenant_person_id: tenant.id,
        amount,
        due_date: entry.dueDate,
        month: entry.month,
        year: entry.year
      },
      ownerId || undefined
    );
  }
}

export async function reconcileUnpaidPaymentsForTenant(
  ownerId: string,
  tenant: PaymentTenantContract
) {
  const unitId = String(tenant.unit_id ?? tenant.units?.id ?? '');
  const contractStart = toDateKey(tenant.contract_start);
  const contractEnd = toDateKey(tenant.contract_end);

  if (!tenant.id || !unitId || !contractStart || !contractEnd) return;
  if (contractEnd < contractStart) return;

  const amount = await resolveUnitRent(unitId, tenant.units?.monthly_rent);
  if (!(amount > 0)) return;

  const desiredEntries = new Map(
    buildMonthRange(contractStart, contractEnd).map((entry) => [
      createMonthKey(entry.year, entry.month),
      entry
    ])
  );

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('id, unit_id, amount, due_date, month, year')
    .eq('tenant_person_id', tenant.id)
    .in('status', ['PENDING', 'LATE']);
  if (error) throw error;

  const unpaidPayments = (data ?? []) as UnpaidTenantPaymentRecord[];
  const paymentIdsToDelete: string[] = [];

  for (const payment of unpaidPayments) {
    const month = Number(payment.month ?? 0);
    const year = Number(payment.year ?? 0);
    if (!month || !year) {
      paymentIdsToDelete.push(payment.id);
      continue;
    }

    const key = createMonthKey(year, month);
    const desiredEntry = desiredEntries.get(key);
    if (!desiredEntry) {
      paymentIdsToDelete.push(payment.id);
      continue;
    }

    const dueDate = toDateKey(payment.due_date);
    const currentAmount = Number(payment.amount ?? 0);
    const requiresUpdate =
      String(payment.unit_id ?? '') !== unitId ||
      dueDate !== desiredEntry.dueDate ||
      currentAmount !== amount;

    if (!requiresUpdate) continue;

    const conflictingPayment = await getPaymentForMonth(unitId, desiredEntry.month, desiredEntry.year);
    if (conflictingPayment && conflictingPayment.id !== payment.id) {
      const conflict = new Error('Ya existe un pago pendiente para esa unidad y ese mes. Revisa si el contrato se está solapando con otro inquilino.');
      (conflict as any).status = 409;
      throw conflict;
    }

    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        unit_id: unitId,
        amount,
        due_date: desiredEntry.dueDate
      })
      .eq('id', payment.id);
    if (updateError) throw updateError;
  }

  if (paymentIdsToDelete.length) {
    const { error: deleteError } = await supabaseAdmin
      .from('payments')
      .delete()
      .in('id', paymentIdsToDelete);
    if (deleteError) throw deleteError;
  }

  await ensurePendingPaymentsForTenant(ownerId, tenant);
}

export async function getTenantPaymentSummary(
  tenantPersonId: string,
  options?: TenantPaymentSummaryOptions
): Promise<TenantPaymentSummary> {
  let builder = supabaseAdmin
    .from('payments')
    .select('amount,status,paid_date,month,year,due_date')
    .eq('tenant_person_id', tenantPersonId);

  if (options?.untilDate) {
    builder = builder.lte('due_date', options.untilDate);
  }

  const { data, error } = await builder.order('due_date', { ascending: true });
  if (error) throw error;

  const payments = data ?? [];
  const uniqueMonths = new Set(payments.map((payment) => `${payment.year ?? ''}-${payment.month ?? ''}`));
  const totalAccrued = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const totalPaid = payments
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const outstanding = totalAccrued - totalPaid;
  let lastPaymentDate: string | null = null;
  for (const payment of payments) {
    if (!payment.paid_date) continue;
    if (!lastPaymentDate || new Date(payment.paid_date) > new Date(lastPaymentDate)) {
      lastPaymentDate = payment.paid_date;
    }
  }

  return {
    monthsContracted: uniqueMonths.size,
    totalAccrued,
    totalPaid,
    outstanding,
    lastPaymentDate
  };
}

export async function purgeOldPayments(retentionYears = 6) {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - retentionYears);
  const cutoffDate = cutoff.toISOString().split('T')[0];
  const { error } = await supabaseAdmin
    .from('payments')
    .delete()
    .lt('due_date', cutoffDate);
  if (error) throw error;
}
