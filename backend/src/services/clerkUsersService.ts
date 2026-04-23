import { clerkClient } from '@clerk/express';
import { appConfig } from '../config/appConfig';

type ClerkEmailAddress = {
  emailAddress?: string | null;
  id?: string | null;
};

export type ClerkUserRecord = {
  primaryEmailAddressId?: string | null;
  emailAddresses?: ClerkEmailAddress[] | null;
  unsafeMetadata?: Record<string, unknown> | null;
};

type CachedClerkUser = {
  expiresAt: number;
  value: ClerkUserRecord;
};

const clerkUserCache = new Map<string, CachedClerkUser>();

function normalizeEmail(value: string | null | undefined) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized || null;
}

export async function getClerkUser(clerkUserId: string): Promise<ClerkUserRecord> {
  const normalizedUserId = String(clerkUserId ?? '').trim();
  if (!normalizedUserId) {
    throw new Error('Clerk user id is required');
  }

  const now = Date.now();
  const cached = clerkUserCache.get(normalizedUserId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const user = (await clerkClient.users.getUser(normalizedUserId)) as ClerkUserRecord;
  clerkUserCache.set(normalizedUserId, {
    value: user,
    expiresAt: now + appConfig.clerkUserCacheTtlMs
  });
  return user;
}

export async function getClerkPrimaryEmail(clerkUserId: string): Promise<string | null> {
  const user = await getClerkUser(clerkUserId);
  const emailAddresses = Array.isArray(user.emailAddresses) ? user.emailAddresses : [];
  const primary = emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ?? emailAddresses[0];
  return normalizeEmail(primary?.emailAddress);
}

export function clearClerkUserCache() {
  clerkUserCache.clear();
}
