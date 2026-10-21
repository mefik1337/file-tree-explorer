export const ROOT_PATH = '';

export const PATH_SEPARATOR = '/';

export const childPath = (parentPath: string, childName: string): string =>
  parentPath === ROOT_PATH ? childName : `${parentPath}${PATH_SEPARATOR}${childName}`;
