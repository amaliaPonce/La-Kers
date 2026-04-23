import axios from 'axios';

type ApiErrorPayload = {
  message?: string;
  errors?: unknown[];
};

const getApiErrorPayload = (error: unknown): ApiErrorPayload | null => {
  if (!axios.isAxiosError(error)) return null;
  const responseData = error.response?.data;
  if (!responseData || typeof responseData !== 'object') return null;
  return responseData as ApiErrorPayload;
};

export const getErrorStatus = (error: unknown) => {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.status ?? null;
};

export const getErrorMessage = (
  error: unknown,
  fallback: string,
  options: { joiner?: string } = {}
) => {
  const payload = getApiErrorPayload(error);
  const joiner = options.joiner ?? ', ';

  if (Array.isArray(payload?.errors)) {
    const messages = payload.errors
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean);

    if (messages.length) {
      return messages.join(joiner);
    }
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};

export const getNotFoundAwareErrorMessage = (
  error: unknown,
  notFoundMessage: string,
  fallbackMessage: string
) => {
  return getErrorStatus(error) === 404
    ? notFoundMessage
    : getErrorMessage(error, fallbackMessage);
};
