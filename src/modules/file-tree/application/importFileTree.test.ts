import { describe, expect, it } from 'vitest';
import { sampleJson } from '@/test/fixtures';
import { importFileTree } from './importFileTree';

describe('importFileTree', () => {
  it('turns valid JSON text into a file tree', () => {
    const result = importFileTree(sampleJson);

    expect(result.ok && result.value.find('src/index.ts')?.name).toBe('index.ts');
  });

  it('reports malformed JSON', () => {
    const result = importFileTree('{ "name": ');

    expect(result.ok ? null : result.error.kind).toBe('invalid-json');
  });

  it('reports blank input as malformed JSON', () => {
    const result = importFileTree('   ');

    expect(result.ok ? null : result.error.message).toBe('Paste or upload a JSON document first.');
  });

  it('reports well-formed JSON that is not a valid tree', () => {
    const result = importFileTree('{ "name": "root", "type": "file", "size": 1 }');

    expect(result.ok ? null : result.error).toEqual({
      kind: 'invalid-tree',
      message: 'root: the root must be a folder',
    });
  });
});
