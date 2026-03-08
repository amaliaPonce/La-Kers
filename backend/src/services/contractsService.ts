import { supabaseAdmin } from '../config/supabaseClient';
import { landlordConfig } from '../config/landlordConfig';
import { updateApartment } from './apartmentsService';
import { archiveTenantRecord } from './tenantsService';
import { createContractTerminationDocument, DocumentCreationResult } from './documentService';
import { getTenantPaymentSummary } from './paymentsService';
import { ContractTerminationDocumentData } from '../utils/pdfGenerator';

export type ContractFinalizationPayload = {
  finalizationDate?: string;
  depositAmount?: number;
  depositStatus?: string;
};

const normalizeFinalizationDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const buildDepositStatus = (value?: string | null) => {
  if (!value) return 'pendiente';
  const normalized = value.trim().toLowerCase();
  if (['pendiente', 'devuelta', 'parcial'].includes(normalized)) return normalized;
  return 'pendiente';
};

const isMissingColumnError = (error: { message?: string | null } | null | undefined, columns?: string[]) => {
  const message = String(error?.message ?? '').toLowerCase();
  if (!message.includes('does not exist')) return false;
  if (!columns || !columns.length) return true;
  return columns.some((column) => message.includes(column.toLowerCase()));
};

type UnitAddressDetails = {
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
};

const loadUnitDetails = async (unitId: string): Promise<UnitAddressDetails | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('units')
      .select('address, city, postal_code')
      .eq('id', unitId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data ?? null;
  } catch (error) {
    console.warn('[contracts/loadUnitDetails]', error);
    return null;
  }
};

const getContractRecord = async (contractId: string): Promise<ContractRecord> => {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('*, units(id, name)')
    .eq('id', contractId)
    .single();
  if (error || !data) {
    throw error ?? new Error('Contrato no encontrado');
  }
  const record = data as ContractRecord;
  if (record.unit_id) {
    const unitDetails = await loadUnitDetails(record.unit_id);
    if (unitDetails) {
      record.units = {
        ...(record.units ?? { id: record.unit_id }),
        ...unitDetails
      };
    }
  }
  return record;
};

type ContractRecord = {
  id: string;
  full_name: string;
  identification: string;
  email?: string | null;
  contract_start: string;
  contract_end: string;
  deposit_amount?: number | null;
  deposit_status?: string | null;
  unit_id: string | null;
  units?: {
    id: string;
    name?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
  } | null;
};

export type ContractFinalizationResult = {
  contractId: string;
  documentUrl: string;
  documentId: string;
};

export async function finalizeContract(
  contractId: string,
  payload: ContractFinalizationPayload
): Promise<ContractFinalizationResult> {
  const record = await getContractRecord(contractId);
  if (!record) {
    throw new Error('Contrato no encontrado');
  }
  const parsedDate = normalizeFinalizationDate(payload.finalizationDate) ?? new Date();
  const finalizationDate = parsedDate.toISOString().split('T')[0];

  const depositAmount = Number(payload.depositAmount ?? record.deposit_amount ?? 0);
  const depositStatus = buildDepositStatus(payload.depositStatus ?? record.deposit_status ?? undefined);

  const { error: updateError } = await supabaseAdmin
    .from('tenant_persons')
    .update({
      contract_end: finalizationDate,
      deposit_amount: depositAmount,
      deposit_status: depositStatus
    })
    .eq('id', contractId);
  if (updateError) {
    if (isMissingColumnError(updateError, ['deposit_amount', 'deposit_status'])) {
      const { error: fallbackUpdateError } = await supabaseAdmin
        .from('tenant_persons')
        .update({ contract_end: finalizationDate })
        .eq('id', contractId);
      if (fallbackUpdateError) {
        throw fallbackUpdateError;
      }
    } else {
      throw updateError;
    }
  }

  await archiveTenantRecord(contractId, finalizationDate);

  if (record.unit_id) {
    try {
      await updateApartment(record.unit_id, { status: 'AVAILABLE' });
    } catch (unitError) {
      console.error('[contracts/ensure-unit]', unitError);
    }
  }

  const propertyAddress = record.units?.address ?? record.units?.name ?? '—';
  const propertyCity = record.units?.city ?? '—';
  const propertyPostal = record.units?.postal_code ?? '—';

  const paymentSummary = await getTenantPaymentSummary(record.id, { untilDate: finalizationDate });

  const documentPayload: ContractTerminationDocumentData = {
    landlord: landlordConfig,
    tenant: {
      name: record.full_name,
      identification: record.identification,
      email: record.email ?? null
    },
    property: {
      address: propertyAddress,
      city: propertyCity,
      postalCode: propertyPostal
    },
    contract: {
      startDate: record.contract_start,
      endDate: finalizationDate,
      finalizationDate,
      deliveryDate: finalizationDate
    },
    deposit: {
      amount: depositAmount,
      status: depositStatus
    },
    financialSummary: paymentSummary
  };

  const documentResult: DocumentCreationResult = await createContractTerminationDocument(contractId, documentPayload);

  return {
    contractId,
    documentUrl: documentResult.url,
    documentId: documentResult.documentId
  };
}
