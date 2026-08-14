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
        (updateAvailable ? 'sm:bottom-22' : 'sm:bottom-2') +
        ' sticky top-0 transition-all duration-300 ease-in-out sm:fixed sm:top-auto ' +
        'bg-warning-bg text-warning border-warning-border right-5.5 z-50 flex h-8 items-center justify-center border-b text-center text-sm font-medium sm:h-15 sm:w-72 sm:rounded-full sm:border'
      }>
      Offline nézet
    </div>
  );
}

export default OfflineBanner;
