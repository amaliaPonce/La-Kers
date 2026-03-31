import PDFDocument from 'pdfkit';
import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabaseClient';
import { landlordConfig } from '../config/landlordConfig';
import { resolveContractLandlordProfile } from '../utils/contractLandlordProfile';

const router = Router();

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

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

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

const generatePdfWithPdfKit = (payment: any): Promise<Buffer> =>
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

const generateRentalContractDocument = (tenant: any, landlord: typeof landlordConfig): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const propertyAddressLabel = tenant.units?.address ?? '—';
    const propertyCityLabel = tenant.units?.city ?? '—';
    const propertyPostalLabel = tenant.units?.postal_code ?? '—';
    const rentValueLabel = formatCurrencyValue(tenant.units?.monthly_rent ?? 0);
    const depositAmountLabel = formatCurrencyValue(tenant.deposit_amount ?? 0);
    const contractStartLabel = formatDateLabel(tenant.contract_start);
    const contractEndLabel = formatDateLabel(tenant.contract_end);
    const todayLabel = formatDateLabel(new Date().toISOString());
    const tenantAddressLabel = propertyAddressLabel;
    const unitName = tenant.units?.name ?? '—';
    const landlordAddressParts = landlord.address.split(',');
    const fallbackCityLabel = (landlordAddressParts[1] ?? landlordAddressParts[0] ?? '—').trim();
    const locationLabel = propertyCityLabel !== '—' ? propertyCityLabel : fallbackCityLabel;

    doc.font('Helvetica-Bold').fontSize(16).text('CONTRATO DE ALQUILER DE VIVIENDA', { align: 'center' });
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10);
    doc.text(`En ${locationLabel}, a ${todayLabel}.`);

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(12).text('REUNIDOS');
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(11);
    doc.text(
      `De una parte, ${landlord.name}, con DNI/NIF ${landlord.identification}, con domicilio en ${landlord.address}, en calidad de arrendador.`
    );
    doc.moveDown(0.2);
    doc.text(
      `Y de otra parte, ${tenant.full_name ?? '—'}, con DNI/NIE ${tenant.identification ?? '—'}, con domicilio en ${tenantAddressLabel}, en calidad de arrendatario.`
    );

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('EXPONEN');
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(11);
    doc.text(
      `Que ambas partes han acordado formalizar un contrato de arrendamiento sobre el inmueble situado en ${propertyAddressLabel} (${propertyPostalLabel}).`
    );
    doc.moveDown(0.2);
    doc.text(`Que el arrendatario destinará la vivienda al uso exclusivo de residencia habitual y el arrendador garantiza su entrega en buen estado.`);
    doc.moveDown(0.2);
    doc.text(`Que la duración, la renta y la fianza se detallan en las cláusulas siguientes.`);

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('ACUERDAN');
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Primero. Objeto del contrato');
    doc.font('Helvetica').fontSize(11);
    doc.text(
      `El arrendador cede al arrendatario la vivienda ubicada en ${propertyAddressLabel}, identificada como ${unitName}, para su uso como residencia habitual.`
    );
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Segundo. Duración');
    doc.font('Helvetica').fontSize(11);
    doc.text(`La duración del contrato comprende desde ${contractStartLabel} hasta ${contractEndLabel}.`);
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Tercero. Renta');
    doc.font('Helvetica').fontSize(11);
    doc.text(`El arrendatario abonará mensualmente ${rentValueLabel} como renta, dentro de los primeros cinco días naturales de cada mes.`);
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Cuarto. Fianza');
    doc.font('Helvetica').fontSize(11);
    doc.text(
      `En este acto se entrega una fianza de ${depositAmountLabel} que garantiza el cumplimiento de las obligaciones de conservación y entrega de la vivienda.`
    );
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Quinto. Conservación y llaves');
    doc.font('Helvetica').fontSize(11);
    doc.text(
      'El arrendatario se compromete a mantener la vivienda en correcto estado de uso y a devolver las llaves al arrendador una vez extinguido el contrato.'
    );
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Sexto. Estado de la vivienda');
    doc.font('Helvetica').fontSize(11);
    doc.text(
      'Las partes declaran que la vivienda se entrega sin cargas ocultas y con las instalaciones en correcto funcionamiento.'
    );

    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').text('Y para que así conste, firman el presente contrato por duplicado en la fecha y lugar indicados.');

    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').text('EL ARRENDADOR', 72);
    doc.moveDown(0.4);
    const landlordSignatureY = doc.y;
    doc.moveTo(72, landlordSignatureY).lineTo(260, landlordSignatureY).stroke();
    doc.font('Helvetica').text(`Firma: __________________________`, 72, landlordSignatureY + 6);
    doc.text(`Nombre: ${landlord.name}`, 72, landlordSignatureY + 18);
    doc.text(`DNI: ${landlord.identification}`, 72, landlordSignatureY + 30);

    doc.font('Helvetica-Bold').text('EL ARRENDATARIO', 330);
    doc.moveDown(0.4);
    const tenantSignatureY = doc.y;
    doc.moveTo(330, tenantSignatureY).lineTo(520, tenantSignatureY).stroke();
    doc.font('Helvetica').text(`Firma: __________________________`, 330, tenantSignatureY + 6);
    doc.text(`Nombre: ${tenant.full_name ?? '—'}`, 330, tenantSignatureY + 18);
    doc.text(`DNI: ${tenant.identification ?? '—'}`, 330, tenantSignatureY + 30);

    doc.end();
  });

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

    const pdfBuffer = await generatePdfWithPdfKit(payment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[documents/receipt]', error);
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

    const pdfBuffer = await generateRentalContractDocument(tenant, resolveContractLandlordProfile(tenant.units));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-alquiler-${tenantId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[documents/tenant-contract]', error);
    res.status(500).json({ message: 'No se pudo generar el contrato' });
  }
});

export default router;
