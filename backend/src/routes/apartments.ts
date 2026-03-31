import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createApartment, deleteApartment, listApartments, updateApartment } from '../services/apartmentsService';
import { notifyDashboardUpdated } from '../services/dashboardRealtime';

const router = Router();

const allowedStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];

function getOwnerId(req: AuthenticatedRequest) {
  return req.authUser?.id;
}

const normalizeOptionalText = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized || null;
};

function normalizeApartment(payload: any, options: { partial?: boolean } = {}) {
  const { partial = false } = options;
  const normalized: Record<string, unknown> = {};

  if (!partial || payload.name !== undefined) {
    normalized.name = String(payload?.name ?? '').trim();
  }

  if (!partial || payload.monthly_rent !== undefined) {
    const rent = Number(payload?.monthly_rent);
    normalized.monthly_rent = Number.isFinite(rent) ? rent : payload?.monthly_rent;
  }

  if (!partial || payload.status !== undefined) {
    normalized.status = String(payload?.status ?? '').trim().toUpperCase();
  }

  if (!partial || payload.address !== undefined) {
    normalized.address = normalizeOptionalText(payload?.address);
  }

  if (!partial || payload.city !== undefined) {
    normalized.city = normalizeOptionalText(payload?.city);
  }

  if (!partial || payload.postal_code !== undefined) {
    normalized.postal_code = normalizeOptionalText(payload?.postal_code);
  }

  if (!partial || payload.contract_landlord_name !== undefined) {
    normalized.contract_landlord_name = normalizeOptionalText(payload?.contract_landlord_name);
  }

  if (!partial || payload.contract_landlord_identification !== undefined) {
    normalized.contract_landlord_identification = normalizeOptionalText(payload?.contract_landlord_identification);
  }

  if (!partial || payload.contract_landlord_address !== undefined) {
    normalized.contract_landlord_address = normalizeOptionalText(payload?.contract_landlord_address);
  }

  return normalized;
}

function validateApartment(payload: Record<string, unknown>, options: { partial?: boolean } = {}) {
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
    if (typeof payload.status !== 'string' || !allowedStatuses.includes(payload.status)) {
      errors.push('Estado inválido');
    }
  }

  const contractFields = [
    payload.contract_landlord_name,
    payload.contract_landlord_identification,
    payload.contract_landlord_address
  ].map((value) => String(value ?? '').trim());
  const hasAnyContractField = contractFields.some(Boolean);
  const hasAllContractFields = contractFields.every(Boolean);

  if (hasAnyContractField && !hasAllContractFields) {
    errors.push('Completa nombre, DNI/NIF y domicilio para contratos o deja los tres vacíos');
  }

  return errors;
}

function resolveApartmentPersistenceError(error: unknown, fallbackMessage: string) {
  const status = Number((error as { status?: number })?.status);
  const code = String((error as { code?: string })?.code ?? '');
  const rawMessage = String((error as { message?: string })?.message ?? '');
  const normalizedMessage = rawMessage.toLowerCase();

  if (Number.isInteger(status) && status >= 400 && status < 600) {
    return {
      status,
      message: rawMessage || fallbackMessage
    };
  }

  if (
    normalizedMessage.includes('invalid input syntax for type uuid') ||
    normalizedMessage.includes('units_owner_id_fkey') ||
    normalizedMessage.includes('owner_id')
  ) {
    return {
      status: 409,
      message: 'La base de datos sigue con el esquema anterior de usuarios. Aplica sql/20260327_clerk_owner_ids.sql y vuelve a intentarlo.'
    };
  }

  if (code === '23505') {
    return {
      status: 409,
      message: 'Ya existe una propiedad con esos datos clave.'
    };
  }

  return {
    status: 500,
    message: fallbackMessage
  };
}

router.get('/', async (req: AuthenticatedRequest, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  try {
    const apartments = await listApartments(ownerId);
    res.json(apartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'No se pudieron cargar los apartamentos' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const payload = normalizeApartment(req.body);
  const errors = validateApartment(payload);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const apartment = await createApartment(ownerId, payload as any);
    notifyDashboardUpdated(ownerId, 'apartments.created');
    res.status(201).json(apartment);
  } catch (error) {
    console.error(error);
    const resolved = resolveApartmentPersistenceError(error, 'No se pudo crear el apartamento');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const payload = normalizeApartment(req.body, { partial: true });
  const errors = validateApartment(payload, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const apartment = await updateApartment(ownerId, id, payload as any);
    notifyDashboardUpdated(ownerId, 'apartments.updated');
    res.json(apartment);
  } catch (error) {
    console.error(error);
    const resolved = resolveApartmentPersistenceError(error, 'No se pudo actualizar el apartamento');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    await deleteApartment(ownerId, id);
    notifyDashboardUpdated(ownerId, 'apartments.deleted');
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'No se pudo eliminar el apartamento' });
  }
});

export default router;
