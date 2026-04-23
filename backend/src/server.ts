import 'dotenv/config';
import './monitoring/sentry';
import app from './app';
import { appConfig } from './config/appConfig';
import { registerLatePaymentCron } from './cron/latePayments';
import { registerMonthlyPaymentCron } from './cron/monthlyPayments';
import { registerDataRetentionCron } from './cron/dataRetention';
import { registerWeeklyLateSummaryCron } from './cron/paymentLateSummary';

const PORT = appConfig.port;
const HOST = '0.0.0.0';

if (appConfig.enableCronJobs) {
  registerMonthlyPaymentCron();
  registerLatePaymentCron();
  registerWeeklyLateSummaryCron();
  registerDataRetentionCron();
}

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
