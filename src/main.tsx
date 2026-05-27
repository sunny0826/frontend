import { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './i18n';
import './styles/index.css';

const Toaster = lazy(() =>
  import('sonner').then((module) => ({
    default: module.Toaster,
  })),
);

function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idleCallback =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(() => setReady(true))
        : window.setTimeout(() => setReady(true), 1);

    return () => {
      if (typeof idleCallback === 'number') {
        window.clearTimeout(idleCallback);
      } else if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallback);
      }
    };
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <Toaster position="top-right" duration={3000} richColors />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <>
    <RouterProvider router={router} />
    <DeferredToaster />
  </>
);
