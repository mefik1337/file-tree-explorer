import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';
import buttons from '@/shared/ui/Button.module.css';
import { SearchIcon } from '@/shared/ui/icons';
import styles from './NodeDetails.module.css';

type NodeNotFoundProps = {
  readonly fullPath: string;
};

export const NodeNotFound = ({ fullPath }: NodeNotFoundProps) => (
  <article className={styles.notFound}>
    <div className={styles.notFoundIcon}>
      <SearchIcon size={28} />
    </div>
    <h1 className={styles.title}>Node not found</h1>
    <p>
      There is no node at <code>{fullPath}</code>.
    </p>
    <Link className={`${buttons.button} ${buttons.secondary}`} to={paths.tree}>
      Go to root
    </Link>
  </article>
);
