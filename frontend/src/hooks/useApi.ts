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

  const execute = useCallback(async (signal: AbortSignal) => {
    try {
      const result = await fetcherRef.current();
      if (!signal.aborted) {
        setData(result);
      }
    } catch (err: unknown) {
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'A kérés sikertelen.');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    void execute(new AbortController().signal);
  }, [execute]);

  useEffect(() => {
    const controller = new AbortController();
    void execute(controller.signal);
    return () => {
      controller.abort();
    };
  }, [execute]);

  return { data, loading, error, reload };
}
