import { supabaseAdmin } from '../config/supabaseClient';
import { countApartmentsByStatus } from './apartmentsService';

export async function getDashboardSummary() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('amount, status')
    .eq('month', month)
    .eq('year', year);

  if (error) throw error;

  const paymentTotals = (data ?? []).reduce(
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

  const { data: unitsData, error: unitsError } = await supabaseAdmin
    .from('units')
    .select('monthly_rent');

  if (unitsError) throw unitsError;

  const baseContractValue = (unitsData ?? []).reduce((sum, unit) => {
    const rent = Number((unit as { monthly_rent?: number }).monthly_rent ?? 0);
    return sum + rent;
  }, 0);

  const unitCounts = await countApartmentsByStatus();
  const { count: tenantCount, error: tenantError } = await supabaseAdmin
    .from('tenant_persons')
    .select('*', { count: 'exact', head: true });
  if (tenantError) {
    throw tenantError;
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

  const { data: historyData, error: historyError } = await supabaseAdmin
    .from('payments')
    .select('month, year, amount, status')
    .gte('year', earliestTrendYear)
    .lte('year', latestTrendYear);
  if (historyError) throw historyError;

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
