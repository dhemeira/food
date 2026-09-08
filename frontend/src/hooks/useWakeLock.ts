import { useCallback, useSyncExternalStore } from 'react';
import {
  isWakeLockActive,
  isWakeLockSupported,
  releaseWakeLock,
  requestWakeLock,
  subscribeWakeLock,
} from '~/lib/wakeLock';

interface UseWakeLockResult {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockResult {
  const isSupported = isWakeLockSupported();
  const isActive = useSyncExternalStore(subscribeWakeLock, isWakeLockActive);

  const request = useCallback(() => requestWakeLock(), []);
  const release = useCallback(() => releaseWakeLock(), []);

  return { isSupported, isActive, request, release };
}
