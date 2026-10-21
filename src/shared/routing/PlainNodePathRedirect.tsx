import { Navigate, useLocation, useParams } from 'react-router-dom';
import { nodeDetailsHref } from './paths';

export const PlainNodePathRedirect = () => {
  const plainNodePath = useParams()['*'] ?? '';
  const { search } = useLocation();
  return <Navigate replace to={`${nodeDetailsHref(plainNodePath)}${search}`} />;
};
