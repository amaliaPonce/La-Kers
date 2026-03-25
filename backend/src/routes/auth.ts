import { Router } from 'express';
import { supabaseClient, supabaseAdmin } from '../config/supabaseClient';
import { logError } from '../utils/errorLogger';
import { getPlanDefinition, FREEMIUM_PLAN_ID } from '../config/plans';
import { getOwnerUnits, buildPlanPayload } from '../services/ownersService';

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

function normalizeCompanyCif(value: unknown) {
  if (!value) return null;
  const normalized = String(value).replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim();
  return normalized || null;
}

function normalizePersonalDni(value: unknown) {
  if (!value) return null;
  const normalized = String(value).replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim();
  return normalized || null;
}

function validateCompanyCif(value: string | null) {
  const errors: string[] = [];
  if (!value) {
    errors.push('El CIF de la empresa es obligatorio');
    return errors;
  }
  const pattern = /^[A-Z0-9]{8,10}$/;
  if (!pattern.test(value)) {
    errors.push('CIF inválido');
  }
  return errors;
}

function validatePersonalDni(value: string | null) {
  const errors: string[] = [];
  if (!value) {
    errors.push('El DNI/NIE es obligatorio');
    return errors;
  }
  const pattern = /^[XYZ]?[0-9]{7}[A-Z]$/;
  if (!pattern.test(value)) {
    errors.push('DNI/NIE inválido');
  }
  return errors;
}

function buildOwnerIdentifier(metadata?: Record<string, unknown>) {
  const hasDni = typeof metadata?.personal_dni === 'string';
  const hasCif = typeof metadata?.company_cif === 'string';
  const value = hasDni ? metadata?.personal_dni : hasCif ? metadata?.company_cif : null;
  const typeFromMeta = typeof metadata?.identification_type === 'string' ? metadata.identification_type : undefined;
  const fallbackType = hasDni ? 'dni' : 'cif';
  const type = typeFromMeta ?? fallbackType;
  return {
    type,
    value
  };
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
  const companyCif = normalizeCompanyCif(req.body?.company_cif);
  const personalDni = normalizePersonalDni(req.body?.personal_dni);
  const validationErrors = validateCredentials(req.body);
  const identifierErrors: string[] = [];
  if (!companyCif && !personalDni) {
    identifierErrors.push('El CIF o DNI de la empresa es obligatorio');
  }
  if (companyCif) {
    identifierErrors.push(...validateCompanyCif(companyCif));
  }
  if (personalDni) {
    identifierErrors.push(...validatePersonalDni(personalDni));
  }
  const allErrors = [...validationErrors, ...identifierErrors];
  if (allErrors.length) {
    return res.status(400).json({ message: 'Datos inválidos', errors: allErrors });
  }

  try {
    const { email, password } = req.body;
    const metadata: Record<string, string> = {
      plan: FREEMIUM_PLAN_ID
    };
    if (typeof full_name === 'string') {
      metadata.full_name = full_name;
    }
    if (companyCif) {
      metadata.company_cif = companyCif;
    }
    if (personalDni) {
      metadata.personal_dni = personalDni;
    }
    metadata.identification_type = personalDni ? 'dni' : 'cif';
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata,
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

    const planDefinition = getPlanDefinition(data.user?.user_metadata?.plan);
    const ownerUnits = await getOwnerUnits(data.user?.id ?? '');
    const identifier = buildOwnerIdentifier(data.user?.user_metadata as Record<string, unknown> | undefined);
    res.status(201).json({
      session: sessionData.session,
      user: data.user,
      owner: {
        units: ownerUnits,
        plan: buildPlanPayload(planDefinition),
        identifier
      }
    });
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

  const planDefinition = getPlanDefinition(data.user?.user_metadata?.plan);
  const ownerUnits = await getOwnerUnits(data.user?.id ?? '');
  const ownerIdentifier = buildOwnerIdentifier(data.user?.user_metadata as Record<string, unknown> | undefined);
  res.json({
    session: data.session,
    user: data.user,
    owner: {
      units: ownerUnits,
      plan: buildPlanPayload(planDefinition),
      identifier: ownerIdentifier
    }
  });
});

export default router;
