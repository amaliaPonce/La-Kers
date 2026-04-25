export type PlanDefinition = {
  id: string;
  name: string;
  description: string;
  unitLimit: number;
  isUnlimited: boolean;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
};

export const FREEMIUM_PLAN_ID = 'freemium';
export const PRO_PLAN_ID = 'pro';

export const planDefinitions: Record<string, PlanDefinition> = {
  [FREEMIUM_PLAN_ID]: {
    id: FREEMIUM_PLAN_ID,
    name: 'Starter',
    description: 'Ideal para empezar a ordenar tu operativa.',
    unitLimit: 3,
    isUnlimited: false,
    monthlyPriceCents: 0,
    yearlyPriceCents: 0
  },
  [PRO_PLAN_ID]: {
    id: PRO_PLAN_ID,
    name: 'Pro',
    description: 'Para propietarios que no quieren límites.',
    unitLimit: 999,
    isUnlimited: true,
    monthlyPriceCents: 990,
    yearlyPriceCents: 9900
  }
};

export function getPlanDefinition(planId?: string): PlanDefinition {
  if (planId && planDefinitions[planId]) {
    return planDefinitions[planId];
  }
  return planDefinitions[FREEMIUM_PLAN_ID];
}

export function buildPlanPayload(plan: PlanDefinition) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    unitLimit: plan.unitLimit,
    isUnlimited: plan.isUnlimited,
    monthlyPriceCents: plan.monthlyPriceCents,
    yearlyPriceCents: plan.yearlyPriceCents
  };
}
