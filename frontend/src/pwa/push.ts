import { api } from '~/api/client';
import { urlBase64ToUint8Array } from '~/utils/urlBase64ToUint8Array';

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
  } catch {
    return null;
  }
}

export async function getVapidPublicKey(): Promise<string> {
  const data = await api<{ publicKey: string }>('/push/vapid-public-key');
  if (!data.publicKey) throw new Error('VAPID public key not available');
  return data.publicKey;
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = await getVapidPublicKey();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function saveSubscription(subscription: PushSubscription): Promise<void> {
  await api('/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
}

export async function removeSubscription(subscription: PushSubscription): Promise<void> {
  await api('/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
}
