import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { createLocalStorageTreeRepository } from '@/modules/file-tree';
import { createLocalStoragePreferencesRepository } from '@/modules/preferences';
import { routerFuture } from '@/shared/routing/routerFuture';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './app/global.css';

const container = document.getElementById('root');
if (container === null) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter future={routerFuture}>
      <AppShell
        repository={createLocalStorageTreeRepository(window.localStorage)}
        preferences={createLocalStoragePreferencesRepository(window.localStorage)}
      />
    </BrowserRouter>
  </StrictMode>,
);
