import { useServiceWorkerUpdate } from '~/pwa/useServiceWorkerUpdate';

interface Props {
  isVisible: boolean;
}

function OfflineBanner({ isVisible }: Props) {
  const { updateAvailable } = useServiceWorkerUpdate();
  if (!isVisible) return null;

  return (
    <div
      className={
        (updateAvailable ? 'bottom-35 sm:bottom-15' : 'bottom-22 sm:bottom-2') +
        ' transition-all duration-300 ease-in-out ' +
        'bg-warning-bg text-warning border-warning-border fixed right-2 bottom-16 z-50 rounded-xl border px-3 py-3 text-center text-sm'
      }>
      Az offline verziót látod
    </div>
  );
}

export default OfflineBanner;
