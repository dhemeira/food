import { useCallback, useEffect, useState } from 'react';
import {
  getServiceWorkerRegistration,
  isPushSupported,
  subscribeToPush,
  saveSubscription,
  removeSubscription,
} from '~/pwa/push';

type PushStatus = 'checking' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>('checking');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      if (!isPushSupported()) {
        setStatus('unsupported');
        return;
      }
      const registration = await getServiceWorkerRegistration();
      if (cancelled) return;
      if (!registration) {
        setStatus('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setStatus('denied');
        return;
      }
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? 'subscribed' : 'unsubscribed');
    }

    void detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (busy || (status !== 'subscribed' && status !== 'unsubscribed' && status !== 'denied'))
      return;

    const previous = status;
    setBusy(true);
    setStatus(previous === 'subscribed' ? 'unsubscribed' : 'subscribed');

    try {
      const registration = await getServiceWorkerRegistration();
      if (previous === 'subscribed') {
        const subscription = await registration?.pushManager.getSubscription();
        if (!subscription) {
          setStatus(previous);
          return;
        }
        await removeSubscription(subscription);
        await subscription.unsubscribe();
      } else {
        const subscription = registration ? await subscribeToPush(registration) : null;
        if (!subscription) {
          setStatus(Notification.permission === 'denied' ? 'denied' : previous);
          return;
        }
        await saveSubscription(subscription);
      }
    } catch {
      setStatus(previous);
    } finally {
      setBusy(false);
    }
  }, [busy, status]);

  const subscribed = status === 'subscribed';
  const canToggle = status === 'subscribed' || status === 'unsubscribed' || status === 'denied';

  return { status, subscribed, busy, canToggle, toggle };
}
