import { useEffect, useState } from 'react';
import { backend } from '~/backend';

interface UseRecipeImageResult {
  image: string | null;
  loading: boolean;
  error: string | null;
}

export function useRecipeImage(id: string | undefined, enabled: boolean): UseRecipeImageResult {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(id) && enabled);
  const [error, setError] = useState<string | null>(null);

  const [previousId, setPreviousId] = useState(id);
  const [previousEnabled, setPreviousEnabled] = useState(enabled);
  if (previousId !== id || previousEnabled !== enabled) {
    setPreviousId(id);
    setPreviousEnabled(enabled);
    setImage(null);
    setError(null);
    setLoading(Boolean(id) && enabled);
  }

  useEffect(() => {
    if (!id || !enabled) return;

    let cancelled = false;

    backend.images
      .get(id)
      .then((result) => {
        if (!cancelled) {
          setImage(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'A kép betöltése nem sikerült.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, enabled]);

  return { image, loading, error };
}
