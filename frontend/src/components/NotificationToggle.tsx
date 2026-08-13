import { BellCheck, BellOff } from 'lucide-react';
import { usePushSubscription } from '~/hooks/usePushSubscription';

function NotificationToggle({ className }: { className?: string }) {
  const { status, subscribed, busy, canToggle, toggle } = usePushSubscription();

  if (status === 'unsupported' || status === 'denied') return null;

  const label = subscribed ? 'Értesítések kikapcsolása' : 'Értesítések bekapcsolása';

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy || !canToggle}
      className={className}
      aria-label={label}
      aria-pressed={subscribed}
      title={label}>
      {subscribed ? (
        <BellCheck aria-hidden="true" className="text-success size-5" />
      ) : (
        <BellOff aria-hidden="true" className="text-danger size-5" />
      )}
    </button>
  );
}

export default NotificationToggle;
