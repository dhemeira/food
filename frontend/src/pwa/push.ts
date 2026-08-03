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
  const response = await fetch('/api/vapid-public-key.php');
  const data = (await response.json()) as { publicKey?: string };
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
  const body = JSON.stringify(subscription.toJSON());
  const response = await fetch('/api/subscribe.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!response.ok) throw new Error('Failed to save subscription');
}

export async function removeSubscription(subscription: PushSubscription): Promise<void> {
  const response = await fetch('/api/unsubscribe.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  if (!response.ok) throw new Error('Failed to remove subscription');
}
