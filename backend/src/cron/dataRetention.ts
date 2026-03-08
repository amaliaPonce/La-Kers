import cron from 'node-cron';
import { anonymizeOldTenants } from '../services/tenantsService';
import { purgeOldPayments } from '../services/paymentsService';

export function registerDataRetentionCron() {
  cron.schedule('0 5 1 * *', async () => {
    try {
      await anonymizeOldTenants();
      await purgeOldPayments();
    } catch (error) {
      console.error('[CRON][dataRetention]', error);
    }
  });
}
