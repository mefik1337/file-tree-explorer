import { cleanup, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';

const columns = (): HTMLElement => screen.getByRole('region', { name: 'Columns' });

const columnNames = (): string[] =>
  within(columns())
    .getAllByRole('list')
    .map((list) => list.getAttribute('aria-label') ?? '');

describe('column view', () => {
  it('is off by default', () => {
    renderApp('/tree', { storedTree: sampleJson });

    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    expect(screen.queryByRole('region', { name: 'Columns' })).not.toBeInTheDocument();
  });

  it('shows one column per folder on the way to the selected node', async () => {
    const { user } = renderApp('/tree/src%2Fcomponents%2FButton.tsx', { storedTree: sampleJson });

    await user.click(screen.getByRole('radio', { name: 'Columns' }));

    expect(columnNames()).toEqual(['root', 'src', 'components']);
    expect(within(screen.getByRole('list', { name: 'root' })).getByRole('link', { name: 'src' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      within(screen.getByRole('list', { name: 'components' })).getByRole('link', { name: 'Button.tsx' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 1, name: 'Button.tsx' })).toBeInTheDocument();
  });

  it('opens the next column when a folder is picked', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    await user.click(screen.getByRole('radio', { name: 'Columns' }));

    await user.click(within(screen.getByRole('list', { name: 'root' })).getByRole('link', { name: 'src' }));

    expect(currentLocation()).toBe('/tree/src');
    expect(columnNames()).toEqual(['root', 'src']);
    expect(
      within(screen.getByRole('list', { name: 'src' }))
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['index.ts', 'components']);
  });

  it('remembers the column view after a refresh', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.click(screen.getByRole('radio', { name: 'Columns' }));
    cleanup();
    renderApp('/tree');

    expect(columns()).toBeInTheDocument();
  });
});
