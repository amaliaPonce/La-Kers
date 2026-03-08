import { Router } from 'express';
import { supabaseClient, supabaseAdmin } from '../config/supabaseClient';
import { logError } from '../utils/errorLogger';

const router = Router();

function validateCredentials(payload: Record<string, unknown>) {
  const errors: string[] = [];
  const { email, password } = payload;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Email inválido');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  return errors;
}

function buildSupabaseErrorPayload(error: any, fallbackMessage: string) {
  return {
    message: error?.message ?? fallbackMessage,
    status: error?.status,
    details: error?.details,
    hint: error?.hint,
    error: error?.error
  };
}

function respondWithSupabaseError(res: import('express').Response, error: any, fallbackMessage: string, fallbackStatus = 400) {
  return res.status(error?.status ?? fallbackStatus).json(buildSupabaseErrorPayload(error, fallbackMessage));
}

router.post('/register', async (req, res) => {
  const { full_name } = req.body ?? {};
  const validationErrors = validateCredentials(req.body);
  if (validationErrors.length) {
    return res.status(400).json({ message: 'Datos inválidos', errors: validationErrors });
  }

  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: typeof full_name === 'string' ? { full_name } : undefined,
      email_confirm: true
    });

    if (error || !data?.user) {
      logError(error, {
        tag: 'auth.register',
        route: '/auth/register',
        payload: { email, full_name },
        userId: undefined
      });
      return respondWithSupabaseError(res, error, 'No se pudo crear el usuario');
    }

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError || !sessionData?.session) {
      logError(sessionError, {
        tag: 'auth.register',
        route: '/auth/register',
        payload: { email },
        userId: undefined
      });
      return respondWithSupabaseError(
        res,
        sessionError,
        'Usuario creado pero no se pudo iniciar sesión',
        500
      );
    }

    res.status(201).json({ session: sessionData.session, user: data.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno al crear el usuario' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || typeof email !== 'string' || !email.includes('@') || !password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Email o contraseña inválidos' });
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    return res.status(401).json({ message: error?.message ?? 'Invalid credentials' });
  }

  res.json({ session: data.session, user: data.user });
});

export default router;
