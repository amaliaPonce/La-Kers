import cron from 'node-cron';
import { ensurePendingPaymentsForDate } from '../services/paymentsService';
import { notifyAllDashboardsUpdated } from '../services/dashboardRealtime';

export function registerMonthlyPaymentCron() {
  cron.schedule('0 4 1 * *', async () => {
    try {
      await ensurePendingPaymentsForDate(new Date().toISOString());
      notifyAllDashboardsUpdated('payments.monthly_cron');
    } catch (error) {
      console.error('[CRON][monthlyPayments]', error);
    }
  });
}
