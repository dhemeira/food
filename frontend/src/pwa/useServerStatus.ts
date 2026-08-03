import { useState, useEffect, useCallback, useRef } from 'react';

interface OnlineStatusMessage {
  type: string;
  online: boolean;
}

const POLL_INTERVAL = 30_000;

async function checkViaSw(): Promise<boolean> {
  const controller = navigator.serviceWorker.controller;
  if (!controller) return false;
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<{ online: boolean }>) => {
      resolve(event.data.online);
    };
    controller.postMessage({ type: 'CHECK_ONLINE' }, [channel.port2]);
  });
}

export function useServerStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const mountedRef = useRef(true);

  const check = useCallback(() => {
    if (!navigator.serviceWorker.controller) return;

    void checkViaSw().then((online) => {
      if (mountedRef.current) {
        setIsOnline(online);
      }
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    void navigator.serviceWorker.ready.then(() => {
      if (mountedRef.current) {
        check();
      }
    });

    const id = setInterval(check, POLL_INTERVAL);

    function handleSwMessage(event: MessageEvent) {
      const payload = event.data as OnlineStatusMessage | null;
      if (payload?.type === 'ONLINE_STATUS') {
        if (mountedRef.current) {
          setIsOnline(payload.online);
        }
      }
    }

    navigator.serviceWorker.addEventListener('message', handleSwMessage);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, [check]);

  return { isOnline, check };
}
