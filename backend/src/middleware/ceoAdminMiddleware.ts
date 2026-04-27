import { NextFunction, Response } from 'express';
import { clerkClient } from '@clerk/express';
import { appConfig } from '../config/appConfig';
import { AuthenticatedRequest } from './authMiddleware';
import { recordProductEvent } from '../services/analyticsEventsService';

type ClerkEmailAddress = {
  id?: string | null;
  emailAddress?: string | null;
};

type ClerkUserRecord = {
  primaryEmailAddressId?: string | null;
  emailAddresses?: ClerkEmailAddress[] | null;
};

const ceoEmailCache = new Map<string, { email: string | null; expiresAt: number }>();
const CEO_EMAIL_CACHE_TTL_MS = 60_000;
let primaryEmailResolver: (clerkUserId: string) => Promise<string | null> = getPrimaryEmailFromClerk;

function normalizeEmail(value?: string | null) {
  return String(value ?? '').trim().toLowerCase();
}

export async function getCeoPrimaryEmail(clerkUserId: string) {
  const cached = ceoEmailCache.get(clerkUserId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.email;
  }

  const user = (await clerkClient.users.getUser(clerkUserId)) as ClerkUserRecord;
  const emails = Array.isArray(user.emailAddresses) ? user.emailAddresses : [];
  const primary = emails.find((email) => email.id === user.primaryEmailAddressId) ?? emails[0];
  const email = normalizeEmail(primary?.emailAddress) || null;
  ceoEmailCache.set(clerkUserId, { email, expiresAt: Date.now() + CEO_EMAIL_CACHE_TTL_MS });
  return email;
}

async function getPrimaryEmailFromClerk(clerkUserId: string) {
  return getCeoPrimaryEmail(clerkUserId);
}

export function __setCeoPrimaryEmailResolverForTest(resolver?: (clerkUserId: string) => Promise<string | null>) {
  primaryEmailResolver = resolver ?? getPrimaryEmailFromClerk;
  ceoEmailCache.clear();
}

export async function isCeoAdminClerkUser(clerkUserId?: string | null) {
  const normalizedUserId = String(clerkUserId ?? '').trim();
  if (!normalizedUserId || !appConfig.ceoAdminEmails.length) return false;

  const primaryEmail = normalizeEmail(await primaryEmailResolver(normalizedUserId));
  return Boolean(primaryEmail && appConfig.ceoAdminEmails.includes(primaryEmail));
}

async function recordDenied(req: AuthenticatedRequest, reason: string) {
  await recordProductEvent({
    ownerId: req.authActor?.ownerId ?? req.authUser?.id ?? null,
    actorId: req.authActor?.actorRef ?? req.authUser?.id ?? null,
    actorType: req.authActor?.actorType ?? 'SYSTEM',
    eventName: 'ceo_access_denied',
    severity: 'danger',
    metadata: {
      reason,
      path: req.path
    }
  }).catch(() => undefined);
}

export async function requireCeoAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const allowedEmails = new Set(appConfig.ceoAdminEmails);
  if (!allowedEmails.size) {
    await recordDenied(req, 'missing_ceo_admin_emails');
    return res.status(503).json({ message: 'CEO_ADMIN_EMAILS no está configurado' });
  }

  if (!req.authActor || req.authActor.actorType !== 'OWNER' || !req.authActor.authUserId) {
    await recordDenied(req, 'not_owner_actor');
    return res.status(403).json({ message: 'Acceso CEO requerido' });
  }

  try {
    const primaryEmail = normalizeEmail(await primaryEmailResolver(req.authActor.authUserId));
    if (!primaryEmail || !allowedEmails.has(primaryEmail)) {
      await recordDenied(req, 'email_not_allowed');
      return res.status(403).json({ message: 'Acceso CEO requerido' });
    }

    req.authActor = {
      ...req.authActor,
      actorType: 'ADMIN',
      portal: 'owner'
    };
    return next();
  } catch {
    await recordDenied(req, 'clerk_lookup_failed');
    return res.status(403).json({ message: 'No se pudo verificar el acceso CEO' });
  }
}
