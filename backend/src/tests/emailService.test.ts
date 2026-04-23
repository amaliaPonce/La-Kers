import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmailService } from '../services/emailService';

test('createEmailService degrades to noop when resend is selected without api key', async () => {
  const emailClient = createEmailService({
    emailProvider: 'resend',
    emailFrom: 'La-Kers <noreply@example.com>',
    emailReplyTo: '',
    resendApiKey: ''
  });

  const result = await emailClient.sendEmail({
    to: 'tenant@example.com',
    subject: 'Test',
    html: '<p>Hola</p>'
  });

  assert.equal(emailClient.provider, 'noop');
  assert.deepEqual(result, {
    status: 'skipped',
    provider: 'noop',
    reason: 'RESEND_API_KEY is not configured'
  });
});
