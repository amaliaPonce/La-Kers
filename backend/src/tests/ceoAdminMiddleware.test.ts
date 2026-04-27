import test from 'node:test';
import assert from 'node:assert/strict';

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

function loadCeoMiddlewareForTest(options: { ceoEmails?: string; clerkEmail?: string | null }) {
  const previousEnv = { ...process.env };
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.CEO_ADMIN_EMAILS = options.ceoEmails ?? '';

  const middlewarePath = require.resolve('../middleware/ceoAdminMiddleware');
  const appConfigPath = require.resolve('../config/appConfig');
  const analyticsPath = require.resolve('../services/analyticsEventsService');
  const supabaseClientPath = require.resolve('../config/supabaseClient');
  delete require.cache[middlewarePath];
  delete require.cache[appConfigPath];
  delete require.cache[analyticsPath];
  delete require.cache[supabaseClientPath];

  const middleware = require('../middleware/ceoAdminMiddleware') as typeof import('../middleware/ceoAdminMiddleware');
  middleware.__setCeoPrimaryEmailResolverForTest(async () => options.clerkEmail ?? null);

  return {
    requireCeoAdmin: middleware.requireCeoAdmin,
    restore() {
      process.env = previousEnv;
      middleware.__setCeoPrimaryEmailResolverForTest();
      delete require.cache[middlewarePath];
      delete require.cache[appConfigPath];
      delete require.cache[analyticsPath];
      delete require.cache[supabaseClientPath];
    }
  };
}

test('requireCeoAdmin allows exact configured Clerk email', async () => {
  const { requireCeoAdmin, restore } = loadCeoMiddlewareForTest({
    ceoEmails: 'ceo@example.com',
    clerkEmail: 'CEO@example.com'
  });
  const request = {
    path: '/summary',
    authUser: { id: 'user_ceo' },
    authActor: {
      authUserId: 'user_ceo',
      actorType: 'OWNER',
      actorRef: 'user_ceo',
      ownerId: 'user_ceo',
      portal: 'owner'
    }
  };
  const response = createMockResponse();
  let nextCalls = 0;

  try {
    await requireCeoAdmin(request as never, response as never, () => {
      nextCalls += 1;
    });

    assert.equal(nextCalls, 1);
    assert.equal(response.statusCode, 200);
    assert.equal((request as any).authActor.actorType, 'ADMIN');
  } finally {
    restore();
  }
});

test('requireCeoAdmin rejects non CEO emails', async () => {
  const { requireCeoAdmin, restore } = loadCeoMiddlewareForTest({
    ceoEmails: 'ceo@example.com',
    clerkEmail: 'owner@example.com'
  });
  const request = {
    path: '/summary',
    authUser: { id: 'user_owner' },
    authActor: {
      authUserId: 'user_owner',
      actorType: 'OWNER',
      actorRef: 'user_owner',
      ownerId: 'user_owner',
      portal: 'owner'
    }
  };
  const response = createMockResponse();
  let nextCalls = 0;

  try {
    await requireCeoAdmin(request as never, response as never, () => {
      nextCalls += 1;
    });

    assert.equal(nextCalls, 0);
    assert.equal(response.statusCode, 403);
  } finally {
    restore();
  }
});

test('requireCeoAdmin rejects tenant actors', async () => {
  const { requireCeoAdmin, restore } = loadCeoMiddlewareForTest({
    ceoEmails: 'ceo@example.com',
    clerkEmail: 'ceo@example.com'
  });
  const request = {
    path: '/summary',
    authActor: {
      authUserId: 'tenant_user',
      actorType: 'TENANT',
      actorRef: 'tenant_person',
      ownerId: 'owner_1',
      tenantPersonId: 'tenant_person',
      portal: 'tenant'
    }
  };
  const response = createMockResponse();
  let nextCalls = 0;

  try {
    await requireCeoAdmin(request as never, response as never, () => {
      nextCalls += 1;
    });

    assert.equal(nextCalls, 0);
    assert.equal(response.statusCode, 403);
  } finally {
    restore();
  }
});

test('requireCeoAdmin fails closed when CEO_ADMIN_EMAILS is missing', async () => {
  const { requireCeoAdmin, restore } = loadCeoMiddlewareForTest({
    ceoEmails: '',
    clerkEmail: 'ceo@example.com'
  });
  const request = {
    path: '/summary',
    authUser: { id: 'user_ceo' },
    authActor: {
      authUserId: 'user_ceo',
      actorType: 'OWNER',
      actorRef: 'user_ceo',
      ownerId: 'user_ceo',
      portal: 'owner'
    }
  };
  const response = createMockResponse();

  try {
    await requireCeoAdmin(request as never, response as never, () => undefined);
    assert.equal(response.statusCode, 503);
  } finally {
    restore();
  }
});
