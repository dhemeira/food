import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWakeLockResult {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockResult {
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const wantedRef = useRef(false);

  const release = useCallback(async () => {
    wantedRef.current = false;

    const sentinel = sentinelRef.current;
    sentinelRef.current = null;
    setIsActive(false);

    if (sentinel) {
      try {
        await sentinel.release();
      } catch {
        /* already released */
      }
    }
  }, []);

  const request = useCallback(async () => {
    if (!supported || sentinelRef.current) return;

    wantedRef.current = true;

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        sentinelRef.current = null;
        setIsActive(false);
      });
    } catch {
      wantedRef.current = false;
      setIsActive(false);
    }
  }, [supported]);

  useEffect(() => {
    if (!supported) return;

    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible' && wantedRef.current && !sentinelRef.current) {
        void request();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supported, request]);

  useEffect(() => {
    return () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) {
        void sentinel.release().catch(() => undefined);
      }
    };
  }, []);

  return { isSupported: supported, isActive, request, release };
}
