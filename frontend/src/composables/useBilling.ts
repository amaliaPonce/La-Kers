import { computed, reactive, readonly } from 'vue';
import apiClient from '../services/apiClient';

export type BillingCycle = 'monthly' | 'yearly';
export type BillingMode = 'stripe' | 'manual';
export type SubscriptionStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export type BillingSummary = {
  plan: {
    id: string;
    name: string;
    description: string;
    unitLimit: number;
    monthlyPriceCents: number;
    yearlyPriceCents: number;
  };
  usage: {
    unitCount: number;
    unitLimit: number;
    remainingUnits: number;
    canAddMoreUnits: boolean;
  };
  billing: {
    mode: BillingMode;
    checkoutAvailable: boolean;
    portalAvailable: boolean;
    manualActivationEmail: string;
    current: {
      planId: string;
      subscriptionStatus: SubscriptionStatus;
      billingCycle: BillingCycle | null;
      currentPeriodEnd: string | null;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
    };
  };
};

type BillingState = {
  summary: BillingSummary | null;
  loading: boolean;
  loaded: boolean;
  error: string;
};

const ACTIVE_PRO_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due'];

const state = reactive<BillingState>({
  summary: null,
  loading: false,
  loaded: false,
  error: ''
});

let pendingRequest: Promise<BillingSummary | null> | null = null;

const getFallbackSummary = (): BillingSummary => ({
  plan: {
    id: 'freemium',
    name: 'Gratis',
    description: 'Hasta 2 inmuebles.',
    unitLimit: 2,
    monthlyPriceCents: 0,
    yearlyPriceCents: 0
  },
  usage: {
    unitCount: 0,
    unitLimit: 2,
    remainingUnits: 2,
    canAddMoreUnits: true
  },
  billing: {
    mode: 'manual',
    checkoutAvailable: false,
    portalAvailable: false,
    manualActivationEmail: 'contacto@la-kers.com',
    current: {
      planId: 'freemium',
      subscriptionStatus: 'inactive',
      billingCycle: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    }
  }
});

const isProSummary = (summary: BillingSummary | null) =>
  Boolean(
    summary &&
      summary.plan.id === 'pro' &&
      ACTIVE_PRO_STATUSES.includes(summary.billing.current.subscriptionStatus)
  );

export const useBilling = () => {
  const loadSummary = async (options: { force?: boolean } = {}) => {
    if (pendingRequest && !options.force) {
      return pendingRequest;
    }

    if (state.loaded && state.summary && !options.force) {
      return state.summary;
    }

    state.loading = true;
    state.error = '';

    pendingRequest = apiClient
      .get('/billing/summary')
      .then(({ data }) => {
        state.summary = (data as BillingSummary) ?? getFallbackSummary();
        state.loaded = true;
        return state.summary;
      })
      .catch((error) => {
        state.error = 'No se pudo cargar el estado del plan.';
        throw error;
      })
      .finally(() => {
        state.loading = false;
        pendingRequest = null;
      });

    return pendingRequest;
  };

  const clearSummary = () => {
    state.summary = null;
    state.loading = false;
    state.loaded = false;
    state.error = '';
    pendingRequest = null;
  };

  const usagePercentage = computed(() => {
    const unitLimit = state.summary?.usage.unitLimit ?? 0;
    const unitCount = state.summary?.usage.unitCount ?? 0;
    if (!unitLimit) return 0;
    return Math.min(Math.round((unitCount / unitLimit) * 100), 100);
  });

  const isPro = computed(() => isProSummary(state.summary));
  const isFreemium = computed(() => Boolean(state.summary) && !isPro.value);
  const isAtLimit = computed(() => !(state.summary?.usage.canAddMoreUnits ?? true));
  const isNearLimit = computed(() => {
    if (!state.summary || isPro.value) return false;
    return state.summary.usage.remainingUnits <= 1;
  });

  return {
    state: readonly(state),
    summary: computed(() => state.summary),
    loading: computed(() => state.loading),
    loaded: computed(() => state.loaded),
    error: computed(() => state.error),
    isPro,
    isFreemium,
    isAtLimit,
    isNearLimit,
    usagePercentage,
    loadSummary,
    clearSummary
  };
};
