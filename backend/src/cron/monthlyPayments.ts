import cron from 'node-cron';
import { createPayment, getOccupiedContracts, hasPaymentForMonth } from '../services/paymentsService';

export function registerMonthlyPaymentCron() {
  cron.schedule('0 4 1 * *', async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const dueDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const contracts = await getOccupiedContracts(today.toISOString());

      for (const tenant of contracts) {
        const unit = tenant.units;
        if (!unit) {
          continue;
        }

        const alreadyExists = await hasPaymentForMonth(unit.id, month, year);
        if (alreadyExists) {
          continue;
        }

        await createPayment({
          unit_id: unit.id,
          tenant_person_id: tenant.id,
          amount: Number(unit.monthly_rent ?? 0),
          due_date: dueDate,
          month,
          year
        });
      }
    } catch (error) {
      console.error('[CRON][monthlyPayments]', error);
    }
  });
}
