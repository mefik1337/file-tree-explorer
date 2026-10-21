import { StrictMode } from 'react';
import './app/global.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { createLocalStorageTreeRepository } from '@/modules/file-tree';
import { routerFuture } from '@/shared/routing/routerFuture';

const container = document.getElementById('root');
if (container === null) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter future={routerFuture}>
      <AppShell repository={createLocalStorageTreeRepository(window.localStorage)} />
    </BrowserRouter>
  </StrictMode>,
);
