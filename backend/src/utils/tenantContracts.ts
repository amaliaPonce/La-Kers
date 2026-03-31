const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type TenantLifecycleStatus = 'ACTIVE' | 'ARCHIVED';

export const normalizeDateKey = (value: string | Date | null | undefined) => {
  if (!value) return null;
  if (typeof value === 'string' && DATE_KEY_PATTERN.test(value)) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

export const contractsOverlap = (
  startA: string | null | undefined,
  endA: string | null | undefined,
  startB: string | null | undefined,
  endB: string | null | undefined
) => {
  const normalizedStartA = normalizeDateKey(startA);
  const normalizedEndA = normalizeDateKey(endA);
  const normalizedStartB = normalizeDateKey(startB);
  const normalizedEndB = normalizeDateKey(endB);
  if (!normalizedStartA || !normalizedEndA || !normalizedStartB || !normalizedEndB) return false;
  return normalizedStartA <= normalizedEndB && normalizedEndA >= normalizedStartB;
};

export const isActiveTenantStatus = (status: string | null | undefined): status is 'ACTIVE' =>
  String(status ?? '').toUpperCase() === 'ACTIVE';

export const contractIncludesDate = (
  contractStart: string | null | undefined,
  contractEnd: string | null | undefined,
  targetDate: string | Date | null | undefined
) => {
  const normalizedStart = normalizeDateKey(contractStart);
  const normalizedEnd = normalizeDateKey(contractEnd);
  const normalizedTarget = normalizeDateKey(targetDate);
  if (!normalizedStart || !normalizedEnd || !normalizedTarget) return false;
  return normalizedStart <= normalizedTarget && normalizedEnd >= normalizedTarget;
};

export const tenantContractBlocksRange = (
  status: string | null | undefined,
  existingStart: string | null | undefined,
  existingEnd: string | null | undefined,
  nextStart: string | null | undefined,
  nextEnd: string | null | undefined
) => {
  if (!isActiveTenantStatus(status)) return false;
  return contractsOverlap(existingStart, existingEnd, nextStart, nextEnd);
};

export const tenantOccupiesDate = (
  status: string | null | undefined,
  contractStart: string | null | undefined,
  contractEnd: string | null | undefined,
  targetDate: string | Date | null | undefined
) => {
  if (!isActiveTenantStatus(status)) return false;
  return contractIncludesDate(contractStart, contractEnd, targetDate);
};
