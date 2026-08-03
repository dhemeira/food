import { useEffect, useState } from 'react';

export interface ServiceWorkerUpdate {
  updateAvailable: boolean;
  reload: () => Promise<void>;
}

/**
 * Reports when a newer service worker has been installed and is waiting to
 * activate, so the UI can prompt the user to reload and pick up the update.
 */
export function useServiceWorkerUpdate(): ServiceWorkerUpdate {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshed) return;
      refreshed = true;
      window.location.reload();
    });

    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
          return;
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => undefined);
  }, []);

  const reload = async () => {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      await registration.update();
    }
  };

  return { updateAvailable, reload };
}
