export type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: unknown;
};

const TOKEN_KEY = 'lc_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

async function parseError(res: Response): Promise<Error> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    body = null;
  }
  const message = body?.message || `Request failed: ${res.status}`;
  return new Error(message);
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = getAuthToken();

  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: {
      ...(headers || {}),
      ...(rest.body && !(rest.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
