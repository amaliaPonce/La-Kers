import cron from 'node-cron';
import { markPendingPaymentsAsLate } from '../services/paymentsService';
import {
  runLatePaymentTransitionAutomation,
  runRecurringLateOwnerReminderSweep,
  runUpcomingPaymentReminderSweep
} from '../services/paymentAutomationService';
import { notifyAllDashboardsUpdated } from '../services/dashboardRealtime';

export function registerLatePaymentCron() {
  cron.schedule('0 3 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await runUpcomingPaymentReminderSweep(today);
      const transitionedPayments = await markPendingPaymentsAsLate(today);
      await runLatePaymentTransitionAutomation(transitionedPayments, today);
      await runRecurringLateOwnerReminderSweep(today);
      notifyAllDashboardsUpdated('payments.late_cron');
    } catch (error) {
      console.error('[CRON][latePayments]', error);
    }
  });
}
