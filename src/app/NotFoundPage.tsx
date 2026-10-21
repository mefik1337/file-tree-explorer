import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';
import { EmptyState } from '@/shared/ui/EmptyState';

export const NotFoundPage = () => (
  <EmptyState title="Page not found">
    <p>This address does not lead anywhere in FileTree Explorer.</p>
    <Link to={paths.home}>Go to import</Link>
  </EmptyState>
);
