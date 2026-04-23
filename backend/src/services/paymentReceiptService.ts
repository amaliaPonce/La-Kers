/// <reference path="../types/custom-modules.d.ts" />
import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '../config/supabaseClient';

export type PaymentReceiptRecord = {
  id: string;
  unit_id?: string | null;
  tenant_person_id?: string | null;
  amount?: number | string | null;
  due_date?: string | null;
  paid_date?: string | null;
  payment_method?: string | null;
  status?: string | null;
  month?: number | null;
  year?: number | null;
  units?: {
    id?: string | null;
    owner_id?: string | null;
    name?: string | null;
  } | null;
  tenant_persons?: {
    id?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
};

export const PAYMENT_RECEIPT_SELECT =
  'id, amount, due_date, paid_date, payment_method, status, month, year, units!inner(id, owner_id, name), tenant_persons(id, full_name, email)';

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatDateLabel = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatCurrencyValue = (value?: number | string | null) => {
  const amount = Number(value ?? 0);
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
};

const translatePaymentStatus = (status?: string | null) => {
  switch (status) {
    case 'PAID':
      return 'Pagado';
    case 'LATE':
      return 'Atrasado';
    case 'PENDING':
      return 'Pendiente';
    default:
      return '—';
  }
};

const translatePaymentMethod = (method?: string | null) => {
  switch (method) {
    case 'BANK':
      return 'Banco';
    case 'CASH':
      return 'Efectivo';
    default:
      return 'No indicado';
  }
};

export function buildPaymentReceiptFilename(paymentId: string) {
  return `receipt-${paymentId}.pdf`;
}

export async function getPaidPaymentReceiptRecord(paymentId: string, ownerId?: string) {
  let query = supabaseAdmin
    .from('payments')
    .select(PAYMENT_RECEIPT_SELECT)
    .eq('id', paymentId)
    .eq('status', 'PAID');

  if (ownerId) {
    query = query.eq('units.owner_id', ownerId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as PaymentReceiptRecord | null) ?? null;
}

export const generatePaymentReceiptPdf = (payment: PaymentReceiptRecord): Promise<Buffer> =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.font('Helvetica-Bold');
    doc.fontSize(22).text('Recibo de pago mensual', { align: 'left' });
    doc.fontSize(10).font('Helvetica').text(`Fecha de emisión: ${formatDateLabel(new Date().toISOString())}`, { align: 'right' });
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold').text('Datos del inmueble');
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(11);
    doc.text(`Apartamento: ${payment.units?.name ?? '—'}`);
    doc.text(`Inquilino: ${payment.tenant_persons?.full_name ?? '—'}`);
    doc.text(`Estado actual: ${translatePaymentStatus(payment.status)}`);
    doc.moveDown(0.5);

    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.options.margin, doc.y).stroke();
    doc.moveDown(0.75);

    doc.fontSize(14).font('Helvetica-Bold').text('Resumen del cobro');
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(12);
    doc.text(`Monto facturado: ${formatCurrencyValue(payment.amount)}`);
    doc.text(`Mes / Año: ${payment.month ?? '—'} / ${payment.year ?? '—'}`);
    doc.text(`Vencimiento registrado: ${formatDateLabel(payment.due_date)}`);
    doc.text(`Pago registrado: ${formatDateLabel(payment.paid_date)}`);
    doc.text(`Método de cobro: ${translatePaymentMethod(payment.payment_method)}`);
    doc.moveDown();

    doc.fontSize(10).fillColor('#475569');
    doc.text('Documento generado a partir del pago registrado en La-Kers.');
    doc.end();
  });
