import type { Ingredient, Step } from '~/backend';

export function parseIngredients(text: string): Ingredient[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('|');
      if (separator === -1) {
        return { quantity: '', name: line };
      }
      return {
        quantity: line.slice(0, separator).trim(),
        name: line.slice(separator + 1).trim(),
      };
    });
}

export function parseSteps(text: string): Step[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((instruction) => ({ instruction }));
}
