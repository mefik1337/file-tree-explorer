const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;

const trimDecimals = (value: number): string => String(Number(value.toFixed(2)));

export const formatFileSize = (bytes: number): string => {
  if (bytes < KILOBYTE) return `${bytes} B`;
  if (bytes < MEGABYTE) return `${trimDecimals(bytes / KILOBYTE)} KB`;
  return `${trimDecimals(bytes / MEGABYTE)} MB`;
};
