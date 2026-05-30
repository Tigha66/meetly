
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('SW registered:', registration.scope);
          },
          function(err) {
            console.log('SW registration failed:', err);
          }
        );
      });
    }
  }, []);

  return null;
}
