const REQUIRED_RUNTIME_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLERK_SECRET_KEY',
  'LANDLORD_NAME',
  'LANDLORD_IDENTIFICATION',
  'LANDLORD_ADDRESS'
] as const;

export type ReadinessStatus =
  | {
      ready: true;
      environment: string;
    }
  | {
      ready: false;
      environment: string;
      reason: 'missing_env' | 'supabase_unreachable';
      missingKeys?: string[];
      upstreamStatus?: number;
      message: string;
    };

export function getMissingRuntimeEnvKeys(env: NodeJS.ProcessEnv) {
  return REQUIRED_RUNTIME_ENV_KEYS.filter((key) => !env[key]?.trim());
}

export async function getReadinessStatus(
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch = fetch
): Promise<ReadinessStatus> {
  const environment = env.NODE_ENV?.trim() || 'development';
  const missingKeys = getMissingRuntimeEnvKeys(env);

  if (missingKeys.length) {
    return {
      ready: false,
      environment,
      reason: 'missing_env',
      missingKeys: [...missingKeys],
      message: 'Faltan variables de entorno críticas'
    };
  }

  const supabaseUrl = env.SUPABASE_URL!.replace(/\/+$/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetchImpl(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ready: false,
        environment,
        reason: 'supabase_unreachable',
        upstreamStatus: response.status,
        message: 'Supabase no respondió correctamente'
      };
    }

    return {
      ready: true,
      environment
    };
  } catch {
    return {
      ready: false,
      environment,
      reason: 'supabase_unreachable',
      message: 'No se pudo contactar con Supabase'
    };
  } finally {
    clearTimeout(timeout);
  }
}
