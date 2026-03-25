import test from 'node:test';
import assert from 'node:assert/strict';
import { redactValue } from '../utils/errorLogger';

test('redactValue removes sensitive keys recursively', () => {
  const redacted = redactValue({
    email: 'owner@example.com',
    nested: {
      password: 'secret',
      token: 'abc123',
      safe: 'ok'
    },
    items: [
      {
        identification: '12345678Z'
      }
    ]
  }) as Record<string, unknown>;

  assert.equal(redacted.email, '[REDACTED]');
  assert.deepEqual(redacted.nested, {
    password: '[REDACTED]',
    token: '[REDACTED]',
    safe: 'ok'
  });
  assert.deepEqual(redacted.items, [{ identification: '[REDACTED]' }]);
});
