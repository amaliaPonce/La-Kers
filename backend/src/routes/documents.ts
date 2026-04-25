import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabaseClient';
import { resolveContractLandlordProfile } from '../utils/contractLandlordProfile';
import { getTenantContractProfilePdfFields } from '../services/tenantContractProfilesService';
import { generatePaymentReceiptPdf, generateRentalContractPdf } from '../services/documentPdfService';
import { captureServerException } from '../monitoring/sentry';

const router = Router();

router.post('/receipt/:paymentId', async (req: AuthenticatedRequest, res) => {
  try {
    const { paymentId } = req.params;
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*, units(name), tenant_persons(full_name)')
      .eq('id', paymentId)
      .eq('units.owner_id', ownerId)
      .single();

    if (error || !payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    if (payment.status !== 'PAID') {
      return res.status(409).json({ message: 'Solo se puede generar un recibo para pagos abonados' });
    }

    const pdfBuffer = await generatePaymentReceiptPdf(payment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[documents/receipt]', error);
    captureServerException(error, {
      tag: 'documents.receipt_failed',
      userId: req.authUser?.id,
      route: req.path,
      tags: {
        feature: 'documents',
        action: 'open_receipt_pdf'
      },
      extra: {
        paymentId: req.params.paymentId,
        route: '/documents/receipt'
      }
    });
    res.status(500).json({ message: 'No se pudo generar el comprobante' });
  }
});

router.get('/tenant-contract/:tenantId', async (req: AuthenticatedRequest, res) => {
  try {
    const { tenantId } = req.params;
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const { data: tenant, error } = await supabaseAdmin
      .from('tenant_persons')
      .select('*, units(*)')
      .eq('id', tenantId)
      .eq('units.owner_id', ownerId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({ message: 'Inquilino no encontrado' });
    }

    const contractProfile = await getTenantContractProfilePdfFields(ownerId, tenantId);
    const pdfBuffer = await generateRentalContractPdf(tenant, resolveContractLandlordProfile(tenant.units), contractProfile);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-alquiler-${tenantId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[documents/tenant-contract]', error);
    captureServerException(error, {
      tag: 'documents.contract_failed',
      userId: req.authUser?.id,
      route: req.path,
      tags: {
        feature: 'documents',
        action: 'open_contract_pdf'
      },
      extra: {
        tenantId: req.params.tenantId,
        route: '/documents/tenant-contract'
      }
    });
    res.status(500).json({ message: 'No se pudo generar el contrato' });
  }
});

export default router;
