import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';

export const NoTreeLoaded = () => (
  <section>
    <h1>No tree loaded</h1>
    <Link to={paths.home}>Import a tree</Link>
  </section>
);
