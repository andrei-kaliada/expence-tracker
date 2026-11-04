'use server';

import type { AuthResponse } from '@expense/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { loginSchema, registerSchema } from '@/lib/schemas/auth';

export interface ActionState {
  error?: string;
}

async function authenticate(path: string, body: unknown): Promise<ActionState> {
  let result: AuthResponse;
  try {
    result = await api<AuthResponse>(path, { method: 'POST', body: JSON.stringify(body) });
  } catch (err) {
    if (err instanceof ApiError && err.status < 500) {
      return { error: err.messages.join('. ') || 'Request failed' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }

  (await cookies()).set('access_token', result.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect('/');
}

export async function loginAction(values: unknown): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: 'Invalid input' };
  return authenticate('/auth/login', parsed.data);
}

export async function registerAction(values: unknown): Promise<ActionState> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { error: 'Invalid input' };
  return authenticate('/auth/register', parsed.data);
}
