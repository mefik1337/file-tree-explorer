import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';

type NodeNotFoundProps = {
  readonly fullPath: string;
};

export const NodeNotFound = ({ fullPath }: NodeNotFoundProps) => (
  <article>
    <h1>Node not found</h1>
    <p>
      There is no node at <code>{fullPath}</code>.
    </p>
    <Link to={paths.tree}>Go to root</Link>
  </article>
);
