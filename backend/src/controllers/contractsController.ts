import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { access, readFile } from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '../config/supabaseClient';
import { finalizeContract } from '../services/contractsService';
import {
  extractContractGenerationPayload,
  isVirtualContractStoragePath
} from '../services/documentService';
import { notifyDashboardUpdated } from '../services/dashboardRealtime';
import { generateContractTerminationDocument } from '../utils/pdfGenerator';

function resolveFinalizeContractError(error: unknown) {
  const status = Number((error as { status?: number })?.status);
  const rawMessage = String((error as { message?: string })?.message ?? '');

  if (Number.isInteger(status) && status >= 400 && status < 600) {
    return {
      status,
      message: rawMessage || 'No se pudo finalizar el contrato'
    };
  }

  if (rawMessage.toLowerCase().includes('contrato no encontrado')) {
    return {
      status: 404,
      message: 'Contrato no encontrado'
    };
  }

  return {
    status: 500,
    message: 'No se pudo finalizar el contrato'
  };
}

function sanitizeAttachmentName(value: string) {
  return value.replace(/["\r\n]/g, '').trim() || 'document.pdf';
}

export async function finalizeContractHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { contractId } = req.params;
    const { finalizationDate, depositAmount, depositStatus } = req.body ?? {};
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const result = await finalizeContract(ownerId, contractId, {
      finalizationDate,
      depositAmount,
      depositStatus
    });
    notifyDashboardUpdated(ownerId, 'contracts.finalized');

    res.json({
      success: true,
      contractId: result.contractId,
      documentUrl: result.documentUrl
    });
  } catch (error) {
    const resolved = resolveFinalizeContractError(error);
    if (resolved.status >= 500) {
      return next(error);
    }
    return res.status(resolved.status).json({ message: resolved.message });
  }
}

export async function downloadContractPdfHandler(req: AuthenticatedRequest, res: Response) {
  const { contractId } = req.params;
  try {
    const ownerId = req.authUser?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('tenant_persons')
      .select('id, units(owner_id)')
      .eq('id', contractId)
      .eq('units.owner_id', ownerId)
      .maybeSingle();

    if (contractError) {
      throw contractError;
    }
    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    const { data: documents, error: documentsError } = await supabaseAdmin
      .from('contract_documents')
      .select('storage_path, name, metadata')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (documentsError) {
      throw documentsError;
    }

    const document = documents?.[0];
    if (!document) {
      return res.status(404).json({ message: 'Documento del contrato no encontrado' });
    }

    const fileName = sanitizeAttachmentName(String(document.name ?? `contract-${contractId}.pdf`));
    const generationPayload = extractContractGenerationPayload(document.metadata);
    let pdfBuffer: Buffer | null = null;

    if (document.storage_path && !isVirtualContractStoragePath(document.storage_path)) {
      const filePath = path.resolve(document.storage_path);

      try {
        await access(filePath);
        pdfBuffer = await readFile(filePath);
      } catch (error) {
        console.error('[contracts/download-pdf] legacy file missing', error);
      }
    }

    if (!pdfBuffer && generationPayload) {
      pdfBuffer = await generateContractTerminationDocument(generationPayload);
    }

    if (!pdfBuffer) {
      return res.status(404).json({ message: 'Documento del contrato no encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('[contracts/download-pdf]', error);
    res.status(500).json({ message: 'No se pudo descargar el documento del contrato' });
  }
}
