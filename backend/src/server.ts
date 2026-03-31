import 'dotenv/config';
import app from './app';
import { appConfig } from './config/appConfig';
import { registerLatePaymentCron } from './cron/latePayments';
import { registerMonthlyPaymentCron } from './cron/monthlyPayments';
import { registerDataRetentionCron } from './cron/dataRetention';

const PORT = appConfig.port;

if (appConfig.enableCronJobs) {
  registerMonthlyPaymentCron();
  registerLatePaymentCron();
  registerDataRetentionCron();
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
