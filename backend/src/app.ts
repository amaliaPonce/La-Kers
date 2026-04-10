import express from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import { clerkMiddleware } from '@clerk/express';
import apartmentsRouter from './routes/apartments';
import tenantsRouter from './routes/tenants';
import paymentsRouter from './routes/payments';
import incidentsRouter from './routes/incidents';
import documentsRouter from './routes/documents';
import dashboardRouter from './routes/dashboard';
import contractsRouter from './routes/contracts';
import tenantPortalRouter from './routes/tenantPortal';
import billingRouter, { billingWebhookHandler, billingWebhookMiddleware } from './routes/billing';
import { authMiddleware } from './middleware/authMiddleware';
import { appConfig, isOriginAllowed } from './config/appConfig';
import { createRateLimiter } from './middleware/rateLimit';
import { applySecurityHeaders } from './middleware/securityHeaders';
import { logError } from './utils/errorLogger';
import { getReadinessStatus } from './utils/readiness';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', appConfig.trustProxy);

const corsOptions: CorsOptionsDelegate = (req, callback) => {
  const originHeader = req.headers.origin;
  const requestOrigin = Array.isArray(originHeader) ? originHeader[0] : originHeader ?? undefined;
  if (isOriginAllowed(requestOrigin, appConfig.allowedOrigins)) {
    callback(null, { origin: requestOrigin ?? true, credentials: true });
    return;
  }
  callback(new Error('Origen no permitido por la política CORS'));
};

app.use(applySecurityHeaders(appConfig));
app.use(cors(corsOptions));
app.post('/billing/webhook', billingWebhookMiddleware, billingWebhookHandler);
app.use(express.json({ limit: appConfig.requestBodyLimit }));
app.use(createRateLimiter({
  windowMs: appConfig.globalRateLimitWindowMs,
  maxRequests: appConfig.globalRateLimitMax,
  message: 'Demasiadas solicitudes'
}));

app.get('/health', (req, res) => res.send({ ready: true }));
app.get('/ready', async (req, res) => {
  const readiness = await getReadinessStatus(process.env);

  if (!readiness.ready) {
    return res.status(503).json(readiness);
  }

  return res.send(readiness);
});

app.use(clerkMiddleware());
app.use(authMiddleware);

app.use('/apartments', apartmentsRouter);
app.use('/tenants', tenantsRouter);
app.use('/payments', paymentsRouter);
app.use('/incidents', incidentsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/contracts', contractsRouter);
app.use('/documents', documentsRouter);
app.use('/tenant-portal', tenantPortalRouter);
app.use('/billing', billingRouter);
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError(err, {
    tag: 'server.error',
    route: req.path,
    payload: req.body,
    userId: (req as any).authUser?.id
  });
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
