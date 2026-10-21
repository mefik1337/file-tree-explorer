import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { currentLocation, renderApp } from '@/test/renderApp';
import { createRefusingStorage } from '@/test/storage';

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

  it('can fill in an example tree to try the explorer', async () => {
    const { user } = renderApp('/');

    await user.click(screen.getByRole('button', { name: 'Use example' }));
    await user.click(screen.getByRole('button', { name: 'Explore tree' }));

    expect(await screen.findByRole('treeitem', { name: 'src' })).toBeInTheDocument();
  });

  it('lets the user return to the tree that is already loaded', async () => {
    const { user } = renderApp('/', { storedTree: sampleJson });

    await user.click(screen.getByRole('link', { name: 'Continue with "root"' }));

    expect(currentLocation()).toBe('/tree');
  });

  it('does not offer to continue when nothing is loaded', () => {
    renderApp('/');

    expect(screen.queryByRole('link', { name: /Continue with/ })).not.toBeInTheDocument();
  });

  it('warns when the tree cannot be kept for the next visit', async () => {
    const { user } = renderApp('/', { storage: createRefusingStorage() });

    await user.click(screen.getByLabelText('Tree JSON'));
    await user.paste(sampleJson);
    await user.click(screen.getByRole('button', { name: 'Explore tree' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'This tree is too large to be saved in the browser and will be lost after a refresh.',
    );
  });

  it('does not warn when the tree was saved', async () => {
    renderApp('/tree', { storedTree: sampleJson });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('explores a JSON file dropped onto the import form', async () => {
    renderApp('/');
    const file = new File([sampleJson], 'tree.json', { type: 'application/json' });

    fireEvent.drop(screen.getByRole('form', { name: 'Import tree' }), { dataTransfer: { files: [file], types: ['Files'] } });

    expect(await screen.findByRole('treeitem', { name: 'src' })).toBeInTheDocument();
    expect(currentLocation()).toBe('/tree');
  });
});
