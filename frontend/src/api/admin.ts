import { api } from '~/api/client';
import type { User } from '~/api/auth';

export async function listUsers(): Promise<User[]> {
  const data = await api<{ users: User[] }>('/admin/users');
  return data.users;
}

export async function changePassword(userId: number, password: string): Promise<void> {
  await api(`/admin/users/${String(userId)}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}
