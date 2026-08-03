const CACHE_NAME = 'recipe-shell-v1';
const SHELL_URLS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

let lastOnline = true;

function setOnline(value) {
  if (lastOnline === value) return;
  lastOnline = value;
  self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage({ type: 'ONLINE_STATUS', online: value });
    });
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_URLS).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== CACHE_NAME;
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_ONLINE') {
    event.ports[0].postMessage({ online: lastOnline });
  }
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (!response.ok) throw new Error('non-ok response');
          setOnline(true);
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put('/index.html', copy);
          });
          return response;
        })
        .catch(function () {
          setOnline(false);
          return caches.match('/index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      return (
        cached ||
        fetch(request)
          .then(function (response) {
            if (!response.ok) throw new Error('non-ok response');
            setOnline(true);
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, copy);
            });
            return response;
          })
          .catch(function () {
            setOnline(false);
            throw new Error('offline');
          })
      );
    })
  );
});

self.addEventListener('push', function (event) {
  var data = { title: 'Receptek', body: '' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (_e) {
      data = { title: 'Receptek', body: event.data.text() };
    }
  }

  var stamp = data.sentAt ? new Date(data.sentAt) : new Date();
  var timeStr = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(stamp);

  var body = [data.body, '(' + timeStr + ')'].filter(Boolean).join(' ');

  event.waitUntil(
    self.registration.showNotification(data.title || 'Receptek', {
      body: body,
      icon: '/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        if ('focus' in windowClients[i]) {
          return windowClients[i].focus().then(function () {
            return windowClients[i].navigate(target);
          });
        }
      }
      return clients.openWindow(target);
    })
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    fetch('/api/vapid-public-key.php')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        return self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });
      })
      .then(function (subscription) {
        return fetch('/api/subscribe.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON()),
        });
      })
      .catch(function () {})
  );
});

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var rawData = atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
