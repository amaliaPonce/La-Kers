import { Router } from 'express';
import { createApartment, deleteApartment, listApartments, updateApartment } from '../services/apartmentsService';

const router = Router();

const allowedStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];

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

router.get('/', async (req, res) => {
  try {
    const apartments = await listApartments();
    res.json(apartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load apartments' });
  }
});

router.post('/', async (req, res) => {
  const errors = validateApartment(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const apartment = await createApartment(req.body);
    res.status(201).json(apartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create apartment' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const errors = validateApartment(req.body, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const apartment = await updateApartment(id, req.body);
    res.json(apartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update apartment' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteApartment(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete apartment' });
  }
});

export default router;
