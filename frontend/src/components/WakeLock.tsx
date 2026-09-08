import { useEffect } from 'react';
import { useWakeLock } from '~/hooks/useWakeLock';

function WakeLock() {
  const { isSupported, isActive, everActive, request } = useWakeLock();
  // The enlarged hint only appears before the lock has ever been held. After a
  // browser-forced release (e.g. tabbing away) the UI stays calm and silently
  // re-acquires, avoiding a grow/shrink jump on every tab switch.
  const enlarge = isSupported && !isActive && !everActive;

  // Fallback: normally the lock was acquired by the recipe-card tap. This only
  // runs when it wasn't (e.g. the page was opened directly), and only while the
  // page is actually visible. It has no cleanup, so React StrictMode's
  // double-mount can't drop an already-acquired lock. Calling request() from a
  // hidden page throws a NotAllowedError, so it's skipped here.
  useEffect(() => {
    if (!isSupported) {
      return;
    }
    if (document.visibilityState !== 'visible') {
      return;
    }
    void request();
  }, [isSupported, request]);

  // Re-acquire after the tab regains visibility if the system dropped the lock.
  // request() is a no-op when the lock is already held, so the extra call is
  // harmless and covers the case where the browser fired release implicitly.
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible') {
        void request();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, request]);

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className="relative flex">
        <button
          type="button"
          className="bg-background focus-visible:ring-border-focus rounded-full border-0 p-0 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
          disabled={!enlarge}
          aria-label={
            enlarge
              ? 'A képernyő ébren tartásához koppints ide'
              : isActive
                ? 'WakeLock aktív'
                : 'WakeLock nem támogatott'
          }
          title={enlarge ? 'A képernyő ébren tartásához koppints ide' : undefined}
          aria-pressed={isActive}
          onClick={() => {
            void request();
          }}>
          <div
            className={
              'bg-accent/20 flex gap-1 rounded-full transition-all duration-300 ease-in-out ' +
              (enlarge ? 'p-1.5' : 'p-1')
            }>
            <div
              className={
                'aspect-square rounded-full transition-all duration-300 ease-in-out ' +
                (isSupported ? 'bg-success ' : 'bg-danger ') +
                (enlarge ? 'h-3' : 'h-1')
              }
              title={isSupported ? 'WakeLock támogatott' : 'WakeLock nem támogatott'}></div>
            <div
              className={
                'aspect-square rounded-full transition-all duration-300 ease-in-out ' +
                (isActive ? 'bg-success ' : 'bg-danger ') +
                (enlarge ? 'h-3' : 'h-1')
              }
              title={isActive ? 'WakeLock aktív' : 'WakeLock inaktív'}></div>
          </div>
        </button>
        {enlarge ? (
          <div className="pointer-events-none absolute top-full right-0 mt-2 w-max animate-[hint-pop_5s_ease-out_forwards]">
            <div className="bg-surface text-text ring-border relative rounded-lg px-3 py-1.5 text-sm shadow-lg ring-1">
              <svg
                viewBox="0 0 18 9"
                className="pointer-events-none absolute -top-2 right-3 h-2 w-4"
                aria-hidden="true">
                <path d="M1 9 L9 1 L17 9 Z" fill="var(--color-surface)" />
                <path
                  d="M1 9 L9 1 M9 1 L17 9"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
              Koppints a képernyő ébren tartásához
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default WakeLock;
