import 'dotenv/config';
import app from './app';
import { appConfig } from './config/appConfig';
import { registerLatePaymentCron } from './cron/latePayments';
import { registerMonthlyPaymentCron } from './cron/monthlyPayments';
import { registerDataRetentionCron } from './cron/dataRetention';

const PORT = appConfig.port;
const HOST = '0.0.0.0';

if (appConfig.enableCronJobs) {
  registerMonthlyPaymentCron();
  registerLatePaymentCron();
  registerDataRetentionCron();
}

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
