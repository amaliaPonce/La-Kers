import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import apartmentsRouter from './routes/apartments';
import tenantsRouter from './routes/tenants';
import paymentsRouter from './routes/payments';
import incidentsRouter from './routes/incidents';
import documentsRouter from './routes/documents';
import dashboardRouter from './routes/dashboard';
import contractsRouter from './routes/contracts';
import { authMiddleware } from './middleware/authMiddleware';
import { registerLatePaymentCron } from './cron/latePayments';
import { registerMonthlyPaymentCron } from './cron/monthlyPayments';
import { registerDataRetentionCron } from './cron/dataRetention';
import { logError } from './utils/errorLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (req, res) => res.send({ ready: true }));

app.use('/auth', authRouter);

const documentsPath = path.resolve(__dirname, '../documents');
app.use('/documents', express.static(documentsPath));

app.use(authMiddleware);

app.use('/apartments', apartmentsRouter);
app.use('/tenants', tenantsRouter);
app.use('/payments', paymentsRouter);
app.use('/incidents', incidentsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/contracts', contractsRouter);
app.use('/documents', documentsRouter);
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError(err, {
    tag: 'server.error',
    route: req.path,
    payload: req.body,
    userId: (req as any).supabaseUser?.id
  });
  res.status(500).json({ message: 'Internal server failure' });
});

registerMonthlyPaymentCron();
registerLatePaymentCron();
registerDataRetentionCron();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
