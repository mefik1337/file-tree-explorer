import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';
import buttons from '@/shared/ui/Button.module.css';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SearchIcon } from '@/shared/ui/icons';

export const NotFoundPage = () => (
  <EmptyState title="Page not found" icon={<SearchIcon size={28} />}>
    <p>This address does not lead anywhere in FileTree Explorer.</p>
    <Link className={`${buttons.button} ${buttons.primary}`} to={paths.home}>
      Go to import
    </Link>
  </EmptyState>
);
