import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './app/router';
import './i18n';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <>
    <RouterProvider router={router} />
    <Toaster position="top-right" duration={3000} richColors />
  </>
);
