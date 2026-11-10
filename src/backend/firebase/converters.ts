import type { DocumentData } from 'firebase/firestore';
import { CALORIE_UNITS } from '../types';
import type { CalorieUnit, Ingredient, Recipe, RecipeInput, Step } from '../types';

function isCalorieUnit(value: unknown): value is CalorieUnit {
  return CALORIE_UNITS.includes(value as CalorieUnit);
}

function timestampToIso(value: unknown): string | null {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const date = (value as { toDate(): Date }).toDate();
    return date.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

export function recipeFromFirestore(id: string, data: DocumentData): Recipe {
  const ingredients: Ingredient[] = Array.isArray(data.ingredients)
    ? data.ingredients.map((item: DocumentData) => ({
        quantity: typeof item.quantity === 'string' ? item.quantity : '',
        name: typeof item.name === 'string' ? item.name : '',
      }))
    : [];

  const steps: Step[] = Array.isArray(data.steps)
    ? data.steps.map((item: DocumentData) => ({
        instruction: typeof item.instruction === 'string' ? item.instruction : '',
      }))
    : [];

  return {
    id,
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : null,
    calorieValue: typeof data.calorieValue === 'number' ? data.calorieValue : null,
    calorieUnit: isCalorieUnit(data.calorieUnit) ? data.calorieUnit : null,
    hasImage: data.hasImage === true,
    thumb: typeof data.thumb === 'string' ? data.thumb : null,
    ingredients,
    steps,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : null,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function recipeToFields(input: RecipeInput): DocumentData {
  return {
    title: input.title,
    description: input.description,
    calorieValue: input.calorieValue,
    calorieUnit: input.calorieUnit,
    ingredients: input.ingredients.map((i) => ({ quantity: i.quantity, name: i.name })),
    steps: input.steps.map((s) => ({ instruction: s.instruction })),
  };
}
