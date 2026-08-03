import { api } from '~/api/client';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'family';
}

export async function getMe(): Promise<User | null> {
  const data = await api<{ user: User | null }>('/auth/me');
  return data.user;
}

export async function login(username: string, password: string): Promise<User> {
  const data = await api<{ user: User }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await api<{ status: string }>('/auth/logout', { method: 'POST' });
}
