import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTenantPortalInviteUrl,
  hashTenantPortalInviteToken,
  isTenantPortalInviteExpired
} from '../services/tenantPortalInviteUtils';

test('tenant portal invite urls target tenant sign-up with the raw token', () => {
  const inviteUrl = buildTenantPortalInviteUrl('https://app.example.com/', 'abc123');

  assert.equal(inviteUrl, 'https://app.example.com/tenant/sign-up?invite=abc123');
});

test('tenant portal invite tokens are hashed deterministically', () => {
  assert.equal(
    hashTenantPortalInviteToken('sample-token'),
    hashTenantPortalInviteToken('sample-token')
  );
});

test('tenant portal invite expiration detects past timestamps', () => {
  assert.equal(isTenantPortalInviteExpired('2026-04-20T10:00:00.000Z', new Date('2026-04-23T10:00:00.000Z')), true);
  assert.equal(isTenantPortalInviteExpired('2026-04-30T10:00:00.000Z', new Date('2026-04-23T10:00:00.000Z')), false);
});
