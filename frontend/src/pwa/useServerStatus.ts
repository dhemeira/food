import { useState, useEffect, useCallback } from 'react';

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

  const check = useCallback(() => {
    void checkViaSw().then((online) => {
      setIsOnline(online);
    });
  }, []);

  useEffect(() => {
    check();

    const id = setInterval(check, POLL_INTERVAL);

    function handleSwMessage(event: MessageEvent) {
      const payload = event.data as OnlineStatusMessage | null;
      if (payload?.type === 'ONLINE_STATUS') {
        setIsOnline(payload.online);
      }
    }

    navigator.serviceWorker.addEventListener('message', handleSwMessage);

    return () => {
      clearInterval(id);
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, [check]);

  return { isOnline, check };
}
