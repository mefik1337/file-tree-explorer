import { Route, Routes } from 'react-router-dom';
import { FileTreeProvider, type TreeRepository } from '@/modules/file-tree';
import { PreferencesProvider, type PreferencesRepository } from '@/modules/preferences';
import { NodeDetailsPage } from '@/modules/node-details';
import { ImportPage } from '@/modules/tree-import';
import { paths } from '@/shared/routing/paths';
import { PlainNodePathRedirect } from '@/shared/routing/PlainNodePathRedirect';
import { ExplorerLayout } from './ExplorerLayout';
import { NotFoundPage } from './NotFoundPage';

type AppShellProps = {
  readonly repository: TreeRepository;
  readonly preferences: PreferencesRepository;
};

export const AppShell = ({ repository, preferences }: AppShellProps) => (
  <PreferencesProvider repository={preferences}>
  <FileTreeProvider repository={repository}>
    <Routes>
      <Route path={paths.home} element={<ImportPage />} />
      <Route path={paths.tree} element={<ExplorerLayout />}>
        <Route index element={<NodeDetailsPage />} />
        <Route path={paths.nodeDetails} element={<NodeDetailsPage />} />
        <Route path="*" element={<PlainNodePathRedirect />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </FileTreeProvider>
  </PreferencesProvider>
);
