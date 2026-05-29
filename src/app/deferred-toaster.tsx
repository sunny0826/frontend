import { lazy, Suspense, useEffect, useState } from 'react';

const Toaster = lazy(() =>
  import('sonner').then((module) => ({
    default: module.Toaster,
  })),
);

export function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const idleCallback: number = hasIdle
      ? window.requestIdleCallback(() => setReady(true))
      : window.setTimeout(() => setReady(true), 1);

    return () => {
      if (hasIdle && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleCallback);
      } else {
        window.clearTimeout(idleCallback);
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
