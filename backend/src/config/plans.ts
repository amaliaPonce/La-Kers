export type PlanDefinition = {
  id: string;
  name: string;
  description: string;
  unitLimit: number;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
};

export const FREEMIUM_PLAN_ID = 'freemium';
export const PRO_PLAN_ID = 'pro';

export const planDefinitions: Record<string, PlanDefinition> = {
  [FREEMIUM_PLAN_ID]: {
    id: FREEMIUM_PLAN_ID,
    name: 'Freemium',
    description: 'Hasta 2 inmuebles.',
    unitLimit: 2,
    monthlyPriceCents: 0,
    yearlyPriceCents: 0
  },
  [PRO_PLAN_ID]: {
    id: PRO_PLAN_ID,
    name: 'Pro',
    description: 'Hasta 25 inmuebles.',
    unitLimit: 25,
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
