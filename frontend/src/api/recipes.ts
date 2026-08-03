import type { RecipeInput, RecipeSummary, RecipeDetail } from '~/types';
import { api } from '~/api/client';

export {
  type RecipeSummary,
  type Ingredient,
  type Step,
  type RecipeDetail,
  type RecipeInput,
  type CalorieUnit,
  CALORIE_UNITS,
} from '~/types';

export async function listRecipes(): Promise<RecipeSummary[]> {
  const data = await api<{ recipes: RecipeSummary[] }>('/recipes');
  return data.recipes;
}

export async function getRecipe(id: number): Promise<RecipeDetail> {
  const data = await api<{ recipe: RecipeDetail }>(`/recipes/${String(id)}`);
  return data.recipe;
}

export async function createRecipe(input: RecipeInput, image: File | null): Promise<number> {
  const data = await api<{ recipe: { id: number } }>('/recipes', {
    method: 'POST',
    body: recipeToFormData(input, image, false),
  });
  return data.recipe.id;
}

export async function updateRecipe(
  id: number,
  input: RecipeInput,
  image: File | null,
  removeImage: boolean
): Promise<void> {
  await api<{ recipe: { id: number } }>(`/recipes/${String(id)}`, {
    method: 'POST',
    body: recipeToFormData(input, image, removeImage),
  });
}

export async function deleteRecipe(id: number): Promise<void> {
  await api(`/recipes/${String(id)}`, { method: 'DELETE' });
}

function recipeToFormData(input: RecipeInput, image: File | null, removeImage: boolean): FormData {
  const form = new FormData();
  form.append('title', input.title);
  form.append('description', input.description);
  form.append('calorie_value', input.calorieValue);
  form.append('calorie_unit', input.calorieUnit);
  form.append('ingredients', JSON.stringify(input.ingredients));
  form.append('steps', JSON.stringify(input.steps));
  if (image) {
    form.append('image', image);
  }
  if (removeImage) {
    form.append('remove_image', '1');
  }
  return form;
}
