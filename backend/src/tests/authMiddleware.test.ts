import test from 'node:test';
import assert from 'node:assert/strict';
import { authMiddleware } from '../middleware/authMiddleware';

function createMockResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
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

test('auth middleware resolves Clerk v2 auth function before requiring userId', async () => {
  const originalClerkSecret = process.env.CLERK_SECRET_KEY;
  process.env.CLERK_SECRET_KEY = 'sk_test_example';

  const request = {
    method: 'POST',
    path: '/apartments',
    headers: {
      authorization: 'Bearer session-token'
    },
    auth: () => ({
      userId: 'user_123',
      sessionClaims: {}
    })
  };
  const response = createMockResponse();
  let nextCalls = 0;

  try {
    await authMiddleware(request as never, response as never, () => {
      nextCalls += 1;
    });

    assert.equal(nextCalls, 1);
    assert.equal(response.statusCode, 200);
    assert.deepEqual((request as any).authUser, { id: 'user_123' });
    assert.equal((request as any).authActor.ownerId, 'user_123');
  } finally {
    if (originalClerkSecret === undefined) {
      delete process.env.CLERK_SECRET_KEY;
    } else {
      process.env.CLERK_SECRET_KEY = originalClerkSecret;
    }
  }
});
