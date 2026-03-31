import test from 'node:test';
import assert from 'node:assert/strict';
import { tenantContractBlocksRange, tenantOccupiesDate } from '../utils/tenantContracts';

test('tenantContractBlocksRange ignores archived contracts even if dates overlap', () => {
  assert.equal(
    tenantContractBlocksRange('ARCHIVED', '2026-03-01', '2026-03-26', '2026-03-26', '2027-03-25'),
    false
  );
});

test('tenantContractBlocksRange keeps active contracts blocking overlapping dates', () => {
  assert.equal(
    tenantContractBlocksRange('ACTIVE', '2026-03-01', '2026-03-26', '2026-03-26', '2027-03-25'),
    true
  );
});

test('tenantOccupiesDate only counts active contracts for apartment occupancy', () => {
  assert.equal(tenantOccupiesDate('ARCHIVED', '2026-03-01', '2026-03-26', '2026-03-26'), false);
  assert.equal(tenantOccupiesDate('ACTIVE', '2026-03-01', '2026-03-26', '2026-03-26'), true);
});
