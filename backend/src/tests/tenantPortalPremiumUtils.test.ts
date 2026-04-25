import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertTenantPaymentAccess,
  buildTenantContractRenewalNotice,
  groupTenantPaymentsByStatus,
  isTenantIncidentVisible,
  resolveTenantPortalPremiumAvailability
} from '../services/tenantPortalPremiumUtils';

test('tenant portal premium is disabled when owner is not on Pro', () => {
  const availability = resolveTenantPortalPremiumAvailability({
    featureFlagEnabled: true,
    ownerHasProPlan: false
  });

  assert.deepEqual(availability, {
    enabled: false,
    reason: 'owner_plan_required'
  });
});

test('tenant payments are grouped into pending history and late buckets', () => {
  const grouped = groupTenantPaymentsByStatus([
    { id: 'payment-pending', status: 'PENDING', amount: 700 },
    { id: 'payment-late', status: 'LATE', amount: 800 },
    { id: 'payment-paid', status: 'PAID', amount: 650 }
  ]);

  assert.equal(grouped.pending.length, 2);
  assert.equal(grouped.history.length, 1);
  assert.equal(grouped.summary.pendingCount, 1);
  assert.equal(grouped.summary.lateCount, 1);
  assert.equal(grouped.summary.paidCount, 1);
  assert.equal(grouped.summary.outstandingAmount, 1500);
  assert.equal(grouped.summary.paidAmount, 650);
});

test('paid receipt download rejects payments from another tenant', () => {
  assert.throws(
    () =>
      assertTenantPaymentAccess({
        expectedTenantPersonId: 'tenant-a',
        paymentTenantPersonId: 'tenant-b',
        paymentStatus: 'PAID'
      }),
    /Pago no encontrado/
  );
});

test('renewal notice becomes visible inside the configured threshold', () => {
  const notice = buildTenantContractRenewalNotice('2026-05-10', 30, new Date('2026-04-23T12:00:00Z'));

  assert.equal(notice.visible, true);
  assert.equal(notice.daysRemaining, 17);
  assert.equal(notice.tone, 'info');
});

test('tenant incidents stay scoped to the active contract window', () => {
  assert.equal(
    isTenantIncidentVisible({
      contractStart: '2026-01-01',
      contractEnd: '2026-12-31',
      incidentCreatedAt: '2026-04-10T09:00:00Z',
      incidentTenantPersonId: 'tenant-a',
      tenantPersonId: 'tenant-a'
    }),
    true
  );

  assert.equal(
    isTenantIncidentVisible({
      contractStart: '2026-01-01',
      contractEnd: '2026-12-31',
      incidentCreatedAt: '2025-12-20T09:00:00Z',
      incidentTenantPersonId: 'tenant-a',
      tenantPersonId: 'tenant-a'
    }),
    false
  );
});
