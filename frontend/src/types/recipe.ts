export type CalorieUnit = 'kcal/100g' | 'kcal/adag' | 'kcal/db';

export const CALORIE_UNITS: CalorieUnit[] = ['kcal/100g', 'kcal/adag', 'kcal/db'];

export interface RecipeSummary {
  id: number;
  title: string;
  description: string | null;
  has_image: boolean;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  calorie_value: number | null;
  calorie_unit: CalorieUnit | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  quantity: string;
  name: string;
}

export interface Step {
  step_number: number;
  instruction: string;
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: Ingredient[];
  steps: Step[];
}

export interface RecipeInput {
  title: string;
  description: string;
  ingredients: { quantity: string; name: string }[];
  steps: { instruction: string }[];
  calorieValue: string;
  calorieUnit: string;
}
