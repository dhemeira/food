import { BellAlertIcon, BellSlashIcon } from '@heroicons/react/24/solid';
import { usePushSubscription } from '~/hooks/usePushSubscription';

function NotificationToggle({ className }: { className?: string }) {
  const { status, subscribed, busy, canToggle, toggle } = usePushSubscription();

  if (status === 'unsupported') return null;

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
        <BellAlertIcon aria-hidden="true" className="text-success size-6.5 sm:size-5" />
      ) : (
        <BellSlashIcon aria-hidden="true" className="text-danger size-6.5 sm:size-5" />
      )}
    </button>
  );
}

export default NotificationToggle;
