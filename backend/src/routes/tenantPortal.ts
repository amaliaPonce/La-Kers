import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getTenantPortalProfile } from '../services/tenantPortalService';

const router = Router();

router.get('/me', async (req: AuthenticatedRequest, res) => {
  const actor = req.authActor;
  if (!actor || actor.actorType !== 'TENANT' || !actor.authUserId) {
    return res.status(401).json({ message: 'Acceso de inquilino requerido' });
  }

  try {
    const profile = await getTenantPortalProfile(actor.authUserId);
    res.json(profile);
  } catch (error) {
    console.error(error);
    const status = (error as any)?.status ?? 500;
    res.status(status).json({ message: String((error as any)?.message ?? 'No se pudo cargar el portal del inquilino') });
  }
});

export default router;
