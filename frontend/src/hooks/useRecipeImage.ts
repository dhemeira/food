import { useEffect, useState } from 'react';
import { backend } from '~/backend';

interface UseRecipeImageResult {
  image: string | null;
  loading: boolean;
}

export function useRecipeImage(id: string | undefined, enabled: boolean): UseRecipeImageResult {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(id) && enabled);

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
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, enabled]);

  return { image, loading };
}
