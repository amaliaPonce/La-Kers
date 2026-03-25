import { NextFunction, Request, Response } from 'express';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimiterOptions = {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix?: string;
};

const store = new Map<string, RateLimitEntry>();

function buildClientKey(req: Request, keyPrefix = 'global') {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
  const ip = forwardedIp?.trim() || req.ip || 'unknown';
  return `${keyPrefix}:${ip}`;
}

export function clearRateLimitStore() {
  store.clear();
}

export function createRateLimiter(options: RateLimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const now = Date.now();
    const key = buildClientKey(req, options.keyPrefix);
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (current.count >= options.maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ message: options.message });
    }

    current.count += 1;
    store.set(key, current);
    return next();
  };
}
