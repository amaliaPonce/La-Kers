import { Request, Response, NextFunction } from 'express';
import { access } from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '../config/supabaseClient';
import { finalizeContract } from '../services/contractsService';

export async function finalizeContractHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { contractId } = req.params;
    const { finalizationDate, depositAmount, depositStatus } = req.body ?? {};
    const result = await finalizeContract(contractId, {
      finalizationDate,
      depositAmount,
      depositStatus
    });

    res.json({
      success: true,
      contractId: result.contractId,
      documentUrl: result.documentUrl
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadContractPdfHandler(req: Request, res: Response) {
  const { contractId } = req.params;
  console.log('Downloading contract:', contractId);
  try {
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('tenant_persons')
      .select('id')
      .eq('id', contractId)
      .maybeSingle();

    if (contractError) {
      throw contractError;
    }
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    const { data: documents, error: documentsError } = await supabaseAdmin
      .from('contract_documents')
      .select('storage_path, url')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (documentsError) {
      throw documentsError;
    }

    const document = documents?.[0];
    if (!document?.storage_path || !document?.url) {
      return res.status(404).json({ message: 'Contract document not found' });
    }

    const filePath = path.resolve(document.storage_path);
    console.log('File path:', filePath);

    try {
      await access(filePath);
    } catch (error) {
      console.error('[contracts/download-pdf] file missing', error);
      return res.status(404).json({ message: 'Contract document not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contractId}.pdf`);
    return res.sendFile(filePath, (sendError) => {
      if (sendError && !res.headersSent) {
        console.error('[contracts/download-pdf] res.sendFile', sendError);
        res.status(500).json({ message: 'Error downloading contract document' });
      }
    });
  } catch (error) {
    console.error('[contracts/download-pdf]', error);
    res.status(500).json({ message: 'Error downloading contract document' });
  }
}
