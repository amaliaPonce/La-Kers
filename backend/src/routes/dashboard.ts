import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getDashboardSummary } from '../services/dashboardService';

const router = Router();

router.get('/summary', async (req: AuthenticatedRequest, res) => {
  const ownerId = req.supabaseUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const summary = await getDashboardSummary(ownerId);
    res.json(summary);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'Unable to load dashboard summary' });
  }
});

export default router;
