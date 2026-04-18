// DermaPro Service Worker
// Cache name: bump version here to force re-cache on all clients.
const CACHE_NAME = 'dermapro-assets-v1';

// Assets to pre-cache on install (app shell only — keep minimal).
const PRECACHE_URLS = [
  '/',
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
// Pre-cache the app shell and take control immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
// Delete caches from previous versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Ignore non-GET requests (POST, etc.).
  if (request.method !== 'GET') return;

  // ── Immutable assets: _next/static/ ──
  // Next.js puts content hashes in these filenames — safe to cache forever.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Static public assets: fonts, images, models ──
  if (
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── HTML navigation: network-first ──
  // Ensures HTML is always fresh (Next.js RSC payloads included).
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── Everything else: network-first with cache fallback ──
  event.respondWith(networkFirst(request));
});

// ─── STRATEGIES ───────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // No network and not cached — nothing we can do.
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}
