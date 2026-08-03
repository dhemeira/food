import { useState, useEffect } from 'react';
import {
  registerServiceWorker,
  subscribeToPush,
  saveSubscription,
  removeSubscription,
  isPushSupported,
} from '~/pwa/push';
import { useServerStatus } from '~/pwa/useServerStatus';

type Phase = 'idle' | 'loading' | 'checking' | 'unsupported' | 'denied' | 'subscribed' | 'error';

interface Status {
  phase: Phase;
  message: string;
}

function NotificationPanel() {
  const [status, setStatus] = useState<Status>({ phase: 'checking', message: '' });
  const { isOnline, check: recheckServer } = useServerStatus();

  useEffect(() => {
    void Promise.resolve()
      .then(async () => {
        if (!isPushSupported()) {
          setStatus({
            phase: 'unsupported',
            message: 'A push értesítések nem támogatottak ebben a böngészőben.',
          });
          return;
        }

        const reg = await registerServiceWorker();
        if (!reg) {
          setStatus({
            phase: 'unsupported',
            message: 'Nem sikerült regisztrálni a service workert.',
          });
          return;
        }

        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          setStatus({ phase: 'subscribed', message: 'Már feliratkoztál a push értesítésekre.' });
        } else if (Notification.permission === 'denied') {
          setStatus({
            phase: 'denied',
            message: 'Az értesítések le vannak tiltva. Engedélyezd a böngésző beállításaiban.',
          });
        } else {
          setStatus({ phase: 'idle', message: '' });
        }
      })
      .catch(() => {
        setStatus({ phase: 'error', message: 'Nem sikerült a service worker regisztrációja.' });
      });
  }, []);

  async function handleSubscribe() {
    if (!isPushSupported()) return;
    setStatus({ phase: 'loading', message: 'Engedély kérése...' });
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await subscribeToPush(reg);
      if (!subscription) {
        setStatus({
          phase: Notification.permission === 'denied' ? 'denied' : 'error',
          message:
            Notification.permission === 'denied'
              ? 'Az értesítések le vannak tiltva.'
              : 'Nem sikerült feliratkozni.',
        });
        return;
      }
      setStatus({ phase: 'loading', message: 'Feliratkozás mentése...' });
      await saveSubscription(subscription);
      setStatus({ phase: 'subscribed', message: 'Feliratkozva a push értesítésekre.' });
    } catch (err) {
      setStatus({
        phase: 'error',
        message: err instanceof Error ? err.message : 'A feliratkozás sikertelen.',
      });
    }
  }

  function handleRetry() {
    setStatus({ phase: 'idle', message: '' });
    recheckServer();
  }

  async function handleUnsubscribe() {
    setStatus({ phase: 'loading', message: 'Lemondás...' });
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription(subscription);
        await subscription.unsubscribe();
      }
      setStatus({ phase: 'idle', message: '' });
    } catch {
      setStatus({
        phase: 'error',
        message: 'Nem sikerült lemondani az értesítéseket.',
      });
    }
  }

  if (status.phase === 'unsupported' || status.phase === 'checking') {
    return (
      <div className="border-border bg-surface text-text-muted rounded-xl border px-4 py-3 text-sm">
        {status.message || 'Ellenőrzés...'}
      </div>
    );
  }

  const buttonDisabled = status.phase === 'loading';

  if (status.phase === 'subscribed') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="border-success-border bg-success-bg text-success rounded-xl border px-4 py-3 text-sm">
          {status.message}
        </div>
        {isOnline !== false && (
          <button
            className="border-border hover:bg-surface rounded-xl border px-5 py-2.5 text-base font-medium transition-colors"
            disabled={buttonDisabled}
            onClick={() => void handleUnsubscribe()}>
            {buttonDisabled ? 'Folyamatban...' : 'Értesítések lemondása'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {isOnline !== null && (
        <p className={`text-sm ${isOnline ? 'text-success' : 'text-accent'}`}>
          Szerver: {isOnline ? 'elérhető' : 'nem érhető el'}
        </p>
      )}
      {status.phase === 'error' && <p className="text-accent text-sm">{status.message}</p>}
      {status.phase === 'denied' && <p className="text-accent text-sm">{status.message}</p>}
      {status.phase === 'loading' && <p className="text-text-muted text-sm">{status.message}</p>}
      <button
        className="bg-accent text-surface rounded-xl px-5 py-2.5 text-base font-medium shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        disabled={buttonDisabled}
        onClick={
          status.phase === 'error' || status.phase === 'denied' ? handleRetry : handleSubscribe
        }>
        {buttonDisabled
          ? 'Folyamatban...'
          : status.phase === 'error' || status.phase === 'denied'
            ? 'Újra'
            : 'Értesítések engedélyezése'}
      </button>
    </div>
  );
}

export default NotificationPanel;
