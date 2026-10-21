import { cleanup, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';

describe('importing a tree', () => {
  it('lets the user paste JSON and explore it as a tree', async () => {
    const { user } = renderApp('/');

    await user.click(screen.getByLabelText('Tree JSON'));
    await user.paste(sampleJson);
    await user.click(screen.getByRole('button', { name: 'Explore tree' }));

    const tree = await screen.findByRole('tree');
    expect(currentLocation()).toBe('/tree');
    expect(within(tree).getByRole('treeitem', { name: 'src' })).toBeInTheDocument();
    expect(within(tree).getByRole('treeitem', { name: 'package.json' })).toBeInTheDocument();
  });

  it('explains why invalid input cannot be explored', async () => {
    const { user } = renderApp('/');

    await user.click(screen.getByLabelText('Tree JSON'));
    await user.paste('{ "name": "root", "type": "folder" }');
    await user.click(screen.getByRole('button', { name: 'Explore tree' }));

    expect(screen.getByRole('alert')).toHaveTextContent('root: "children" must be an array');
    expect(currentLocation()).toBe('/');
  });

  it('lets the user upload a JSON file and explore it', async () => {
    const { user } = renderApp('/');
    const file = new File([sampleJson], 'tree.json', { type: 'application/json' });

    await user.upload(screen.getByLabelText('Upload JSON file'), file);

    const tree = await screen.findByRole('tree');
    expect(within(tree).getByRole('treeitem', { name: 'src' })).toBeInTheDocument();
  });

  it('explains why an uploaded file cannot be explored', async () => {
    const { user } = renderApp('/');
    const file = new File(['not json'], 'broken.json', { type: 'application/json' });

    await user.upload(screen.getByLabelText('Upload JSON file'), file);

    expect(await screen.findByRole('alert')).toHaveTextContent('The input is not valid JSON');
  });

  it('keeps the imported tree after a page refresh', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByLabelText('Tree JSON'));
    await user.paste(sampleJson);
    await user.click(screen.getByRole('button', { name: 'Explore tree' }));

    cleanup();
    renderApp('/tree');

    expect(screen.getByRole('treeitem', { name: 'src' })).toBeInTheDocument();
  });

  it('points to the import page when no tree has been loaded', async () => {
    const { user } = renderApp('/tree');

    await user.click(screen.getByRole('link', { name: 'Import a tree' }));

    expect(currentLocation()).toBe('/');
  });
});
