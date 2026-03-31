import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { access } from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '../config/supabaseClient';
import { finalizeContract } from '../services/contractsService';
import { notifyDashboardUpdated } from '../services/dashboardRealtime';

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
      .select('storage_path')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (documentsError) {
      throw documentsError;
    }

    const document = documents?.[0];
    if (!document?.storage_path) {
      return res.status(404).json({ message: 'Documento del contrato no encontrado' });
    }

    const filePath = path.resolve(document.storage_path);

    try {
      await access(filePath);
    } catch (error) {
      console.error('[contracts/download-pdf] file missing', error);
      return res.status(404).json({ message: 'Documento del contrato no encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contractId}.pdf`);
    return res.sendFile(filePath, (sendError) => {
      if (sendError && !res.headersSent) {
        console.error('[contracts/download-pdf] res.sendFile', sendError);
        res.status(500).json({ message: 'No se pudo descargar el documento del contrato' });
      }
    });
  } catch (error) {
    console.error('[contracts/download-pdf]', error);
    res.status(500).json({ message: 'No se pudo descargar el documento del contrato' });
  }
}
