import test from 'node:test';
import assert from 'node:assert/strict';
import { getMissingRuntimeEnvKeys, getReadinessStatus } from '../utils/readiness';

const baseEnv = {
  NODE_ENV: 'production',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  CLERK_SECRET_KEY: 'clerk-secret',
  LANDLORD_NAME: 'La Kers',
  LANDLORD_IDENTIFICATION: 'B12345678',
  LANDLORD_ADDRESS: 'Madrid'
};

test('getMissingRuntimeEnvKeys lists required runtime variables', () => {
  assert.deepEqual(getMissingRuntimeEnvKeys({ NODE_ENV: 'production' }), [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLERK_SECRET_KEY',
    'LANDLORD_NAME',
    'LANDLORD_IDENTIFICATION',
    'LANDLORD_ADDRESS'
  ]);
});

test('getReadinessStatus fails when critical env vars are missing', async () => {
  const status = await getReadinessStatus({ NODE_ENV: 'production' }, async () => {
    throw new Error('fetch should not run');
  });

  assert.equal(status.ready, false);
  assert.equal(status.reason, 'missing_env');
  assert.deepEqual(status.missingKeys, [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLERK_SECRET_KEY',
    'LANDLORD_NAME',
    'LANDLORD_IDENTIFICATION',
    'LANDLORD_ADDRESS'
  ]);
});

test('getReadinessStatus fails when Supabase responds with an error', async () => {
  const status = await getReadinessStatus(baseEnv, async () => ({
    ok: false,
    status: 503
  } as Response));

  assert.equal(status.ready, false);
  assert.equal(status.reason, 'supabase_unreachable');
  assert.equal(status.upstreamStatus, 503);
});

test('getReadinessStatus succeeds when Supabase responds correctly', async () => {
  const status = await getReadinessStatus(baseEnv, async () => ({
    ok: true,
    status: 200
  } as Response));

  assert.deepEqual(status, {
    ready: true,
    environment: 'production'
  });
});
