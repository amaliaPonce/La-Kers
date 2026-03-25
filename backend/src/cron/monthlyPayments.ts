import cron from 'node-cron';
import { ensurePendingPaymentsForDate } from '../services/paymentsService';

export function registerMonthlyPaymentCron() {
  cron.schedule('0 4 1 * *', async () => {
    try {
      await ensurePendingPaymentsForDate(new Date().toISOString());
    } catch (error) {
      console.error('[CRON][monthlyPayments]', error);
    }
  });
}
