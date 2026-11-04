const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[],
    path: string,
  ) {
    super(`API ${status}: ${path}`);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', ...init, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = body?.message;
    throw new ApiError(res.status, Array.isArray(message) ? message : message ? [message] : [], path);
  }
  return res.json() as Promise<T>;
}
