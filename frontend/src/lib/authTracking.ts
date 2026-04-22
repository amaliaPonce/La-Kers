export type AuthIntent = 'login' | 'signup';

const AUTH_INTENT_KEY = 'la-kers:auth-intent';

export const setAuthIntent = (intent: AuthIntent) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(AUTH_INTENT_KEY, intent);
};

export const consumeAuthIntent = (): AuthIntent | null => {
  if (typeof window === 'undefined') return null;

  const storedIntent = window.sessionStorage.getItem(AUTH_INTENT_KEY);
  window.sessionStorage.removeItem(AUTH_INTENT_KEY);

  return storedIntent === 'login' || storedIntent === 'signup' ? storedIntent : null;
};
