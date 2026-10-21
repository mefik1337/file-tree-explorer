import { cleanup, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';

const resultPaths = (): string[] =>
  within(screen.getByRole('list', { name: 'Search results' }))
    .getAllByRole('link')
    .map((link) => link.textContent ?? '');

describe('searching by name', () => {
  it('finds matching nodes anywhere in the tree and shows their full paths', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.type(screen.getByRole('searchbox', { name: 'Search by name' }), 'button');

    expect(resultPaths()).toEqual(['root/src/components/Button.tsx']);
  });

  it('keeps the query in the address so results survive a page refresh', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    await user.type(screen.getByRole('searchbox', { name: 'Search by name' }), 'ts');
    const location = currentLocation();

    cleanup();
    renderApp(location);

    expect(location).toBe('/tree?q=ts');
    expect(screen.getByRole('searchbox', { name: 'Search by name' })).toHaveValue('ts');
    expect(resultPaths()).toEqual(['root/src/index.ts', 'root/src/components', 'root/src/components/Button.tsx']);
  });

  it('opens the details of a result and keeps the results visible', async () => {
    const { user } = renderApp('/tree?q=button', { storedTree: sampleJson });

    await user.click(screen.getByRole('link', { name: 'root/src/components/Button.tsx' }));

    expect(currentLocation()).toBe('/tree/src%2Fcomponents%2FButton.tsx?q=button');
    expect(screen.getByRole('heading', { level: 1, name: 'Button.tsx' })).toBeInTheDocument();
    expect(resultPaths()).toEqual(['root/src/components/Button.tsx']);
  });

  it('keeps the search while browsing folder children', async () => {
    const { user } = renderApp('/tree/src?q=json', { storedTree: sampleJson });

    await user.click(within(screen.getByRole('list', { name: 'Children of src' })).getByRole('link', { name: 'index.ts' }));

    expect(currentLocation()).toBe('/tree/src%2Findex.ts?q=json');
  });

  it('tells the user when nothing matches', () => {
    renderApp('/tree?q=readme', { storedTree: sampleJson });

    expect(screen.getByText('No nodes match "readme".')).toBeInTheDocument();
  });

  it('returns to the tree once the search is cleared', async () => {
    const { user } = renderApp('/tree?q=button', { storedTree: sampleJson });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(currentLocation()).toBe('/tree');
    expect(screen.getByRole('searchbox', { name: 'Search by name' })).toHaveValue('');
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('clears the search with the Escape key', async () => {
    const { user } = renderApp('/tree?q=button', { storedTree: sampleJson });

    await user.type(screen.getByRole('searchbox', { name: 'Search by name' }), '{Escape}');

    expect(currentLocation()).toBe('/tree');
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('narrows results to files and keeps that filter in the address', async () => {
    const { user } = renderApp('/tree?q=s', { storedTree: sampleJson });

    await user.click(screen.getByRole('radio', { name: 'Files' }));

    expect(currentLocation()).toBe('/tree?q=s&type=file');
    expect(resultPaths()).toEqual(['root/src/index.ts', 'root/src/components/Button.tsx', 'root/package.json']);
  });

  it('restores the type filter after a refresh', () => {
    renderApp('/tree?q=s&type=folder', { storedTree: sampleJson });

    expect(screen.getByRole('radio', { name: 'Folders' })).toBeChecked();
    expect(resultPaths()).toEqual(['root/src', 'root/src/components']);
  });

  it('searches full paths when the query contains a slash', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.type(screen.getByRole('searchbox', { name: 'Search by name' }), 'components/');

    expect(resultPaths()).toEqual(['root/src/components/Button.tsx']);
  });

  it('moves between the search field and the results with the arrow keys', async () => {
    const { user } = renderApp('/tree?q=s', { storedTree: sampleJson });
    const searchbox = screen.getByRole('searchbox', { name: 'Search by name' });

    await user.click(searchbox);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'root/src' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'root/src/index.ts' })).toHaveFocus();

    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(searchbox).toHaveFocus();
  });

  it('opens a result picked with the keyboard', async () => {
    const { user } = renderApp('/tree?q=json', { storedTree: sampleJson });

    await user.click(screen.getByRole('searchbox', { name: 'Search by name' }));
    await user.keyboard('{ArrowDown}{Enter}');

    expect(currentLocation()).toBe('/tree/package.json?q=json');
  });

  it('drops the type filter together with the query when the search is cleared', async () => {
    const { user } = renderApp('/tree?q=s&type=file', { storedTree: sampleJson });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(currentLocation()).toBe('/tree');
  });
});
