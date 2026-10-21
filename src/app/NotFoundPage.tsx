import { Link } from 'react-router-dom';
import { paths } from '@/shared/routing/paths';

export const NotFoundPage = () => (
  <main>
    <h1>Page not found</h1>
    <Link to={paths.home}>Go to import</Link>
  </main>
);
