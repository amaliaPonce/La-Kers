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
    PORT: '8080',
    APP_BASE_URL: 'https://api.example.com/',
    CORS_ALLOWED_ORIGINS: 'https://app.example.com, https://admin.example.com/',
    ENABLE_CRON_JOBS: 'false',
    TRUST_PROXY: 'true',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '120',
    AUTH_RATE_LIMIT_WINDOW_MS: '30000',
    AUTH_RATE_LIMIT_MAX: '5',
    REQUEST_BODY_LIMIT: '512kb'
  });

  assert.equal(config.port, 8080);
  assert.equal(config.appBaseUrl, 'https://api.example.com');
  assert.deepEqual(config.allowedOrigins, ['https://app.example.com', 'https://admin.example.com']);
  assert.equal(config.enableCronJobs, false);
  assert.equal(config.trustProxy, true);
  assert.equal(config.globalRateLimitWindowMs, 60000);
  assert.equal(config.globalRateLimitMax, 120);
  assert.equal(config.authRateLimitWindowMs, 30000);
  assert.equal(config.authRateLimitMax, 5);
  assert.equal(config.requestBodyLimit, '512kb');
});

test('isOriginAllowed accepts exact matches and requests without origin', () => {
  assert.equal(isOriginAllowed(undefined, ['https://app.example.com']), true);
  assert.equal(isOriginAllowed('https://app.example.com/', ['https://app.example.com']), true);
  assert.equal(isOriginAllowed('https://evil.example.com', ['https://app.example.com']), false);
});
