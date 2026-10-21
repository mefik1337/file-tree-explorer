import { Route, Routes } from 'react-router-dom';
import { FileTreeProvider, type TreeRepository } from '@/modules/file-tree';
import { TreePage } from '@/modules/tree-browser';
import { ImportPage } from '@/modules/tree-import';
import { paths } from '@/shared/routing/paths';

type AppShellProps = {
  readonly repository: TreeRepository;
};

export const AppShell = ({ repository }: AppShellProps) => (
  <FileTreeProvider repository={repository}>
    <Routes>
      <Route path={paths.home} element={<ImportPage />} />
      <Route path={paths.tree} element={<TreePage />} />
    </Routes>
  </FileTreeProvider>
);
