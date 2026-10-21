import { Link } from 'react-router-dom';
import { formatFileSize, type FileTree, type FolderNode } from '@/modules/file-tree';
import { nodeDetailsHref } from '@/shared/routing/paths';

type FolderDetailsProps = {
  readonly tree: FileTree;
  readonly folder: FolderNode;
};

export const FolderDetails = ({ tree, folder }: FolderDetailsProps) => (
  <article>
    <h1>{folder.name}</h1>
    <dl>
      <dt>Direct children</dt>
      <dd>{folder.children.length}</dd>
      <dt>Total size</dt>
      <dd>{formatFileSize(tree.subtreeSize(folder.path))}</dd>
      <dt>Full path</dt>
      <dd>{tree.fullPath(folder.path)}</dd>
    </dl>
    <h2>Children</h2>
    {folder.children.length === 0 ? (
      <p>This folder is empty.</p>
    ) : (
      <ul aria-label={`Children of ${folder.name}`}>
        {folder.children.map((child) => (
          <li key={child.path}>
            <Link to={nodeDetailsHref(child.path)}>{child.name}</Link>
          </li>
        ))}
      </ul>
    )}
  </article>
);
