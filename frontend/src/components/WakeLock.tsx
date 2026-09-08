import { useCallback } from 'react';
import { useWakeLock } from '~/hooks/useWakeLock';

function WakeLock() {
  const { isSupported, isActive, request, release } = useWakeLock();

  const toggle = useCallback(() => {
    if (isActive) {
      void release();
    } else {
      void request();
    }
  }, [isActive, request, release]);

  if (!isSupported) {
    return null;
  }

  return (
    <label>
      <input type="checkbox" checked={isActive} onChange={toggle} />
      Képernyő ébren tartása receptnézés közben
    </label>
  );
}

export default WakeLock;
