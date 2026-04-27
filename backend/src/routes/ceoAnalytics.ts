import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireCeoAdmin } from '../middleware/ceoAdminMiddleware';
import {
  exportCeoAnalyticsCsv,
  getCeoAnalyticsSummary,
  listCeoEvents,
  listCeoTenants,
  parseAnalyticsFilters,
  parsePagination
} from '../services/ceoAnalyticsService';

const router = Router();

router.use(requireCeoAdmin);

function resolveError(error: unknown, fallbackMessage: string) {
  return {
    status: (error as { status?: number })?.status ?? 500,
    message: String((error as { message?: string })?.message ?? fallbackMessage)
  };
}

router.get('/summary', async (req: AuthenticatedRequest, res) => {
  try {
    const filters = parseAnalyticsFilters(req.query as Record<string, unknown>);
    const summary = await getCeoAnalyticsSummary(filters);
    res.json(summary);
  } catch (error) {
    console.error(error);
    const resolved = resolveError(error, 'No se pudo cargar el panel CEO');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.get('/tenants', async (req: AuthenticatedRequest, res) => {
  try {
    const filters = parseAnalyticsFilters(req.query as Record<string, unknown>);
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const tenants = await listCeoTenants(filters, pagination);
    res.json(tenants);
  } catch (error) {
    console.error(error);
    const resolved = resolveError(error, 'No se pudieron cargar los tenants');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.get('/events', async (req: AuthenticatedRequest, res) => {
  try {
    const filters = parseAnalyticsFilters(req.query as Record<string, unknown>);
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const events = await listCeoEvents(filters, pagination, String(req.query.severity ?? ''));
    res.json(events);
  } catch (error) {
    console.error(error);
    const resolved = resolveError(error, 'No se pudieron cargar los eventos');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.get('/export.csv', async (req: AuthenticatedRequest, res) => {
  try {
    const filters = parseAnalyticsFilters(req.query as Record<string, unknown>);
    const section = String(req.query.section ?? 'summary');
    const csv = await exportCeoAnalyticsCsv(filters, section);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ceo-analytics-${section}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    const resolved = resolveError(error, 'No se pudo exportar el CSV');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

export default router;
