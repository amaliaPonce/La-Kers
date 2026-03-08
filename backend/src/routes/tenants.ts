import { Router } from 'express';
import {
  createTenant,
  finalizeTenantContract,
  listTenants,
  updateTenant,
  type TenantListMode,
  type TenantPayload
} from '../services/tenantsService';

const router = Router();

function formatDateValue(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function normalizeTenant(payload: any, partial = false): Partial<TenantPayload> {
  const tenant: Partial<TenantPayload> = {};
  if (!partial || payload.unit_id !== undefined) {
    tenant.unit_id = String(payload.unit_id ?? '');
  }
  if (!partial || payload.full_name !== undefined) {
    tenant.full_name = String(payload.full_name ?? '');
  }
  if (!partial || payload.identification !== undefined) {
    tenant.identification = String(payload.identification ?? '');
  }
  if (!partial || payload.contract_start !== undefined) {
    tenant.contract_start = formatDateValue(payload.contract_start) ?? '';
  }
  if (!partial || payload.contract_end !== undefined) {
    tenant.contract_end = formatDateValue(payload.contract_end) ?? '';
  }
  return tenant;
}

function validateTenant(payload: Partial<TenantPayload>, options: { partial?: boolean } = {}) {
  const errors: string[] = [];
  const { partial = false } = options;

  if (!partial || payload.unit_id !== undefined) {
    if (!payload.unit_id || typeof payload.unit_id !== 'string') {
      errors.push('La unidad es obligatoria');
    }
  }
  if (!partial || payload.full_name !== undefined) {
    if (!payload.full_name || typeof payload.full_name !== 'string') {
      errors.push('El nombre completo es obligatorio');
    }
  }
  if (!partial || payload.identification !== undefined) {
    if (!payload.identification || typeof payload.identification !== 'string') {
      errors.push('El DNI es obligatorio');
    }
  }
  if (!partial || payload.contract_start !== undefined) {
    if (!payload.contract_start || typeof payload.contract_start !== 'string') {
      errors.push('Fecha de inicio inválida');
    }
  }
  if (!partial || payload.contract_end !== undefined) {
    if (!payload.contract_end || typeof payload.contract_end !== 'string') {
      errors.push('Fecha de fin inválida');
    }
  }

  return errors;
}

router.get('/', async (req, res) => {
  try {
    const statusParam = String(req.query.status ?? 'active').toLowerCase();
    const mode: TenantListMode =
      statusParam === 'archived' ? 'archived' : statusParam === 'all' ? 'all' : 'active';
    const tenants = await listTenants({ mode });
    res.json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load tenants' });
  }
});

router.post('/', async (req, res) => {
  const payload = normalizeTenant(req.body);
  const errors = validateTenant(payload);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const tenant = await createTenant(payload as TenantPayload);
    res.status(201).json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create tenant' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = normalizeTenant(req.body, true);
  const errors = validateTenant(payload, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const tenant = await updateTenant(id, payload);
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update tenant' });
  }
});

router.patch('/:id/finalize', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tenant = await finalizeTenantContract(req.params.id, today);
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to finalize tenant contract' });
  }
});

export default router;
