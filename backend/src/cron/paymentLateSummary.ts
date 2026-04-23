import cron from 'node-cron';
import { runWeeklyLateSummarySweep } from '../services/paymentAutomationService';

export function registerWeeklyLateSummaryCron() {
  cron.schedule('0 8 * * 1', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await runWeeklyLateSummarySweep(today);
    } catch (error) {
      console.error('[CRON][weeklyLateSummary]', error);
    }
  });
}
