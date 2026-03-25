import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createApartment, deleteApartment, listApartments, updateApartment } from '../services/apartmentsService';
import { getPlanDefinition } from '../config/plans';

const router = Router();

const allowedStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];

function getOwnerId(req: AuthenticatedRequest) {
  return req.supabaseUser?.id;
}

function validateApartment(payload: any, options: { partial?: boolean } = {}) {
  const errors: string[] = [];
  const { partial = false } = options;

  if (!partial || payload.name !== undefined) {
    if (!payload?.name || typeof payload.name !== 'string') {
      errors.push('El nombre es obligatorio');
    }
  }

  if (!partial || payload.monthly_rent !== undefined) {
    if (typeof payload?.monthly_rent !== 'number' || payload.monthly_rent < 0) {
      errors.push('La renta debe ser mayor a 0');
    }
  }

  if (!partial || payload.status !== undefined) {
    if (!allowedStatuses.includes(payload?.status)) {
      errors.push('Estado inválido');
    }
  }

  return errors;
}

router.get('/', async (req: AuthenticatedRequest, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const apartments = await listApartments(ownerId);
    res.json(apartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load apartments' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const errors = validateApartment(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const planDefinition = getPlanDefinition(req.supabaseUser?.plan ?? undefined);
    const apartment = await createApartment(ownerId, req.body, planDefinition);
    res.status(201).json(apartment);
  } catch (error) {
    if ((error as any).status === 403) {
      const message = error instanceof Error ? error.message : 'Límite de plan alcanzado';
      return res.status(403).json({ message });
    }
    console.error(error);
    res.status(500).json({ message: 'Unable to create apartment' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const errors = validateApartment(req.body, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const apartment = await updateApartment(ownerId, id, req.body);
    res.json(apartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update apartment' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await deleteApartment(ownerId, id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete apartment' });
  }
});

export default router;
