import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  createTenant,
  finalizeTenantContract,
  listTenants,
  updateTenant,
  type TenantListMode,
  type TenantPayload
} from '../services/tenantsService';
import { notifyDashboardUpdated } from '../services/dashboardRealtime';

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
    tenant.unit_id = String(payload.unit_id ?? '').trim();
  }
  if (!partial || payload.full_name !== undefined) {
    tenant.full_name = String(payload.full_name ?? '').trim();
  }
  if (!partial || payload.identification !== undefined) {
    tenant.identification = String(payload.identification ?? '').trim();
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
  if (payload.contract_start && payload.contract_end) {
    const startDate = new Date(payload.contract_start);
    const endDate = new Date(payload.contract_end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate < startDate) {
      errors.push('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
  }

  return errors;
}

function resolveTenantError(error: unknown, fallbackMessage: string) {
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

  if (code === '23514' || normalizedMessage.includes('tenant_contract_dates_check')) {
    return {
      status: 400,
      message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
    };
  }

  if (normalizedMessage.includes('tenant no encontrado')) {
    return {
      status: 404,
      message: 'Inquilino no encontrado'
    };
  }

  return {
    status: 500,
    message: fallbackMessage
  };
}

router.get('/', async (req: AuthenticatedRequest, res) => {
  const ownerId = req.authUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  try {
    const statusParam = String(req.query.status ?? 'active').toLowerCase();
    const mode: TenantListMode = statusParam === 'archived' ? 'archived' : statusParam === 'all' ? 'all' : 'active';
    const tenants = await listTenants(ownerId, { mode });
    res.json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'No se pudieron cargar los inquilinos' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const payload = normalizeTenant(req.body);
  const errors = validateTenant(payload);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const tenant = await createTenant(ownerId, payload as TenantPayload);
    notifyDashboardUpdated(ownerId, 'tenants.created');
    res.status(201).json(tenant);
  } catch (error) {
    console.error(error);
    const resolved = resolveTenantError(error, 'No se pudo crear el inquilino');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const payload = normalizeTenant(req.body, true);
  const errors = validateTenant(payload, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const tenant = await updateTenant(ownerId, id, payload);
    notifyDashboardUpdated(ownerId, 'tenants.updated');
    res.json(tenant);
  } catch (error) {
    console.error(error);
    const resolved = resolveTenantError(error, 'No se pudo actualizar el inquilino');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

router.patch('/:id/finalize', async (req: AuthenticatedRequest, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const tenant = await finalizeTenantContract(ownerId, req.params.id, today);
    notifyDashboardUpdated(ownerId, 'tenants.finalized');
    res.json(tenant);
  } catch (error) {
    console.error(error);
    const resolved = resolveTenantError(error, 'No se pudo finalizar el contrato del inquilino');
    res.status(resolved.status).json({ message: resolved.message });
  }
});

export default router;
