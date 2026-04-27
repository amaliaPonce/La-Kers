import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';

const {
  parseAnalyticsFilters,
  parsePagination,
  getDataDefinitions
} = require('../services/ceoAnalyticsService') as typeof import('../services/ceoAnalyticsService');

test('parseAnalyticsFilters defaults to a 30 day range and all tenants', () => {
  const filters = parseAnalyticsFilters({}, new Date('2026-04-26T12:00:00.000Z'));
  assert.equal(filters.from, '2026-03-28T00:00:00.000Z');
  assert.equal(filters.to, '2026-04-26T23:59:59.999Z');
  assert.equal(filters.tenant, null);
});

test('parseAnalyticsFilters normalizes tenant owner_id filters', () => {
  const filters = parseAnalyticsFilters({
    from: '2026-04-01',
    to: '2026-04-10',
    tenant: 'user_123'
  });
  assert.equal(filters.from, '2026-04-01T00:00:00.000Z');
  assert.equal(filters.to, '2026-04-10T23:59:59.999Z');
  assert.equal(filters.tenant, 'user_123');
});

test('parseAnalyticsFilters rejects inverted ranges', () => {
  assert.throws(
    () => parseAnalyticsFilters({ from: '2026-04-10', to: '2026-04-01' }),
    /rango de fechas/
  );
});

test('parsePagination clamps invalid and excessive page sizes', () => {
  assert.deepEqual(parsePagination({ page: '-1', pageSize: '1000' }), {
    page: 1,
    pageSize: 100
  });
});

test('getDataDefinitions documents CEO metric semantics', () => {
  const definitions = getDataDefinitions();
  assert.ok(definitions.some((definition) => definition.metric === 'Tenant SaaS'));
  assert.ok(definitions.some((definition) => definition.metric === 'Webhooks Stripe'));
});
