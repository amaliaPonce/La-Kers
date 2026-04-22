import test from 'node:test';
import assert from 'node:assert/strict';
import { FREEMIUM_PLAN_ID, PRO_PLAN_ID, getPlanDefinition } from '../config/plans';
import { buildPlanPayload } from '../services/ownersService';

test('plan definitions expose Starter and unlimited Pro', () => {
  const starterPlan = getPlanDefinition(FREEMIUM_PLAN_ID);
  const proPlan = getPlanDefinition(PRO_PLAN_ID);

  assert.equal(starterPlan.name, 'Starter');
  assert.equal(starterPlan.unitLimit, 3);
  assert.equal(starterPlan.isUnlimited, false);

  assert.equal(proPlan.name, 'Pro');
  assert.equal(proPlan.unitLimit, 999);
  assert.equal(proPlan.isUnlimited, true);
});

test('buildPlanPayload includes the unlimited flag', () => {
  const proPayload = buildPlanPayload(getPlanDefinition(PRO_PLAN_ID));

  assert.equal(proPayload.id, PRO_PLAN_ID);
  assert.equal(proPayload.isUnlimited, true);
  assert.equal(proPayload.unitLimit, 999);
});
