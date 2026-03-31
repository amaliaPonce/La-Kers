import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, clearRateLimitStore } from '../middleware/rateLimit';

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };
}

test('rate limiter blocks requests above the configured threshold', () => {
  clearRateLimitStore();
  const middleware = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 2,
    message: 'Demasiadas solicitudes',
    keyPrefix: 'test'
  });

  let nextCalls = 0;
  const request = {
    method: 'GET',
    ip: '127.0.0.1',
    headers: {}
  };

  middleware(request as never, createMockResponse() as never, () => {
    nextCalls += 1;
  });
  middleware(request as never, createMockResponse() as never, () => {
    nextCalls += 1;
  });

  const blockedResponse = createMockResponse();
  middleware(request as never, blockedResponse as never, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(blockedResponse.statusCode, 429);
  assert.equal(blockedResponse.headers['Retry-After'], '60');
  assert.deepEqual(blockedResponse.body, { message: 'Demasiadas solicitudes' });
});
