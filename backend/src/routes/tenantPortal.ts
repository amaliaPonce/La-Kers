import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  createTenantPortalIncident,
  getTenantPortalContractPdf,
  getTenantPortalOverview,
  getTenantPortalReceiptPdf
} from '../services/tenantPortalPremiumService';
import { recordProductEvent } from '../services/analyticsEventsService';

const router = Router();

function ensureTenantActor(req: AuthenticatedRequest) {
  const actor = req.authActor;
  if (!actor || actor.actorType !== 'TENANT' || !actor.authUserId) {
    const error = new Error('Acceso de inquilino requerido');
    (error as { status?: number }).status = 401;
    throw error;
  }

  return actor;
}

function validateTenantIncidentPayload(body: Record<string, unknown>) {
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const errors: string[] = [];

  if (!title || title.length < 4) {
    errors.push('El título debe tener al menos 4 caracteres');
  }

  if (!description || description.length < 12) {
    errors.push('La descripción debe tener al menos 12 caracteres');
  }

  return {
    errors,
    payload: {
      title,
      description
    }
  };
}

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const actor = ensureTenantActor(req);
    const profile = await getTenantPortalOverview(actor.authUserId);
    await recordProductEvent({
      ownerId: actor.ownerId,
      actorId: actor.tenantPersonId ?? actor.actorRef,
      actorType: 'TENANT',
      eventName: 'tenant_portal_accessed',
      metadata: {
        tenantPersonId: actor.tenantPersonId ?? null
      }
    }).catch(() => undefined);
    res.json(profile);
  } catch (error) {
    console.error(error);
    const status = (error as any)?.status ?? 500;
    res.status(status).json({ message: String((error as any)?.message ?? 'No se pudo cargar el portal del inquilino') });
  }
});

router.post('/incidents', async (req: AuthenticatedRequest, res) => {
  const { errors, payload } = validateTenantIncidentPayload(req.body ?? {});
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const actor = ensureTenantActor(req);
    const incident = await createTenantPortalIncident(actor.authUserId, payload);
    await recordProductEvent({
      ownerId: actor.ownerId,
      actorId: actor.tenantPersonId ?? actor.actorRef,
      actorType: 'TENANT',
      eventName: 'tenant_portal_incident_created',
      metadata: {
        tenantPersonId: actor.tenantPersonId ?? null,
        incidentId: (incident as any)?.id ?? null
      }
    }).catch(() => undefined);
    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    const status = (error as any)?.status ?? 500;
    res.status(status).json({ message: String((error as any)?.message ?? 'No se pudo crear la incidencia') });
  }
});

router.get('/documents/receipt/:paymentId', async (req: AuthenticatedRequest, res) => {
  try {
    const actor = ensureTenantActor(req);
    const receipt = await getTenantPortalReceiptPdf(actor.authUserId, req.params.paymentId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${receipt.fileName}`);
    res.send(receipt.buffer);
  } catch (error) {
    console.error(error);
    const status = (error as any)?.status ?? 500;
    res.status(status).json({ message: String((error as any)?.message ?? 'No se pudo generar el recibo') });
  }
});

router.get('/documents/contract', async (req: AuthenticatedRequest, res) => {
  try {
    const actor = ensureTenantActor(req);
    const contract = await getTenantPortalContractPdf(actor.authUserId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${contract.fileName}`);
    res.send(contract.buffer);
  } catch (error) {
    console.error(error);
    const status = (error as any)?.status ?? 500;
    res.status(status).json({ message: String((error as any)?.message ?? 'No se pudo generar el contrato') });
  }
});

export default router;
