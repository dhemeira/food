let sentinel: WakeLockSentinel | null = null;
let active = false;
let everActive = false;
let pendingRequest: Promise<boolean> | null = null;
// Bumped on release so an in-flight request can detect it and not re-activate.
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

function setEverActive(): void {
  if (everActive) return;
  everActive = true;
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

// Whether the lock was ever held in this page session. The "tap to enable" hint
// should only show before first engagement, not on every browser-forced release.
export function isWakeLockEverActive(): boolean {
  return everActive;
}

export function subscribeWakeLock(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doRequest(): Promise<boolean> {
  const requestEpoch = epoch;
  let lastError: unknown;

  // Right after a tab regains visibility the browser may still report the page
  // as hidden, throwing a transient NotAllowedError. Retry briefly until it settles.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (requestEpoch !== epoch) return false;

    try {
      const s = await navigator.wakeLock.request('screen');

      if (requestEpoch !== epoch) {
        await s.release().catch(() => undefined);
        return false;
      }

      sentinel = s;
      setActive(true);
      setEverActive();

      s.addEventListener('release', () => {
        if (sentinel === s) {
          sentinel = null;
          setActive(false);
        }
      });
      return true;
    } catch (error) {
      lastError = error;
      // The page is genuinely hidden, so retrying now is pointless.
      if (document.visibilityState !== 'visible') break;
      await delay(300);
    }
  }

  console.error('[wakeLock] request failed:', lastError);
  setActive(false);
  return false;
}

// iOS/WebKit only grants a screen wake lock while the caller holds transient
// user activation, so this must be called from a click/tap handler, not an effect.
export function requestWakeLock(): Promise<boolean> {
  if (!supported) return Promise.resolve(false);
  if (sentinel) return Promise.resolve(true);
  if (pendingRequest) return pendingRequest;

  pendingRequest = doRequest().finally(() => {
    pendingRequest = null;
  });
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
