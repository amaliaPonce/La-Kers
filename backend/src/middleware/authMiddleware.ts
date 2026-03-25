import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient';

export interface AuthenticatedRequest extends Request {
  supabaseUser?: {
    id: string;
    email?: string | null;
    role?: string;
    plan?: string | null;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = header.split(' ')[1];
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    const user = data?.user;
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.supabaseUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: typeof user.user_metadata?.plan === 'string' ? user.user_metadata.plan : null
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}
