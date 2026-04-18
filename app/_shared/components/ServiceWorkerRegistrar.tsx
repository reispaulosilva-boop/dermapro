'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('SW registration failed:', err));
    } else {
      // In development, unregister any stale SW from previous sessions
      // to prevent cache interference with hot-reload and RSC.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }
  }, []);

  return null;
}
