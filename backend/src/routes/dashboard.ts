import { Router } from 'express';
import { getDashboardSummary } from '../services/dashboardService';

const router = Router();

router.get('/summary', async (req, res) => {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load dashboard summary' });
  }
});

export default router;
