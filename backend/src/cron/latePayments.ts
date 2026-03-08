import cron from 'node-cron';
import { markPendingPaymentsAsLate } from '../services/paymentsService';

export function registerLatePaymentCron() {
  cron.schedule('0 3 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markPendingPaymentsAsLate(today);
    } catch (error) {
      console.error('[CRON][latePayments]', error);
    }
  });
}
