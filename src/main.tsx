import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { router } from './app/router';
import { DeferredToaster } from './app/deferred-toaster';
import './i18n';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <RouterProvider router={router} />
    <DeferredToaster />
  </ThemeProvider>
);
