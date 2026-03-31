import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getDashboardSummary } from '../services/dashboardService';
import { openDashboardStream } from '../services/dashboardRealtime';

const router = Router();

router.get('/stream', async (req: AuthenticatedRequest, res) => {
  const ownerId = req.authUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  const closeStream = openDashboardStream(ownerId, res);
  req.on('close', closeStream);
  res.on('close', closeStream);
});

router.get('/summary', async (req: AuthenticatedRequest, res) => {
  const ownerId = req.authUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  try {
    const summary = await getDashboardSummary(ownerId);
    res.json(summary);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudo cargar el resumen del panel' });
  }
});

export default router;
