import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { createLocalStorageTreeRepository } from '@/modules/file-tree';

const container = document.getElementById('root');
if (container === null) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <AppShell repository={createLocalStorageTreeRepository(window.localStorage)} />
    </BrowserRouter>
  </StrictMode>,
);
