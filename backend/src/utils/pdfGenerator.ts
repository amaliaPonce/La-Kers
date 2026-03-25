import PDFDocument from 'pdfkit';

export type ContractFinancialSummary = {
  monthsContracted: number;
  totalAccrued: number;
  totalPaid: number;
  outstanding: number;
  lastPaymentDate?: string | null;
};

export type ContractTerminationDocumentData = {
  landlord: {
    name: string;
    identification: string;
    address: string;
  };
  tenant: {
    name: string;
    identification: string;
    email?: string | null;
  };
  property: {
    address: string;
    city: string;
    postalCode: string;
  };
  contract: {
    startDate: string;
    endDate: string;
    finalizationDate: string;
    deliveryDate?: string;
  };
  deposit: {
    amount: number;
    status: string;
  };
  financialSummary?: ContractFinancialSummary;
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
};

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(Number.isFinite(value) ? value : 0);
};

const formatMonthsLabel = (months: number) => `${months} ${months === 1 ? 'mes' : 'meses'}`;

const checkboxLine = (doc: any, label: string, checked: boolean) => {
  const symbol = checked ? '☒' : '☐';
  doc.text(`${symbol} ${label}`);
};

export function generateContractTerminationDocument(
  payload: ContractTerminationDocumentData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { landlord, tenant, property, contract, deposit, financialSummary } = payload;
    const finalDateLabel = formatDate(contract.finalizationDate);
    const propertyCityLabel = property.city || '—';
    const propertyAddressLabel = property.address || '—';
    const tenantResidenceLabel = propertyAddressLabel;
    const depositStatus = deposit.status?.trim().toLowerCase() ?? 'pendiente';

    doc.font('Helvetica-Bold').fontSize(16).text('DOCUMENTO DE FINALIZACIÓN DE CONTRATO DE ARRENDAMIENTO Y ENTREGA DE LLAVES', {
      align: 'center'
    });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    doc.text(`En ${propertyCityLabel}, a ${finalDateLabel}.`);

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(12).text('REUNIDOS');
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(11);
    doc.text(
      `De una parte, D./Dña. ${landlord.name}, con DNI/NIF ${landlord.identification}, con domicilio en ${landlord.address}, en calidad de arrendador.`
    );
    doc.moveDown(0.1);
    doc.text(
      `Y de otra parte, D./Dña. ${tenant.name}, con DNI/NIE ${tenant.identification}, con domicilio en ${tenantResidenceLabel}, en calidad de arrendatario.`
    );
    doc.moveDown(0.1);
    doc.text('Ambas partes se reconocen capacidad legal suficiente y');

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('EXPONEN');
    doc.moveDown(0.25);
    doc.font('Helvetica').text(
      `Que con fecha ${formatDate(contract.startDate)} ambas partes firmaron un contrato de arrendamiento de vivienda sobre el inmueble situado en: ${propertyAddressLabel}.`
    );
    doc.moveDown(0.2);
    doc.text(`Que ambas partes han acordado dar por finalizado el contrato de arrendamiento en fecha ${finalDateLabel}.`);
    doc.moveDown(0.2);
    doc.text('Que en este acto el arrendatario hace entrega al arrendador de todas las llaves de la vivienda, recuperando este último la plena posesión del inmueble.');

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('ACUERDAN');
    doc.moveDown(0.3);

    const sectionSpacing = 0.3;

    doc.font('Helvetica-Bold').text('Primero. Finalización del contrato');
    doc.font('Helvetica').text(
      'Las partes acuerdan que el contrato de arrendamiento queda resuelto y finalizado en la fecha indicada anteriormente, quedando extinguida cualquier obligación derivada del mismo, salvo las que se mencionan en este documento.'
    );
    doc.moveDown(sectionSpacing);

    doc.font('Helvetica-Bold').text('Segundo. Estado de la vivienda');
    doc.font('Helvetica').text(
      'El arrendatario declara haber dejado la vivienda en correcto estado de uso y conservación, salvo el desgaste derivado del uso normal de la misma.'
    );
    doc.moveDown(sectionSpacing);

    doc.font('Helvetica-Bold').text('Tercero. Fianza');
    doc.font('Helvetica').text(`La fianza entregada al inicio del contrato, por importe de ${formatCurrency(deposit.amount)}, será:`);
    doc.moveDown(0.1);
    checkboxLine(doc, 'Devuelta íntegramente al arrendatario.', depositStatus === 'devuelta');
    checkboxLine(doc, 'Devuelta parcialmente tras descontar los siguientes conceptos: [detallar si procede].', depositStatus === 'parcial');
    checkboxLine(doc, 'Devuelta en el plazo legal establecido tras la revisión del estado de la vivienda.', depositStatus === 'pendiente');
    doc.moveDown(sectionSpacing);

    if (financialSummary) {
      doc.moveDown(0.1);
      doc.font('Helvetica-Bold').text('Resumen económico');
      doc.moveDown(0.1);
      const tableStartX = doc.x;
      const tableWidth = doc.page.width - doc.options.margin * 2;
      const labelWidth = tableWidth * 0.65;
      const valueWidth = tableWidth - labelWidth;
      const lineColor = '#E5E7EB';
      const rows: [string, string][] = [
        [
          'Total devengado (meses contratados)',
          `${formatCurrency(financialSummary.totalAccrued)} · ${formatMonthsLabel(financialSummary.monthsContracted)}`
        ],
        ['Total abonado', formatCurrency(financialSummary.totalPaid)],
        ['Saldo pendiente', formatCurrency(financialSummary.outstanding)],
        ['Última fecha de pago', formatDate(financialSummary.lastPaymentDate ?? undefined)]
      ];

      rows.forEach((row) => {
        const currentY = doc.y;
        doc.font('Helvetica').fontSize(11).text(row[0], tableStartX, currentY, {
          width: labelWidth,
          continued: true,
          lineBreak: false
        });
        doc.font('Helvetica-Bold').fontSize(11).text(row[1], tableStartX + labelWidth, currentY, {
          width: valueWidth,
          align: 'right',
          lineBreak: false
        });
        doc.moveDown(0.35);
        doc.strokeColor(lineColor).lineWidth(0.5).moveTo(tableStartX, doc.y).lineTo(tableStartX + tableWidth, doc.y).stroke();
        doc.moveDown(0.15);
      });
      doc.strokeColor('#000000');
      doc.moveDown(sectionSpacing);
    }

    doc.font('Helvetica-Bold').text('Cuarto. Saldos pendientes');
    doc.font('Helvetica').text('Las partes declaran que:');
    doc.moveDown(0.1);
    checkboxLine(doc, 'No existen cantidades pendientes entre ellas.', true);
    checkboxLine(doc, 'Existen las siguientes cantidades pendientes: [detallar si procede].', false);

    doc.moveDown(0.5);
    doc.text('Y para que así conste, ambas partes firman el presente documento por duplicado en el lugar y fecha indicados.');

    doc.moveDown(1);
    doc.font('Helvetica-Bold').text('EL ARRENDADOR', 72);
    doc.moveDown(0.3);
    const landlordSignatureY = doc.y;
    doc.moveTo(72, landlordSignatureY).lineTo(260, landlordSignatureY).stroke();
    const landlordDetailsStartY = landlordSignatureY + 6;
    doc.font('Helvetica').text(`Firma: __________________________`, 72, landlordDetailsStartY);
    doc.text(`Nombre: ${landlord.name}`, 72, landlordDetailsStartY + 12);
    doc.text(`DNI: ${landlord.identification}`, 72, landlordDetailsStartY + 24);

    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').text('EL ARRENDATARIO', 330);
    doc.moveDown(0.3);
    const tenantSignatureY = doc.y;
    doc.moveTo(330, tenantSignatureY).lineTo(520, tenantSignatureY).stroke();
    const tenantDetailsStartY = tenantSignatureY + 6;
    doc.font('Helvetica').text(`Firma: __________________________`, 330, tenantDetailsStartY);
    doc.text(`Nombre: ${tenant.name}`, 330, tenantDetailsStartY + 12);
    doc.text(`DNI: ${tenant.identification}`, 330, tenantDetailsStartY + 24);

    doc.end();
  });
}
