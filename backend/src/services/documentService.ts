import { appConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';
import { ContractTerminationDocumentData } from '../utils/pdfGenerator';

const VIRTUAL_CONTRACT_STORAGE_PREFIX = 'virtual://contracts';

const buildBaseUrl = () => {
  return appConfig.appBaseUrl;
};

const buildContractDownloadUrl = (contractId: string) => {
  const baseUrl = buildBaseUrl();
  const route = `/contracts/${contractId}/pdf`;
  return baseUrl ? `${baseUrl}${route}` : route;
};

export type DocumentCreationResult = {
  url: string;
  storagePath: string;
  documentId: string;
};

export type ContractDocumentMetadata = {
  finalizationDate?: string;
  deliveryDate?: string;
  depositAmount?: number;
  depositStatus?: string;
  generationPayload?: ContractTerminationDocumentData;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function buildVirtualContractStoragePath(contractId: string, timestamp = Date.now()) {
  return `${VIRTUAL_CONTRACT_STORAGE_PREFIX}/${contractId}/${timestamp}.pdf`;
}

export function isVirtualContractStoragePath(storagePath?: string | null) {
  return String(storagePath ?? '').startsWith(VIRTUAL_CONTRACT_STORAGE_PREFIX);
}

export function extractContractGenerationPayload(metadata: unknown): ContractTerminationDocumentData | null {
  if (!isRecord(metadata) || !isRecord(metadata.generationPayload)) {
    return null;
  }

  return metadata.generationPayload as ContractTerminationDocumentData;
}

export async function createContractTerminationDocument(
  contractId: string,
  documentData: ContractTerminationDocumentData
): Promise<DocumentCreationResult> {
  const fileName = `contrato-finalizacion-${contractId}-${Date.now()}.pdf`;
  const storagePath = buildVirtualContractStoragePath(contractId);

  const documentUrl = buildContractDownloadUrl(contractId);

  const { data, error } = await supabaseAdmin
    .from('contract_documents')
    .insert({
      contract_id: contractId,
      document_type: 'CONTRACT_TERMINATION',
      name: fileName,
      storage_path: storagePath,
      url: documentUrl,
      metadata: {
        finalizationDate: documentData.contract.finalizationDate,
        deliveryDate: documentData.contract.deliveryDate,
        depositAmount: documentData.deposit.amount,
        depositStatus: documentData.deposit.status,
        generationPayload: documentData
      }
    })
    .select('id')
    .single();

  if (error) {
    const msg = String(error.message ?? '').toLowerCase();
    if (msg.includes('relation "contract_documents" does not exist')) {
      if (appConfig.isProduction) {
        throw new Error('Missing required database table: contract_documents');
      }
      console.warn('[documentService]', 'contract_documents table missing, document metadata skipped');
      return {
        url: documentUrl,
        storagePath,
        documentId: ''
      };
    }
    throw error;
  }

  return {
    url: documentUrl,
    storagePath,
    documentId: data?.id ?? ''
  };
}
