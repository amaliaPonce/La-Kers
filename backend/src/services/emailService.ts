import { appConfig, AppConfig } from '../config/appConfig';

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};

export type EmailTag = {
  name: string;
  value: string;
};

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | null;
  attachments?: EmailAttachment[];
  tags?: EmailTag[];
  idempotencyKey?: string;
};

export type EmailSendResult =
  | {
      status: 'sent';
      provider: 'resend';
      messageId: string | null;
    }
  | {
      status: 'skipped';
      provider: 'noop';
      reason: string;
    };

export type EmailService = {
  provider: 'noop' | 'resend';
  sendEmail(payload: EmailPayload): Promise<EmailSendResult>;
};

type FetchLike = typeof fetch;

function normalizeRecipients(value: string | string[]) {
  const recipients = Array.isArray(value) ? value : [value];
  return recipients.map((recipient) => String(recipient ?? '').trim()).filter(Boolean);
}

function toBase64Content(value: Buffer | string) {
  if (Buffer.isBuffer(value)) {
    return value.toString('base64');
  }
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function createNoopEmailService(reason: string): EmailService {
  return {
    provider: 'noop',
    async sendEmail() {
      console.warn(`[email][noop] ${reason}`);
      return {
        status: 'skipped',
        provider: 'noop',
        reason
      };
    }
  };
}

export function createEmailService(
  config: Pick<AppConfig, 'emailProvider' | 'emailFrom' | 'emailReplyTo' | 'resendApiKey'> = appConfig,
  fetchImpl: FetchLike = fetch
): EmailService {
  if (config.emailProvider !== 'resend') {
    return createNoopEmailService('EMAIL_PROVIDER=noop');
  }

  if (!config.emailFrom) {
    return createNoopEmailService('EMAIL_FROM is not configured');
  }

  if (!config.resendApiKey) {
    return createNoopEmailService('RESEND_API_KEY is not configured');
  }

  return {
    provider: 'resend',
    async sendEmail(payload) {
      const recipients = normalizeRecipients(payload.to);
      if (!recipients.length) {
        return {
          status: 'skipped',
          provider: 'noop',
          reason: 'missing_recipient'
        };
      }

      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          'Content-Type': 'application/json',
          ...(payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : {})
        },
        body: JSON.stringify({
          from: config.emailFrom,
          to: recipients,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo ?? config.emailReplyTo ?? undefined,
          attachments: payload.attachments?.map((attachment) => ({
            filename: attachment.filename,
            content: toBase64Content(attachment.content),
            content_type: attachment.contentType
          })),
          tags: payload.tags
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof data?.message === 'string'
            ? data.message
            : typeof data?.error?.message === 'string'
              ? data.error.message
              : 'Email provider request failed';
        const error = new Error(message);
        (error as any).status = response.status;
        throw error;
      }

      return {
        status: 'sent',
        provider: 'resend',
        messageId: data?.id ? String(data.id) : null
      };
    }
  };
}

export const emailService = createEmailService();
