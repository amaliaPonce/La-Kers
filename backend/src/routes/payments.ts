import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  listPayments,
  markPaymentPaid,
  createPayment,
  ensurePendingPaymentsForDate,
  markPendingPaymentsAsLate,
  PaymentMethod
} from '../services/paymentsService';
import { notifyDashboardUpdated } from '../services/dashboardRealtime';

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
  const ownerId = req.authUser?.id;
  if (!ownerId) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    await ensurePendingPaymentsForDate(today, ownerId);
    await markPendingPaymentsAsLate(today, ownerId);
    const payments = await listPayments(ownerId);
    res.json(payments);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudieron cargar los pagos' });
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
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const payment = await createPayment({ ...payload, status: 'PENDING' }, ownerId);
    notifyDashboardUpdated(ownerId, 'payments.created');
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudo crear el pago' });
  }
});

router.patch('/:id/pay', async (req: AuthenticatedRequest, res) => {
  const paymentMethod = req.body.payment_method;
  if (paymentMethod !== 'BANK' && paymentMethod !== 'CASH') {
    return res.status(400).json({ message: 'Método de pago inválido' });
  }

  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const payment = await markPaymentPaid(req.params.id, paymentMethod as PaymentMethod, ownerId);
    notifyDashboardUpdated(ownerId, 'payments.marked_paid');
    res.json(payment);
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ message: 'No se pudo marcar el pago como abonado' });
  }
});

export default router;
