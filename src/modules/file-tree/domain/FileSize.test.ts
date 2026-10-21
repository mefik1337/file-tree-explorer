import { describe, expect, it } from 'vitest';
import { formatFileSize } from './FileSize';

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [300, '300 B'],
    [1023, '1023 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1100, '1.07 KB'],
    [1048575, '1024 KB'],
    [1048576, '1 MB'],
    [1572864, '1.5 MB'],
    [5368709120, '5120 MB'],
  ])('formats %i bytes as "%s"', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
