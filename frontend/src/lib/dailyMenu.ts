import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { Recipe } from '~/backend';

export type MealSlot = 'reggeli' | 'tizorai' | 'ebed' | 'uzsonna' | 'vacsora';

export interface MealEntry {
  recipeId: string;
  amount: number;
}

export interface DailyMenuState {
  target: number;
  meals: Partial<Record<MealSlot, MealEntry>>;
}

export const MEAL_SLOTS: { key: MealSlot; label: string }[] = [
  { key: 'reggeli', label: 'Reggeli' },
  { key: 'tizorai', label: 'Tízórai' },
  { key: 'ebed', label: 'Ebéd' },
  { key: 'uzsonna', label: 'Uzsonna' },
  { key: 'vacsora', label: 'Vacsora' },
];

const STORAGE_KEY = 'daily-menu';

const DEFAULT_STATE: DailyMenuState = { target: 2000, meals: {} };

function load(): DailyMenuState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<DailyMenuState>;
    return {
      target: typeof parsed.target === 'number' ? parsed.target : DEFAULT_STATE.target,
      meals: parsed.meals && typeof parsed.meals === 'object' ? parsed.meals : {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useDailyMenu(): [DailyMenuState, Dispatch<SetStateAction<DailyMenuState>>] {
  const [state, setState] = useState<DailyMenuState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState];
}

/** Default amount for a recipe: grams for kcal/100g, a single unit otherwise. */
export function defaultAmountFor(recipe: Recipe): number {
  return recipe.calorieUnit === 'kcal/100g' ? 100 : 1;
}

/** Unit label for the amount input. */
export function amountLabel(recipe: Recipe): string {
  switch (recipe.calorieUnit) {
    case 'kcal/100g':
      return 'g';
    case 'kcal/adag':
      return 'adag';
    case 'kcal/db':
      return 'db';
    default:
      return '';
  }
}

/** Calories for a meal, or null when the recipe has no calorie data. */
export function mealKcal(recipe: Recipe, amount: number): number | null {
  if (recipe.calorieValue == null) return null;
  switch (recipe.calorieUnit) {
    case 'kcal/100g':
      return (amount / 100) * recipe.calorieValue;
    case 'kcal/adag':
    case 'kcal/db':
      return amount * recipe.calorieValue;
    default:
      return null;
  }
}

/** Return the meals object with the given slot removed. */
export function omitMeal(
  meals: Partial<Record<MealSlot, MealEntry>>,
  key: MealSlot
): Partial<Record<MealSlot, MealEntry>> {
  const next: Partial<Record<MealSlot, MealEntry>> = {};
  for (const slot of MEAL_SLOTS) {
    if (slot.key !== key && meals[slot.key]) {
      next[slot.key] = meals[slot.key];
    }
  }
  return next;
}
