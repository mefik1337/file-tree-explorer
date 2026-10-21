import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { createLocalStorageTreeRepository } from '@/modules/file-tree';

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

type RenderAppOptions = {
  readonly storedTree?: string;
};

export const renderApp = (route = '/', { storedTree }: RenderAppOptions = {}) => {
  const user = userEvent.setup();
  const repository = createLocalStorageTreeRepository(window.localStorage);
  if (storedTree !== undefined) repository.save(storedTree);

  render(
    <MemoryRouter initialEntries={[route]}>
      <AppShell repository={repository} />
      <LocationProbe />
    </MemoryRouter>,
  );

  return { user };
};

export const currentLocation = (): string => screen.getByTestId('location').textContent ?? '';
