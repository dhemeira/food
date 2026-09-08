import { useEffect } from 'react';
import { useWakeLock } from '~/hooks/useWakeLock';

function WakeLock() {
  const { isSupported, isActive, request, release } = useWakeLock();

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    void request();

    return () => {
      void release();
    };
  }, [isSupported, request, release]);

  return (
    <div className="bg-background fixed top-2 right-2 rounded-full">
      <div className="bg-accent/20 flex gap-1 rounded-full p-1">
        <div
          className={'h-1 w-1 rounded-full ' + (isSupported ? 'bg-success' : 'bg-danger')}
          title={isSupported ? 'WakeLock támogatott' : 'WakeLock nem támogatott'}></div>
        <div
          className={'h-1 w-1 rounded-full ' + (isActive ? 'bg-success' : 'bg-danger')}
          title={isActive ? 'WakeLock aktív' : 'WakeLock inaktív'}></div>
      </div>
    </div>
  );
}

export default WakeLock;
