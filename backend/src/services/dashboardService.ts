import { supabaseAdmin } from '../config/supabaseClient';

type DashboardUnitRecord = {
  id?: string | null;
  monthly_rent?: number | string | null;
  status?: string | null;
};

type DashboardPaymentRecord = {
  month?: number | null;
  year?: number | null;
  amount?: number | string | null;
  status?: string | null;
};

type DashboardTenantRecord = {
  unit_id?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
};

type DashboardIncidentRecord = {
  cost?: number | string | null;
  status?: string | null;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const CONTRACT_WINDOW_DAYS = 30;

const toDayStart = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export async function getDashboardSummary(ownerId: string) {
  const today = toDayStart(new Date()) ?? new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
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

  const { data: unitsData, error: unitsError } = await supabaseAdmin
    .from('units')
    .select('id, monthly_rent, status')
    .eq('owner_id', ownerId);

  if (unitsError) throw unitsError;

  const units = (unitsData ?? []) as DashboardUnitRecord[];
  const unitIds = units
    .map((unit) => String(unit.id ?? ''))
    .filter(Boolean);

  const baseContractValue = units.reduce((sum, unit) => sum + Number(unit.monthly_rent ?? 0), 0);

  if (!unitIds.length) {
    return {
      totalExpectedMes: baseContractValue,
      totalPaidMes: 0,
      totalPendingMes: 0,
      totalLateMes: 0,
      overdueCount: 0,
      overdueAmount: 0,
      unidadesOcupadas: 0,
      unidadesDisponibles: 0,
      totalUnits: 0,
      totalTenants: 0,
      upcomingContractsCount: 0,
      earliestContractExpiryDays: null,
      openIncidentsCount: 0,
      openIncidentCost: 0,
      incomeTrend: trendMonths.map((trend) => ({
        month: trend.month,
        year: trend.year,
        label: trend.label,
        collected: 0
      }))
    };
  }

  const [paymentsResponse, latePaymentsResponse, tenantsResponse, incidentsResponse] = await Promise.all([
    supabaseAdmin
      .from('payments')
      .select('month, year, amount, status')
      .in('unit_id', unitIds)
      .gte('year', earliestTrendYear)
      .lte('year', latestTrendYear),
    supabaseAdmin
      .from('payments')
      .select('amount')
      .in('unit_id', unitIds)
      .eq('status', 'LATE'),
    supabaseAdmin
      .from('tenant_persons')
      .select('unit_id, contract_start, contract_end')
      .in('unit_id', unitIds)
      .eq('status', 'ACTIVE'),
    supabaseAdmin
      .from('incidents')
      .select('cost, status')
      .in('unit_id', unitIds)
  ]);

  if (paymentsResponse.error) throw paymentsResponse.error;
  if (latePaymentsResponse.error) throw latePaymentsResponse.error;
  if (tenantsResponse.error) throw tenantsResponse.error;
  if (incidentsResponse.error) throw incidentsResponse.error;

  const payments = (paymentsResponse.data ?? []) as DashboardPaymentRecord[];
  const latePayments = (latePaymentsResponse.data ?? []) as Array<{ amount?: number | string | null }>;
  const tenants = (tenantsResponse.data ?? []) as DashboardTenantRecord[];
  const incidents = (incidentsResponse.data ?? []) as DashboardIncidentRecord[];

  const paymentTotals = {
    totalPaidMes: 0,
    totalPendingMes: 0,
    totalLateMes: 0
  };
  const monthlyCollections = new Map<string, number>();

  for (const payment of payments) {
    const paymentMonth = Number(payment.month ?? 0);
    const paymentYear = Number(payment.year ?? 0);
    const amount = Number(payment.amount ?? 0);
    const status = String(payment.status ?? '').toUpperCase();

    if (paymentMonth === month && paymentYear === year) {
      if (status === 'PAID') paymentTotals.totalPaidMes += amount;
      if (status === 'PENDING') paymentTotals.totalPendingMes += amount;
      if (status === 'LATE') paymentTotals.totalLateMes += amount;
    }

    if (status !== 'PAID' || !paymentMonth || !paymentYear) continue;

    const key = `${paymentYear}-${paymentMonth}`;
    if (!trendKeys.has(key)) continue;
    monthlyCollections.set(key, (monthlyCollections.get(key) ?? 0) + amount);
  }

  const overdueCount = latePayments.length;
  const overdueAmount = latePayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);

  const occupiedUnitIds = new Set<string>();
  let upcomingContractsCount = 0;
  let earliestContractExpiryDays: number | null = null;

  for (const tenant of tenants) {
    const contractStart = toDayStart(tenant.contract_start);
    const contractEnd = toDayStart(tenant.contract_end);

    if (contractStart && contractEnd && contractStart <= today && contractEnd >= today) {
      const unitId = String(tenant.unit_id ?? '');
      if (unitId) {
        occupiedUnitIds.add(unitId);
      }
    }

    if (!contractEnd) continue;
    const diffDays = Math.ceil((contractEnd.getTime() - today.getTime()) / MS_PER_DAY);
    if (diffDays < 0 || diffDays > CONTRACT_WINDOW_DAYS) continue;

    upcomingContractsCount += 1;
    earliestContractExpiryDays =
      earliestContractExpiryDays === null ? diffDays : Math.min(earliestContractExpiryDays, diffDays);
  }

  let occupiedCount = 0;
  let availableCount = 0;

  for (const unit of units) {
    const unitId = String(unit.id ?? '');
    if (unitId && occupiedUnitIds.has(unitId)) {
      occupiedCount += 1;
      continue;
    }

    if (String(unit.status ?? '').toUpperCase() !== 'RESERVED') {
      availableCount += 1;
    }
  }

  const openIncidents = incidents.filter((incident) => String(incident.status ?? '').toUpperCase() !== 'CLOSED');
  const openIncidentCost = openIncidents.reduce((sum, incident) => sum + Number(incident.cost ?? 0), 0);

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
    overdueCount,
    overdueAmount,
    unidadesOcupadas: occupiedCount,
    unidadesDisponibles: availableCount,
    totalUnits: units.length,
    totalTenants: tenants.length,
    upcomingContractsCount,
    earliestContractExpiryDays,
    openIncidentsCount: openIncidents.length,
    openIncidentCost,
    incomeTrend
  };
}
