import { cleanup, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mixedJson, sampleJson } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';

const topLevelTreeItems = (): string[] =>
  within(screen.getByRole('tree'))
    .getAllByRole('treeitem')
    .filter((item) => item.getAttribute('aria-level') === '1')
    .map((item) => item.getAttribute('aria-label') ?? '');

describe('preferences', () => {
  it('follows the system theme by default', () => {
    renderApp('/tree', { storedTree: sampleJson });

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('switches to the dark theme and remembers it after a refresh', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    cleanup();
    delete document.documentElement.dataset.theme;
    renderApp('/tree');

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('offers the theme switch on the import page as well', async () => {
    const { user } = renderApp('/');

    await user.click(screen.getByRole('radio', { name: 'Light' }));

    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('keeps the imported order until another sort order is chosen', () => {
    renderApp('/tree', { storedTree: mixedJson });

    expect(topLevelTreeItems()).toEqual(['b.txt', 'file10.txt', 'A', 'file2.txt', 'c']);
  });

  it('sorts the tree and folder children by name', async () => {
    const { user } = renderApp('/tree', { storedTree: mixedJson });

    await user.click(screen.getByRole('radio', { name: 'Name' }));

    expect(topLevelTreeItems()).toEqual(['A', 'c', 'b.txt', 'file2.txt', 'file10.txt']);
    expect(
      within(screen.getByRole('list', { name: 'Children of root' }))
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['A', 'c', 'b.txt', 'file2.txt', 'file10.txt']);
  });

  it('remembers the sort order after a refresh', async () => {
    const { user } = renderApp('/tree', { storedTree: mixedJson });

    await user.click(screen.getByRole('radio', { name: 'Size' }));
    cleanup();
    renderApp('/tree');

    expect(topLevelTreeItems()).toEqual(['A', 'c', 'file2.txt', 'b.txt', 'file10.txt']);
  });
});
