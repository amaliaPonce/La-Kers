import path from 'path';
import { promises as fs } from 'fs';
import { supabaseAdmin } from '../config/supabaseClient';
import { ContractTerminationDocumentData, generateContractTerminationDocument } from '../utils/pdfGenerator';

const DOCUMENTS_ROUTE = '/documents/contracts';
const DOCUMENTS_STORAGE_PATH = process.env.DOCUMENT_STORAGE_PATH
  ? path.resolve(process.env.DOCUMENT_STORAGE_PATH)
  : path.resolve(__dirname, '../documents');
const CONTRACTS_FOLDER = path.join(DOCUMENTS_STORAGE_PATH, 'contracts');

const buildBaseUrl = () => {
  const raw = process.env.APP_BASE_URL;
  if (raw) {
    return raw.replace(/\/+$/, '');
  }
  const defaultPort = process.env.PORT ?? '4000';
  return `http://localhost:${defaultPort}`;
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

  const baseUrl = buildBaseUrl();
  const documentUrl = `${baseUrl}${DOCUMENTS_ROUTE}/${fileName}`;

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
