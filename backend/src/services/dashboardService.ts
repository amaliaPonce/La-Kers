import { supabaseAdmin } from '../config/supabaseClient';
import { countApartmentsByStatus } from './apartmentsService';

export async function getDashboardSummary(ownerId: string) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const { data: unitsData, error: unitsError } = await supabaseAdmin
    .from('units')
    .select('id, monthly_rent')
    .eq('owner_id', ownerId);

  if (unitsError) throw unitsError;

  const unitIds = (unitsData ?? [])
    .map((unit) => String((unit as { id?: string }).id ?? ''))
    .filter(Boolean);

  const baseContractValue = (unitsData ?? []).reduce((sum, unit) => {
    const rent = Number((unit as { monthly_rent?: number }).monthly_rent ?? 0);
    return sum + rent;
  }, 0);

  const unitCounts = await countApartmentsByStatus(ownerId);

  let currentMonthPayments: { amount?: number; status?: string }[] = [];
  if (unitIds.length) {
    const { data: paymentsData, error } = await supabaseAdmin
      .from('payments')
      .select('amount, status')
      .in('unit_id', unitIds)
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
    currentMonthPayments = paymentsData ?? [];
  }

  const paymentTotals = (currentMonthPayments ?? []).reduce(
    (acc, payment) => {
      const amount = Number(payment.amount ?? 0);
      if (payment.status === 'PAID') acc.totalPaidMes += amount;
      if (payment.status === 'PENDING') acc.totalPendingMes += amount;
      if (payment.status === 'LATE') acc.totalLateMes += amount;
      return acc;
    },
    {
      totalPaidMes: 0,
      totalPendingMes: 0,
      totalLateMes: 0
    }
  );

  let tenantCount = 0;
  if (unitIds.length) {
    const { count, error: tenantError } = await supabaseAdmin
      .from('tenant_persons')
      .select('id', { count: 'exact', head: true })
      .in('unit_id', unitIds);

    if (tenantError) {
      throw tenantError;
    }

    tenantCount = count ?? 0;
  }

  const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'short' });
  const trendMonths = Array.from({ length: 6 }, (_, index) => {
    const monthsAgo = 5 - index;
    const targetDate = new Date(year, month - 1 - monthsAgo, 1);
    return {
      month: targetDate.getMonth() + 1,
      year: targetDate.getFullYear(),
      label: monthFormatter.format(targetDate).replace('.', '')
    };
  });
  const earliestTrendYear = trendMonths[0].year;
  const latestTrendYear = trendMonths[trendMonths.length - 1].year;
  const trendKeys = new Set(trendMonths.map((item) => `${item.year}-${item.month}`));

  let historyData: { month?: number; year?: number; amount?: number; status?: string }[] = [];
  if (unitIds.length) {
    const { data, error: historyError } = await supabaseAdmin
      .from('payments')
      .select('month, year, amount, status')
      .in('unit_id', unitIds)
      .gte('year', earliestTrendYear)
      .lte('year', latestTrendYear);
    if (historyError) throw historyError;
    historyData = data ?? [];
  }

  const monthlyCollections = (historyData ?? []).reduce<Map<string, number>>((acc, payment) => {
    const paymentMonth = Number(payment.month ?? 0);
    const paymentYear = Number(payment.year ?? 0);
    if (!paymentMonth || !paymentYear) return acc;
    if (payment.status !== 'PAID') return acc;
    const key = `${paymentYear}-${paymentMonth}`;
    if (!trendKeys.has(key)) return acc;
    const amount = Number(payment.amount ?? 0);
    acc.set(key, (acc.get(key) ?? 0) + amount);
    return acc;
  }, new Map());

  const incomeTrend = trendMonths.map((trend) => {
    const key = `${trend.year}-${trend.month}`;
    return {
      month: trend.month,
      year: trend.year,
      label: trend.label,
      collected: monthlyCollections.get(key) ?? 0
    };
  });

  return {
    totalExpectedMes: baseContractValue,
    totalPaidMes: paymentTotals.totalPaidMes,
    totalPendingMes: paymentTotals.totalPendingMes,
    totalLateMes: paymentTotals.totalLateMes,
    unidadesOcupadas: unitCounts.OCCUPIED ?? 0,
    unidadesDisponibles: unitCounts.AVAILABLE ?? 0,
    totalUnits: unitCounts.total ?? 0,
    totalTenants: tenantCount ?? 0,
    incomeTrend
  };
}
