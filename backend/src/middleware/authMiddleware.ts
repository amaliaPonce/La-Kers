import { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { appConfig } from '../config/appConfig';
import { ensureTenantPortalAccess, hasTenantPortalAccess } from '../services/tenantPortalService';

type ClerkAuthState = {
  userId?: string | null;
  sessionClaims?: Record<string, unknown> | null;
  reason?: string | null;
};

export interface AuthenticatedRequest extends Request {
  auth?: unknown;
  authUser?: {
    id: string;
  };
  authActor?: {
    authUserId: string;
    actorType: 'OWNER' | 'TENANT' | 'ADMIN' | 'SYSTEM';
    actorRef: string;
    ownerId: string;
    tenantPersonId?: string | null;
    portal: 'owner' | 'tenant';
  };
}

function resolveClerkAuth(req: AuthenticatedRequest): ClerkAuthState {
  if (typeof req.auth === 'function') {
    return req.auth() as ClerkAuthState;
  }

  try {
    return getAuth(req) as ClerkAuthState;
  } catch {
    return (req.auth ?? {}) as ClerkAuthState;
  }
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    return res.status(503).json({ message: 'Falta configurar CLERK_SECRET_KEY en backend/.env' });
  }
  const clerkAuth = resolveClerkAuth(req);
  const userId = clerkAuth.userId;
  if (!userId) {
    const authHeader = String(req.headers.authorization ?? '').trim();
    const hasBearerToken = authHeader.toLowerCase().startsWith('bearer ') && authHeader.length > 'bearer '.length;
    const hasClerkCookie = String(req.headers.cookie ?? '').includes('__session');

    if (hasBearerToken || hasClerkCookie) {
      return res.status(401).json({
        message:
          'Token de sesión inválido o no verificable. Revisa que el frontend y el backend usen las claves del mismo proyecto Clerk (VITE_CLERK_PUBLISHABLE_KEY / CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY).',
        code: 'AUTH_INVALID',
        reason: clerkAuth.reason ?? 'unknown'
      });
    }

    return res.status(401).json({ message: 'Autenticación requerida', code: 'AUTH_REQUIRED' });
  }

  const requestedPortalHeader = String(req.headers['x-la-kers-portal'] ?? '').trim().toLowerCase();
  const requestedPortal = req.path.startsWith('/tenant-portal') || requestedPortalHeader === 'tenant' ? 'tenant' : 'owner';
  const tenantInviteToken = String(req.headers['x-la-kers-tenant-invite'] ?? '').trim();

  try {
    if (requestedPortal === 'tenant') {
      if (!appConfig.enableTenantPortal) {
        return res.status(404).json({ message: 'El portal del inquilino está desactivado en este entorno' });
      }

      const access = await ensureTenantPortalAccess(userId, {
        inviteToken: tenantInviteToken
      });
      req.authActor = {
        authUserId: userId,
        actorType: 'TENANT',
        actorRef: access.tenant_person_id,
        ownerId: access.owner_id,
        tenantPersonId: access.tenant_person_id,
        portal: 'tenant'
      };
      req.authUser = undefined;
      return next();
    }

    if (appConfig.enableTenantPortal) {
      const isTenantAccount = await hasTenantPortalAccess(userId).catch(() => false);
      if (isTenantAccount) {
        return res.status(403).json({ message: 'Esta cuenta solo tiene acceso al portal del inquilino' });
      }
    }

    req.authUser = { id: userId };
    req.authActor = {
      authUserId: userId,
      actorType: 'OWNER',
      actorRef: userId,
      ownerId: userId,
      portal: 'owner'
    };
    return next();
  } catch (error) {
    const status = (error as any)?.status ?? 403;
    return res.status(status).json({ message: String((error as any)?.message ?? 'No tienes acceso a este portal') });
  }
}
