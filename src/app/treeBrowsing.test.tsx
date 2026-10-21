import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';

describe('browsing the tree', () => {
  it('shows folders collapsed at first', () => {
    renderApp('/tree', { storedTree: sampleJson });

    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: 'components' })).not.toBeInTheDocument();
  });

  it('expands a folder to reveal its children', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.click(screen.getByRole('button', { name: 'Expand src' }));

    const src = screen.getByRole('treeitem', { name: 'src' });
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(within(src).getByRole('treeitem', { name: 'components' })).toBeInTheDocument();
    expect(within(src).getByRole('treeitem', { name: 'index.ts' })).toBeInTheDocument();
  });

  it('collapses an expanded folder', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.click(screen.getByRole('button', { name: 'Expand src' }));
    await user.click(screen.getByRole('button', { name: 'Collapse src' }));

    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: 'index.ts' })).not.toBeInTheDocument();
  });

  it('expands nested folders independently', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });

    await user.click(screen.getByRole('button', { name: 'Expand src' }));
    await user.click(screen.getByRole('button', { name: 'Expand components' }));

    expect(screen.getByRole('treeitem', { name: 'Button.tsx' })).toBeInTheDocument();
  });

  it('does not offer expanding for files', () => {
    renderApp('/tree', { storedTree: sampleJson });

    expect(screen.getByRole('treeitem', { name: 'package.json' })).not.toHaveAttribute('aria-expanded');
    expect(screen.queryByRole('button', { name: 'Expand package.json' })).not.toBeInTheDocument();
  });

  it('opens the details of a node picked in the tree', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    const tree = screen.getByRole('tree');

    await user.click(within(tree).getByRole('button', { name: 'Expand src' }));
    await user.click(within(tree).getByRole('link', { name: 'index.ts' }));

    expect(currentLocation()).toBe('/tree/src%2Findex.ts');
    expect(screen.getByRole('heading', { level: 1, name: 'index.ts' })).toBeInTheDocument();
  });

  it('reveals and marks the current node when its details are opened directly', () => {
    renderApp('/tree/src%2Fcomponents%2FButton.tsx', { storedTree: sampleJson });

    expect(screen.getByRole('treeitem', { name: 'Button.tsx' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-selected', 'false');
  });

  it('keeps folders expanded while moving between node details', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    const tree = screen.getByRole('tree');

    await user.click(within(tree).getByRole('button', { name: 'Expand src' }));
    await user.click(within(tree).getByRole('link', { name: 'package.json' }));

    expect(within(tree).getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'true');
  });
});
