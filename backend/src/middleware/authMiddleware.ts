import { NextFunction, Request, Response } from 'express';
import { appConfig } from '../config/appConfig';
import { ensureTenantPortalAccess, getClerkPortalRole } from '../services/tenantPortalService';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string | null;
    sessionClaims?: Record<string, unknown> | null;
  };
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

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    return res.status(503).json({ message: 'Falta configurar CLERK_SECRET_KEY en backend/.env' });
  }
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  const requestedPortalHeader = String(req.headers['x-la-kers-portal'] ?? '').trim().toLowerCase();
  const requestedPortal = req.path.startsWith('/tenant-portal') || requestedPortalHeader === 'tenant' ? 'tenant' : 'owner';

  try {
    if (requestedPortal === 'tenant') {
      if (!appConfig.enableTenantPortal) {
        return res.status(404).json({ message: 'El portal del inquilino está desactivado en este entorno' });
      }

      const access = await ensureTenantPortalAccess(userId);
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
      const portalRole = await getClerkPortalRole(userId).catch(() => '');
      if (portalRole === 'tenant') {
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
