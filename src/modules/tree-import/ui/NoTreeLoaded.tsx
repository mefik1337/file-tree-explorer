import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';
import buttons from '@/shared/ui/Button.module.css';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FolderIcon } from '@/shared/ui/icons';

export const NoTreeLoaded = () => (
  <EmptyState title="No tree loaded" icon={<FolderIcon size={36} />}>
    <p>Paste, drop or upload a JSON directory structure to start exploring.</p>
    <Link className={`${buttons.button} ${buttons.primary}`} to={paths.home}>
      Import a tree
    </Link>
  </EmptyState>
);
