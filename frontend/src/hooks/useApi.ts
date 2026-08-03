import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApi<T>(fetcher: () => Promise<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const execute = useCallback((signal: AbortSignal) => {
    fetcherRef
      .current()
      .then((result) => {
        if (!signal.aborted) {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (!signal.aborted) {
          setError(err instanceof Error ? err.message : 'A kérés sikertelen.');
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
      });
  }, []);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    execute(new AbortController().signal);
  }, [execute]);

  useEffect(() => {
    const controller = new AbortController();
    execute(controller.signal);
    return () => {
      controller.abort();
    };
  }, [execute]);

  return { data, loading, error, reload };
}
