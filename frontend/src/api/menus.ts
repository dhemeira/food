import type { MenuSummary, MenuDetail, MenuInput } from '~/types';
import { api } from '~/api/client';

export {
  type MenuSummary,
  type MenuItem,
  type MenuDetail,
  type MenuItemInput,
  type MenuInput,
} from '~/types';

export async function listMenus(): Promise<MenuSummary[]> {
  const data = await api<{ menus: MenuSummary[] }>('/menus');
  return data.menus;
}

export async function getMenu(id: number): Promise<MenuDetail> {
  const data = await api<{ menu: MenuDetail }>(`/menus/${String(id)}`);
  return data.menu;
}

export async function createMenu(input: MenuInput): Promise<number> {
  const data = await api<{ menu: { id: number } }>('/menus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.menu.id;
}

export async function updateMenu(id: number, input: MenuInput): Promise<void> {
  await api<{ menu: { id: number } }>(`/menus/${String(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteMenu(id: number): Promise<void> {
  await api(`/menus/${String(id)}`, { method: 'DELETE' });
}
