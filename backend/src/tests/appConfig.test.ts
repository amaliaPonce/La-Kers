import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppConfig, isOriginAllowed } from '../config/appConfig';

test('createAppConfig requires explicit CORS origins in production', () => {
  assert.throws(
    () =>
      createAppConfig({
        NODE_ENV: 'production'
      }),
    /CORS_ALLOWED_ORIGINS/
  );
});

test('createAppConfig parses production env overrides', () => {
  const config = createAppConfig({
    NODE_ENV: 'production',
    MINIMAL_MODE: 'false',
    PORT: '8080',
    APP_BASE_URL: 'https://api.example.com/',
    CORS_ALLOWED_ORIGINS: 'https://app.example.com, https://admin.example.com/',
    ENABLE_CRON_JOBS: 'false',
    ENABLE_TENANT_PORTAL: 'true',
    ENABLE_DASHBOARD_REALTIME: 'true',
    TRUST_PROXY: 'true',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '120',
    AUTH_RATE_LIMIT_WINDOW_MS: '30000',
    AUTH_RATE_LIMIT_MAX: '5',
    REQUEST_BODY_LIMIT: '512kb',
    CLERK_USER_CACHE_TTL_MS: '45000',
    ENABLE_PAYMENT_AUTOMATIONS: 'true',
    EMAIL_PROVIDER: 'resend',
    EMAIL_FROM: 'La-Kers <noreply@example.com>',
    EMAIL_REPLY_TO: 'support@example.com',
    RESEND_API_KEY: 're_test',
    PAYMENT_REMINDER_DAYS_BEFORE_DUE: '5',
    LATE_PAYMENT_OWNER_REMINDER_EVERY_DAYS: '9'
  });

  assert.equal(config.port, 8080);
  assert.equal(config.appBaseUrl, 'https://api.example.com');
  assert.equal(config.minimalMode, false);
  assert.deepEqual(config.allowedOrigins, ['https://app.example.com', 'https://admin.example.com']);
  assert.equal(config.enableCronJobs, false);
  assert.equal(config.enableTenantPortal, true);
  assert.equal(config.enableDashboardRealtime, true);
  assert.equal(config.clerkUserCacheTtlMs, 45000);
  assert.equal(config.trustProxy, true);
  assert.equal(config.globalRateLimitWindowMs, 60000);
  assert.equal(config.globalRateLimitMax, 120);
  assert.equal(config.authRateLimitWindowMs, 30000);
  assert.equal(config.authRateLimitMax, 5);
  assert.equal(config.requestBodyLimit, '512kb');
  assert.equal(config.enablePaymentAutomations, true);
  assert.equal(config.emailProvider, 'resend');
  assert.equal(config.emailFrom, 'La-Kers <noreply@example.com>');
  assert.equal(config.emailReplyTo, 'support@example.com');
  assert.equal(config.resendApiKey, 're_test');
  assert.equal(config.paymentReminderDaysBeforeDue, 5);
  assert.equal(config.latePaymentOwnerReminderEveryDays, 9);
});

test('isOriginAllowed accepts exact matches and requests without origin', () => {
  assert.equal(isOriginAllowed(undefined, ['https://app.example.com']), true);
  assert.equal(isOriginAllowed('https://app.example.com/', ['https://app.example.com']), true);
  assert.equal(isOriginAllowed('https://evil.example.com', ['https://app.example.com']), false);
});

test('createAppConfig enables minimal defaults when no flags are provided', () => {
  const config = createAppConfig({
    NODE_ENV: 'development'
  });

  assert.equal(config.minimalMode, true);
  assert.equal(config.enableCronJobs, false);
  assert.equal(config.enableTenantPortal, false);
  assert.equal(config.enableDashboardRealtime, false);
  assert.equal(config.clerkUserCacheTtlMs, 300000);
  assert.equal(config.enablePaymentAutomations, false);
  assert.equal(config.emailProvider, 'noop');
  assert.equal(config.paymentReminderDaysBeforeDue, 3);
  assert.equal(config.latePaymentOwnerReminderEveryDays, 7);
});
