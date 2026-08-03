import type { User } from '~/types';
import { api } from '~/api/client';

export async function listUsers(): Promise<User[]> {
  const data = await api<{ users: User[] }>('/admin/users');
  return data.users;
}

export async function changeUsername(userId: number, username: string): Promise<User> {
  const data = await api<{ user: User }>(`/admin/users/${String(userId)}/username`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return data.user;
}

export async function changePassword(userId: number, password: string): Promise<void> {
  await api(`/admin/users/${String(userId)}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: User['role'];
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const data = await api<{ user: User }>('/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function deleteUser(userId: number): Promise<void> {
  await api(`/admin/users/${String(userId)}`, { method: 'DELETE' });
}
