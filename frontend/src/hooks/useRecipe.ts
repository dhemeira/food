import { useEffect, useState } from 'react';
import { backend, type Recipe } from '~/backend';

interface UseRecipeResult {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useRecipe(id: string | undefined): UseRecipeResult {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(() => id !== undefined);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const [previousId, setPreviousId] = useState(id);
  if (previousId !== id) {
    setPreviousId(id);
    setRecipe(null);
    setError(null);
    setLoading(id !== undefined);
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    backend.recipes
      .get(id)
      .then((result) => {
        if (!cancelled) {
          setRecipe(result);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'A kérés sikertelen.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, version]);

  return {
    recipe,
    loading,
    error,
    reload: () => {
      setVersion((v) => v + 1);
    },
  };
}
