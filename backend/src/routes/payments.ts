import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { listPayments, markPaymentPaid, createPayment, ensurePendingPaymentsForDate } from '../services/paymentsService';

const router = Router();

function validatePayment(payload: Record<string, unknown>) {
  const errors: string[] = [];
  if (!payload.unit_id || typeof payload.unit_id !== 'string') {
    errors.push('Unidad inválida');
  }
  if (!payload.tenant_person_id || typeof payload.tenant_person_id !== 'string') {
    errors.push('Inquilino inválido');
  }
  if (typeof payload.amount !== 'number' || payload.amount <= 0 || Number.isNaN(payload.amount)) {
    errors.push('Monto inválido');
  }
  if (!payload.due_date || typeof payload.due_date !== 'string' || Number.isNaN(Date.parse(payload.due_date))) {
    errors.push('Fecha de vencimiento inválida');
  }
  if (typeof payload.month !== 'number' || payload.month < 1 || payload.month > 12) {
    errors.push('Mes inválido');
  }
  if (typeof payload.year !== 'number' || payload.year < 2000) {
    errors.push('Año inválido');
  }
  return errors;
}

router.get('/', async (req: AuthenticatedRequest, res) => {
  const ownerId = req.supabaseUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    await ensurePendingPaymentsForDate(new Date().toISOString(), ownerId);
    const payments = await listPayments(ownerId);
    res.json(payments);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'Unable to load payments' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const payload = {
    unit_id: req.body.unit_id,
    tenant_person_id: req.body.tenant_person_id,
    amount: Number(req.body.amount),
    due_date: req.body.due_date,
    month: Number(req.body.month),
    year: Number(req.body.year)
  };
  const errors = validatePayment(payload);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const ownerId = req.supabaseUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payment = await createPayment({ ...payload, status: 'PENDING' }, ownerId);
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'Unable to create payment' });
  }
});

router.patch('/:id/pay', async (req: AuthenticatedRequest, res) => {
  try {
    const ownerId = req.supabaseUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payment = await markPaymentPaid(req.params.id, ownerId);
    res.json(payment);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'Unable to mark payment as paid' });
  }
});

export default router;
