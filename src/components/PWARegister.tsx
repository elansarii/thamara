'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available!');
                  // Auto-reload to get new version
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Pre-cache additional routes after initial load
          if (navigator.serviceWorker.controller && 'requestIdleCallback' in window) {
            requestIdleCallback(() => {
              const routesToPreCache = [
                '/crop-plan/results',
                '/rainready',
                '/drops'
              ];

              navigator.serviceWorker.controller?.postMessage({
                type: 'CACHE_URLS',
                urls: routesToPreCache
              });
            });
          }
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
