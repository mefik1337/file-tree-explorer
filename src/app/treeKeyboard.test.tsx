import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';

const tree = (): HTMLElement => screen.getByRole('tree');

const activeItem = (): string | null => {
  const id = tree().getAttribute('aria-activedescendant');
  return id ? (document.getElementById(id)?.getAttribute('aria-label') ?? null) : null;
};

const focusTree = () => act(() => tree().focus());

describe('keyboard navigation in the tree', () => {
  it('starts on the first item when nothing is selected', () => {
    renderApp('/tree', { storedTree: sampleJson });

    focusTree();

    expect(activeItem()).toBe('src');
  });

  it('starts on the selected node', () => {
    renderApp('/tree/src%2Fcomponents%2FButton.tsx', { storedTree: sampleJson });

    focusTree();

    expect(activeItem()).toBe('Button.tsx');
  });

  it('moves between visible items with the up and down arrows', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    focusTree();

    await user.keyboard('{ArrowDown}');
    expect(activeItem()).toBe('package.json');

    await user.keyboard('{ArrowUp}');
    expect(activeItem()).toBe('src');
  });

  it('expands a folder with the right arrow and then steps into it', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    focusTree();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'true');
    expect(activeItem()).toBe('src');

    await user.keyboard('{ArrowRight}');
    expect(activeItem()).toBe('index.ts');
  });

  it('goes back to the parent and collapses it with the left arrow', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    focusTree();

    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}');
    expect(activeItem()).toBe('src');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('jumps to the first and last visible item with Home and End', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    focusTree();

    await user.keyboard('{End}');
    expect(activeItem()).toBe('package.json');

    await user.keyboard('{Home}');
    expect(activeItem()).toBe('src');
  });

  it('opens the details of the active item with Enter', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    focusTree();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(currentLocation()).toBe('/tree/package.json');
  });

  it('jumps to the next item whose name starts with the typed text', async () => {
    const { user } = renderApp('/tree', { storedTree: sampleJson });
    focusTree();

    await user.keyboard('p');

    expect(activeItem()).toBe('package.json');
  });

  it('reaches the end of a very large folder and renders that row', async () => {
    const storedTree = JSON.stringify({
      name: 'root',
      type: 'folder',
      children: [
        {
          name: 'big',
          type: 'folder',
          children: Array.from({ length: 5000 }, (_, index) => ({ name: `file-${index}.txt`, type: 'file', size: 1 })),
        },
      ],
    });
    const { user } = renderApp('/tree', { storedTree });
    focusTree();

    await user.keyboard('{ArrowRight}{End}');

    expect(activeItem()).toBe('file-4999.txt');
    expect(screen.getByRole('treeitem', { name: 'file-4999.txt' })).toHaveAttribute('aria-posinset', '5000');
  });
});
