let sentinel: WakeLockSentinel | null = null;
let active = false;
let pendingRequest: Promise<boolean> | null = null;
let epoch = 0;

const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

const listeners = new Set<() => void>();

function setActive(next: boolean): void {
  if (active === next) return;
  active = next;
  for (const listener of [...listeners]) {
    listener();
  }
}

export function isWakeLockSupported(): boolean {
  return supported;
}

export function isWakeLockActive(): boolean {
  return active;
}

export function subscribeWakeLock(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function doRequest(): Promise<boolean> {
  const requestEpoch = epoch;

  try {
    const s = await navigator.wakeLock.request('screen');

    // A release() happened while we were waiting - don't re-activate.
    if (requestEpoch !== epoch) {
      await s.release().catch(() => undefined);
      return false;
    }

    sentinel = s;
    setActive(true);

    s.addEventListener('release', () => {
      if (sentinel === s) {
        sentinel = null;
        setActive(false);
      }
    });
    return true;
  } catch (error) {
    console.error('[wakeLock] request failed:', error);
    setActive(false);
    return false;
  } finally {
    pendingRequest = null;
  }
}

// iOS/WebKit only grants a screen wake lock while the caller holds transient
// user activation, so this must be called from a click/tap handler, not from an
// effect or timer.
export function requestWakeLock(): Promise<boolean> {
  if (!supported) return Promise.resolve(false);
  if (sentinel) return Promise.resolve(true);
  if (pendingRequest) return pendingRequest;

  pendingRequest = doRequest();
  return pendingRequest;
}

export async function releaseWakeLock(): Promise<void> {
  epoch += 1;

  const s = sentinel;
  sentinel = null;
  setActive(false);

  if (s) {
    try {
      await s.release();
    } catch {
      /* already released */
    }
  }
}
