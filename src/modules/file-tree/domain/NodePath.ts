export const ROOT_PATH = '';

export const PATH_SEPARATOR = '/';

export const childPath = (parentPath: string, childName: string): string =>
  parentPath === ROOT_PATH ? childName : `${parentPath}${PATH_SEPARATOR}${childName}`;

export const ancestorPaths = (path: string): string[] => {
  const segments = path.split(PATH_SEPARATOR);
  return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join(PATH_SEPARATOR));
};
