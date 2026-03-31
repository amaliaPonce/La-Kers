import { supabaseAdmin } from '../config/supabaseClient';
import { archiveTenantRecord, synchronizeApartmentStatus } from './tenantsService';
import { createContractTerminationDocument, DocumentCreationResult } from './documentService';
import { getTenantPaymentSummary } from './paymentsService';
import { ContractTerminationDocumentData } from '../utils/pdfGenerator';
import { resolveContractLandlordProfile } from '../utils/contractLandlordProfile';

export type ContractFinalizationPayload = {
  finalizationDate?: string;
  depositAmount?: number;
  depositStatus?: string;
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

const toDateKey = (value: string | Date | null | undefined) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${padDatePart(parsed.getMonth() + 1)}-${padDatePart(parsed.getDate())}`;
};

const normalizeFinalizationDate = (value?: string) => {
  return toDateKey(value);
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

const getContractRecord = async (ownerId: string, contractId: string): Promise<ContractRecord> => {
  const { data, error } = await supabaseAdmin
    .from('tenant_persons')
    .select('*, units(*)')
    .eq('id', contractId)
    .eq('units.owner_id', ownerId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('Contrato no encontrado');
  }
  return data as ContractRecord;
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
    contract_landlord_name?: string | null;
    contract_landlord_identification?: string | null;
    contract_landlord_address?: string | null;
  } | null;
};

export type ContractFinalizationResult = {
  contractId: string;
  documentUrl: string;
  documentId: string;
};

export async function finalizeContract(
  ownerId: string,
  contractId: string,
  payload: ContractFinalizationPayload
): Promise<ContractFinalizationResult> {
  const record = await getContractRecord(ownerId, contractId);
  if (!record) {
    throw new Error('Contrato no encontrado');
  }
  const finalizationDate = normalizeFinalizationDate(payload.finalizationDate) ?? toDateKey(new Date()) ?? record.contract_end;
  if (finalizationDate < record.contract_start) {
    const error = new Error('La fecha de finalización no puede ser anterior al inicio del contrato');
    (error as any).status = 400;
    throw error;
  }

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
      await synchronizeApartmentStatus(ownerId, record.unit_id);
    } catch (unitError) {
      console.error('[contracts/ensure-unit]', unitError);
    }
  }

  const propertyAddress = record.units?.address ?? record.units?.name ?? '—';
  const propertyCity = record.units?.city ?? '—';
  const propertyPostal = record.units?.postal_code ?? '—';

  const paymentSummary = await getTenantPaymentSummary(record.id, { untilDate: finalizationDate });

  const documentPayload: ContractTerminationDocumentData = {
    landlord: resolveContractLandlordProfile(record.units),
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
