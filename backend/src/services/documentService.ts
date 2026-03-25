import path from 'path';
import { promises as fs } from 'fs';
import { appConfig } from '../config/appConfig';
import { supabaseAdmin } from '../config/supabaseClient';
import { ContractTerminationDocumentData, generateContractTerminationDocument } from '../utils/pdfGenerator';

const DOCUMENTS_STORAGE_PATH = process.env.DOCUMENT_STORAGE_PATH
  ? path.resolve(process.env.DOCUMENT_STORAGE_PATH)
  : path.resolve(process.cwd(), 'documents');
const CONTRACTS_FOLDER = path.join(DOCUMENTS_STORAGE_PATH, 'contracts');

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

export async function createContractTerminationDocument(
  contractId: string,
  documentData: ContractTerminationDocumentData
): Promise<DocumentCreationResult> {
  const buffer = await generateContractTerminationDocument(documentData);
  await fs.mkdir(CONTRACTS_FOLDER, { recursive: true });
  const fileName = `contrato-finalizacion-${contractId}-${Date.now()}.pdf`;
  const storagePath = path.join(CONTRACTS_FOLDER, fileName);
  await fs.writeFile(storagePath, buffer);

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
        depositStatus: documentData.deposit.status
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
