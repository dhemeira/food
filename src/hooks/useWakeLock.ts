import { useCallback, useSyncExternalStore } from 'react';
import {
  isWakeLockActive,
  isWakeLockEverActive,
  isWakeLockSupported,
  releaseWakeLock,
  requestWakeLock,
  subscribeWakeLock,
} from '~/lib/wakeLock';

interface UseWakeLockResult {
  isSupported: boolean;
  isActive: boolean;
  everActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockResult {
  const isSupported = isWakeLockSupported();
  const isActive = useSyncExternalStore(subscribeWakeLock, isWakeLockActive);
  const everActive = useSyncExternalStore(subscribeWakeLock, isWakeLockEverActive);

  const request = useCallback(() => requestWakeLock(), []);
  const release = useCallback(() => releaseWakeLock(), []);

  return { isSupported, isActive, everActive, request, release };
}
