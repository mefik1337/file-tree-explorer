import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { createLocalStorageTreeRepository } from '@/modules/file-tree';
import { createLocalStoragePreferencesRepository } from '@/modules/preferences';
import { routerFuture } from '@/shared/routing/routerFuture';

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

type RenderAppOptions = {
  readonly storedTree?: string;
  readonly storage?: Storage;
};

export const renderApp = (route = '/', { storedTree, storage = window.localStorage }: RenderAppOptions = {}) => {
  const user = userEvent.setup();
  const repository = createLocalStorageTreeRepository(storage);
  if (storedTree !== undefined) repository.save(storedTree);

  render(
    <MemoryRouter initialEntries={[route]} future={routerFuture}>
      <AppShell repository={repository} preferences={createLocalStoragePreferencesRepository(window.localStorage)} />
      <LocationProbe />
    </MemoryRouter>,
  );

  return { user };
};

export const currentLocation = (): string => screen.getByTestId('location').textContent ?? '';
