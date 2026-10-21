import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';

const detail = (label: string): string | null | undefined =>
  screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;

describe('node details', () => {
  it('shows name, formatted size and full path of a file', () => {
    renderApp('/tree/src%2Fcomponents%2FButton.tsx', { storedTree: sampleJson });

    expect(screen.getByRole('heading', { level: 1, name: 'Button.tsx' })).toBeInTheDocument();
    expect(detail('Size')).toBe('512 B');
    expect(detail('Full path')).toBe('root/src/components/Button.tsx');
  });

  it('shows name, direct children count and subtree size of a folder', () => {
    renderApp('/tree/src', { storedTree: sampleJson });

    expect(screen.getByRole('heading', { level: 1, name: 'src' })).toBeInTheDocument();
    expect(detail('Direct children')).toBe('2');
    expect(detail('Total size')).toBe('1.5 KB');
  });

  it('lists the children of a folder as links to their details', async () => {
    const { user } = renderApp('/tree/src', { storedTree: sampleJson });
    const children = screen.getByRole('list', { name: 'Children of src' });

    expect(within(children).getAllByRole('link').map((link) => link.textContent)).toEqual(['index.ts', 'components']);

    await user.click(within(children).getByRole('link', { name: 'components' }));

    expect(currentLocation()).toBe('/tree/src%2Fcomponents');
    expect(screen.getByRole('heading', { level: 1, name: 'components' })).toBeInTheDocument();
  });

  it('shows the root folder details on the tree page', () => {
    renderApp('/tree', { storedTree: sampleJson });

    expect(screen.getByRole('heading', { level: 1, name: 'root' })).toBeInTheDocument();
    expect(detail('Direct children')).toBe('2');
    expect(detail('Total size')).toBe('1.79 KB');
  });

  it('reports a path that does not exist in the tree', async () => {
    const { user } = renderApp('/tree/src%2Fmissing.ts', { storedTree: sampleJson });

    expect(screen.getByRole('heading', { level: 1, name: 'Node not found' })).toBeInTheDocument();
    expect(screen.getByText('root/src/missing.ts')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Go to root' }));

    expect(currentLocation()).toBe('/tree');
  });

  it('says when a folder is empty', () => {
    renderApp('/tree/empty', { storedTree: JSON.stringify({ name: 'root', type: 'folder', children: [{ name: 'empty', type: 'folder', children: [] }] }) });

    expect(screen.getByText('This folder is empty.')).toBeInTheDocument();
  });

  it('accepts a node path typed with plain slashes and normalises the address', () => {
    renderApp('/tree/src/components/Button.tsx?q=btn', { storedTree: sampleJson });

    expect(currentLocation()).toBe('/tree/src%2Fcomponents%2FButton.tsx?q=btn');
    expect(screen.getByRole('heading', { level: 1, name: 'Button.tsx' })).toBeInTheDocument();
  });
});
