import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { recordProductEvent } from '../services/analyticsEventsService';

const router = Router();
const allowedClientEvents = new Set(['signup_completed', 'login_completed']);

router.post('/events', async (req: AuthenticatedRequest, res) => {
  const eventName = String(req.body?.eventName ?? '').trim();
  if (!allowedClientEvents.has(eventName)) {
    return res.status(400).json({ message: 'Evento no permitido' });
  }

  const actor = req.authActor;
  if (!actor || actor.actorType !== 'OWNER') {
    return res.status(403).json({ message: 'Acceso owner requerido' });
  }

  await recordProductEvent({
    ownerId: actor.ownerId,
    actorId: actor.actorRef,
    actorType: 'OWNER',
    eventName,
    metadata: {
      source: 'frontend'
    }
  }).catch(() => undefined);

  return res.status(202).json({ accepted: true });
});

export default router;
