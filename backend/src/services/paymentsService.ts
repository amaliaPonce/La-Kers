import { supabaseAdmin } from '../config/supabaseClient';

type PaymentPayload = {
  unit_id: string;
  tenant_person_id: string;
  amount: number;
  due_date: string;
  month: number;
  year: number;
  status?: 'PENDING' | 'PAID' | 'LATE';
};

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

export async function listPayments() {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, units(name, status), tenant_persons(full_name)')
    .order('due_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPaymentById(id: string) {
  const { data, error } = await supabaseAdmin.from('payments').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createPayment(payload: PaymentPayload) {
  const { data, error } = await supabaseAdmin.from('payments').insert({
    ...payload,
    status: payload.status ?? 'PENDING'
  }).single();
  if (error) throw error;
  return data;
}

export async function markPaymentPaid(id: string) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({ status: 'PAID', paid_date: new Date().toISOString() })
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
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

export async function getOccupiedContracts(date: string) {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('*, units(id, name, status, monthly_rent)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return data?.filter((tenant) => {
    const unit = tenant.units;
    if (!unit) return false;
    const contractStart = new Date(tenant.contract_start);
    const contractEnd = new Date(tenant.contract_end);
    const comparisonDate = new Date(date);
    return contractStart <= comparisonDate && contractEnd >= comparisonDate;
  }) ?? [];
}

export async function markPendingPaymentsAsLate(date: string) {
  const { error } = await supabaseAdmin
    .from('payments')
    .update({ status: 'LATE' })
    .lt('due_date', date)
    .eq('status', 'PENDING');
  if (error) throw error;
}

export async function ensurePendingPaymentsForDate(date: string) {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return;
  const month = target.getMonth() + 1;
  const year = target.getFullYear();
  const dueDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const contracts = await getOccupiedContracts(target.toISOString());

  for (const tenant of contracts) {
    const unit = tenant.units;
    if (!unit?.id) {
      continue;
    }
    const alreadyExists = await hasPaymentForMonth(unit.id, month, year);
    if (alreadyExists) continue;
    await createPayment({
      unit_id: unit.id,
      tenant_person_id: tenant.id,
      amount: Number(unit.monthly_rent ?? 0),
      due_date: dueDate,
      month,
      year
    });
  }
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
