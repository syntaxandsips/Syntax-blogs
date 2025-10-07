export interface SanitizeRedirectOptions {
  defaultValue?: string | null;
}

const DEFAULT_BASE_URL = 'http://localhost';

const hasProtocol = (value: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

export const sanitizeRedirect = (
  value: string | string[] | null | undefined,
  options: SanitizeRedirectOptions = {},
): string | null => {
  const { defaultValue = '/account' } = options;
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate || typeof candidate !== 'string') {
    return defaultValue;
  }

  const trimmed = candidate.trim();

  if (!trimmed) {
    return defaultValue;
  }

  if (trimmed.startsWith('//') || hasProtocol(trimmed)) {
    return defaultValue;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed, DEFAULT_BASE_URL);

    if (url.origin !== DEFAULT_BASE_URL) {
      return defaultValue;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return defaultValue;
  }
};
