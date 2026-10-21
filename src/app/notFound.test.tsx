import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { currentLocation, renderApp } from '@/test/renderApp';

describe('unknown pages', () => {
  it('offers a way back home', async () => {
    const { user } = renderApp('/settings');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Go to import' }));

    expect(currentLocation()).toBe('/');
  });
});
