export type PlanDefinition = {
  id: string;
  name: string;
  description: string;
  unitLimit: number;
};

export const FREEMIUM_PLAN_ID = 'freemium';

export const planDefinitions: Record<string, PlanDefinition> = {
  [FREEMIUM_PLAN_ID]: {
    id: FREEMIUM_PLAN_ID,
    name: 'Freemium',
    description: 'Gestión básica de viviendas con límite generoso de unidades.',
    unitLimit: 25
  }
};

export function getPlanDefinition(planId?: string): PlanDefinition {
  if (planId && planDefinitions[planId]) {
    return planDefinitions[planId];
  }
  return planDefinitions[FREEMIUM_PLAN_ID];
}
