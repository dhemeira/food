export type Role = 'admin' | 'family';

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  role: Role | null;
}

export type CalorieUnit = 'kcal/100g' | 'kcal/adag' | 'kcal/db';

export const CALORIE_UNITS: CalorieUnit[] = ['kcal/100g', 'kcal/adag', 'kcal/db'];

export interface Ingredient {
  quantity: string;
  name: string;
}

export interface Step {
  instruction: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  calorieValue: number | null;
  calorieUnit: CalorieUnit | null;
  imageUrl: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RecipeInput {
  title: string;
  description: string | null;
  calorieValue: number | null;
  calorieUnit: CalorieUnit | null;
  ingredients: Ingredient[];
  steps: Step[];
  imageUrl?: string | null;
}
