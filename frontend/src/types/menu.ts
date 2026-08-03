import type { CalorieUnit } from './recipe';

export interface MenuSummary {
  id: number;
  title: string;
  item_count: number;
  total_kcal: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  recipe_id: number;
  recipe_title: string;
  quantity: number;
  recipe_unit: CalorieUnit | null;
  recipe_kcal: number | null;
  item_kcal: number | null;
}

export interface MenuDetail extends MenuSummary {
  items: MenuItem[];
}

export interface MenuItemInput {
  recipe_id: number;
  quantity: number;
}

export interface MenuInput {
  title: string;
  items: MenuItemInput[];
}
