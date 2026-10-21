import { useParams } from 'react-router-dom';
import { NODE_PATH_PARAM } from './paths';

export const useCurrentNodePath = (): string => useParams()[NODE_PATH_PARAM] ?? '';
