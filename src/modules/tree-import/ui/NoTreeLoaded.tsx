import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';
import { EmptyState } from '@/shared/ui/EmptyState';

export const NoTreeLoaded = () => (
  <EmptyState title="No tree loaded">
    <p>Paste or upload a JSON directory structure to start exploring.</p>
    <Link to={paths.home}>Import a tree</Link>
  </EmptyState>
);
