import { Router } from 'express';
import { finalizeContractHandler, downloadContractPdfHandler } from '../controllers/contractsController';

const router = Router();

router.get('/:contractId/pdf', downloadContractPdfHandler);
router.post('/:contractId/finalize', finalizeContractHandler);

export default router;
