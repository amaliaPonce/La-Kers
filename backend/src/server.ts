import 'dotenv/config';
import express from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import authRouter from './routes/auth';
import apartmentsRouter from './routes/apartments';
import tenantsRouter from './routes/tenants';
import paymentsRouter from './routes/payments';
import incidentsRouter from './routes/incidents';
import documentsRouter from './routes/documents';
import dashboardRouter from './routes/dashboard';
import contractsRouter from './routes/contracts';
import { authMiddleware } from './middleware/authMiddleware';
import { appConfig, isOriginAllowed } from './config/appConfig';
import { registerLatePaymentCron } from './cron/latePayments';
import { registerMonthlyPaymentCron } from './cron/monthlyPayments';
import { registerDataRetentionCron } from './cron/dataRetention';
import { createRateLimiter } from './middleware/rateLimit';
import { applySecurityHeaders } from './middleware/securityHeaders';
import { logError } from './utils/errorLogger';

const app = express();
const PORT = appConfig.port;

app.disable('x-powered-by');
app.set('trust proxy', appConfig.trustProxy);

const corsOptions: CorsOptionsDelegate = (req, callback) => {
  const originHeader = req.headers.origin;
  const requestOrigin = Array.isArray(originHeader) ? originHeader[0] : originHeader ?? undefined;
  if (isOriginAllowed(requestOrigin, appConfig.allowedOrigins)) {
    callback(null, { origin: requestOrigin ?? true, credentials: true });
    return;
  }
  callback(new Error('Origin not allowed by CORS policy'));
};

app.use(applySecurityHeaders(appConfig));
app.use(cors(corsOptions));
app.use(express.json({ limit: appConfig.requestBodyLimit }));
app.use(createRateLimiter({
  windowMs: appConfig.globalRateLimitWindowMs,
  maxRequests: appConfig.globalRateLimitMax,
  message: 'Too many requests'
}));

app.get('/health', (req, res) => res.send({ ready: true }));
app.get('/ready', (req, res) => res.send({ ready: true, environment: appConfig.nodeEnv }));

app.use('/auth', createRateLimiter({
  windowMs: appConfig.authRateLimitWindowMs,
  maxRequests: appConfig.authRateLimitMax,
  message: 'Too many authentication attempts',
  keyPrefix: 'auth'
}));
app.use('/auth', authRouter);

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

if (appConfig.enableCronJobs) {
  registerMonthlyPaymentCron();
  registerLatePaymentCron();
  registerDataRetentionCron();
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
