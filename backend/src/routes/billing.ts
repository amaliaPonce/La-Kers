import express, { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  BillingCycle,
  createCheckoutSession,
  createPortalSession,
  getOwnerBillingSummary,
  handleStripeWebhookEvent,
  verifyStripeWebhookSignature
} from '../services/billingService';
import { stripeConfig } from '../config/stripeConfig';

const router = Router();

function getOwnerId(req: AuthenticatedRequest) {
  return req.authUser?.id;
}

export const billingWebhookMiddleware = express.raw({ type: 'application/json' });

export async function billingWebhookHandler(req: express.Request, res: express.Response) {
  if (!stripeConfig.isConfigured) {
    return res.status(503).json({ message: 'Stripe no está configurado en este entorno' });
  }

  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));

  const signatureHeader = req.headers['stripe-signature'];
  const isValidSignature = verifyStripeWebhookSignature(rawBody, signatureHeader);
  if (!isValidSignature) {
    return res.status(400).json({ message: 'Firma de Stripe inválida' });
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8'));
    await handleStripeWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'No se pudo procesar el webhook de Stripe' });
  }
}

router.get('/summary', async (req: AuthenticatedRequest, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    const summary = await getOwnerBillingSummary(ownerId);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'No se pudo cargar el estado de facturación' });
  }
});

router.post('/checkout', async (req: AuthenticatedRequest, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  const billingCycle = req.body?.billingCycle === 'yearly' ? 'yearly' : 'monthly';

  try {
    const session = await createCheckoutSession(
      ownerId,
      billingCycle as BillingCycle,
      req.headers.origin
    );
    res.status(201).json({
      id: session.id ?? null,
      url: session.url ?? null
    });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: (error as Error).message || 'No se pudo iniciar el checkout' });
  }
});

router.post('/portal', async (req: AuthenticatedRequest, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    const session = await createPortalSession(ownerId, req.headers.origin);
    res.status(201).json({
      id: session.id ?? null,
      url: session.url ?? null
    });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: (error as Error).message || 'No se pudo abrir el portal de Stripe' });
  }
});

export default router;
