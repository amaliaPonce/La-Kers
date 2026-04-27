import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

function buildStripeSignature(secret: string, payload: Buffer, timestamp: number) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload.toString('utf8')}`)
    .digest('hex');
}

function loadBillingServiceForTest(secret: string) {
  const previousEnv = { ...process.env };
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.STRIPE_WEBHOOK_SECRET = secret;

  const modulePath = require.resolve('../services/billingService');
  const stripeConfigPath = require.resolve('../config/stripeConfig');
  const supabaseClientPath = require.resolve('../config/supabaseClient');

  delete require.cache[modulePath];
  delete require.cache[stripeConfigPath];
  delete require.cache[supabaseClientPath];

  const billingService = require('../services/billingService') as typeof import('../services/billingService');

  return {
    billingService,
    restore() {
      process.env = previousEnv;
      delete require.cache[modulePath];
      delete require.cache[stripeConfigPath];
      delete require.cache[supabaseClientPath];
    }
  };
}

test('verifyStripeWebhookSignature accepts fresh signed payloads', () => {
  const secret = 'whsec_test_secret';
  const payload = Buffer.from(JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' }));
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildStripeSignature(secret, payload, timestamp);
  const header = `t=${timestamp},v1=${signature}`;
  const { billingService, restore } = loadBillingServiceForTest(secret);

  try {
    assert.equal(billingService.verifyStripeWebhookSignature(payload, header), true);
  } finally {
    restore();
  }
});

test('verifyStripeWebhookSignature rejects stale signed payloads', () => {
  const secret = 'whsec_test_secret';
  const payload = Buffer.from(JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' }));
  const timestamp = Math.floor(Date.now() / 1000) - 3600;
  const signature = buildStripeSignature(secret, payload, timestamp);
  const header = `t=${timestamp},v1=${signature}`;
  const { billingService, restore } = loadBillingServiceForTest(secret);

  try {
    assert.equal(billingService.verifyStripeWebhookSignature(payload, header), false);
  } finally {
    restore();
  }
});

test('shouldProcessStripeWebhookStatus skips already processed webhook events', () => {
  const { billingService, restore } = loadBillingServiceForTest('whsec_test_secret');

  try {
    assert.equal(billingService.shouldProcessStripeWebhookStatus('processed'), false);
    assert.equal(billingService.shouldProcessStripeWebhookStatus('duplicate'), false);
    assert.equal(billingService.shouldProcessStripeWebhookStatus('failed'), true);
    assert.equal(billingService.shouldProcessStripeWebhookStatus('received'), true);
  } finally {
    restore();
  }
});
