import { useEffect, useState } from 'react';
import { backend, type Recipe } from '~/backend';

interface UseRecipesResult {
  recipes: Recipe[];
  loading: boolean;
}

export function useRecipes(): UseRecipesResult {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = backend.recipes.watch((rows) => {
      setRecipes(rows);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { recipes, loading };
}
