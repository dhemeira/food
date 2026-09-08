import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { releaseWakeLock } from '~/lib/wakeLock';

const DETAIL_PATH = /^\/recipe\/(?!new$)[^/]+$/;

function WakeLockLifecycle() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = location.pathname;

    if (DETAIL_PATH.test(previous) && !DETAIL_PATH.test(location.pathname)) {
      void releaseWakeLock();
    }
  }, [location.pathname]);

  return null;
}

export default WakeLockLifecycle;
