import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  createIncident,
  deleteIncident,
  listIncidents,
  updateIncident
} from '../services/incidentsService';
import { notifyDashboardUpdated } from '../services/dashboardRealtime';

const router = Router();
const allowedStatus = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

function validateIncident(payload: Record<string, unknown>, options: { partial?: boolean } = {}) {
  const errors: string[] = [];
  const { partial = false } = options;

  if (!partial || payload.unit_id !== undefined) {
    if (!payload.unit_id || typeof payload.unit_id !== 'string') {
      errors.push('Unidad inválida');
    }
  }
  if (!partial || payload.title !== undefined) {
    if (!payload.title || typeof payload.title !== 'string') {
      errors.push('Título inválido');
    }
  }
  if (!partial || payload.description !== undefined) {
    if (!payload.description || typeof payload.description !== 'string') {
      errors.push('Descripción inválida');
    }
  }
  if (!partial || payload.status !== undefined) {
    if (!allowedStatus.includes(payload.status as string)) {
      errors.push('Estado inválido');
    }
  }
  if (!partial || payload.cost !== undefined) {
    if (payload.cost !== undefined && payload.cost !== null && (typeof payload.cost !== 'number' || payload.cost < 0)) {
      errors.push('Costo inválido');
    }
  }

  return errors;
}

router.get('/', async (req: AuthenticatedRequest, res) => {
  const ownerId = req.authUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  try {
    const incidents = await listIncidents(ownerId);
    res.json(incidents);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudieron cargar las incidencias' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const payload = {
    unit_id: req.body.unit_id,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    cost: req.body.cost !== undefined ? Number(req.body.cost) : undefined
  };
  const errors = validateIncident(payload);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const incident = await createIncident(ownerId, payload);
    notifyDashboardUpdated(ownerId, 'incidents.created');
    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudo crear la incidencia' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res) => {
  const payload: Record<string, unknown> = {};
  if (req.body.unit_id !== undefined) {
    payload.unit_id = req.body.unit_id;
  }
  if (req.body.title !== undefined) {
    payload.title = req.body.title;
  }
  if (req.body.description !== undefined) {
    payload.description = req.body.description;
  }
  if (req.body.status !== undefined) {
    payload.status = req.body.status;
  }
  if (req.body.cost !== undefined) {
    payload.cost = Number(req.body.cost);
  }
  const errors = validateIncident(payload, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const incident = await updateIncident(ownerId, req.params.id, payload);
    notifyDashboardUpdated(ownerId, 'incidents.updated');
    res.json(incident);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudo actualizar la incidencia' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    await deleteIncident(ownerId, req.params.id);
    notifyDashboardUpdated(ownerId, 'incidents.deleted');
    res.status(204).end();
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudo eliminar la incidencia' });
  }
});

export default router;
