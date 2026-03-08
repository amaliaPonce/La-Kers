import { Router } from 'express';
import {
  createIncident,
  deleteIncident,
  listIncidents,
  updateIncident
} from '../services/incidentsService';

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

router.get('/', async (req, res) => {
  try {
    const incidents = await listIncidents();
    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load incidents' });
  }
});

router.post('/', async (req, res) => {
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
    const incident = await createIncident(payload);
    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create incident' });
  }
});

router.put('/:id', async (req, res) => {
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
    const incident = await updateIncident(req.params.id, payload);
    res.json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update incident' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteIncident(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete incident' });
  }
});

export default router;
