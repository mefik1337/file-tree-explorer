import { useFileTree } from '@/modules/file-tree';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';
import { FileDetails } from './FileDetails';
import { FolderDetails } from './FolderDetails';
import { NodeNotFound } from './NodeNotFound';

export const NodeDetailsPage = () => {
  const { tree } = useFileTree();
  const nodePath = useCurrentNodePath();

  if (!tree) return null;

  const node = tree.find(nodePath);
  if (!node) return <NodeNotFound fullPath={tree.fullPath(nodePath)} />;

  return node.kind === 'file' ? <FileDetails tree={tree} file={node} /> : <FolderDetails tree={tree} folder={node} />;
};
