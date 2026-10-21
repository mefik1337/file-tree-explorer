import { describe, expect, it } from 'vitest';
import { sampleSnapshot } from '@/test/fixtures';
import { FileTree } from './FileTree';

const createSampleTree = (): FileTree => {
  const result = FileTree.fromSnapshot(sampleSnapshot);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
};

describe('FileTree', () => {
  describe('find', () => {
    it('finds a nested file by its node path', () => {
      const node = createSampleTree().find('src/components/Button.tsx');

      expect(node).toMatchObject({ kind: 'file', name: 'Button.tsx', size: 512 });
    });
  });

  describe('subtreeSize', () => {
    it('sums the sizes of every file below a folder', () => {
      expect(createSampleTree().subtreeSize('src')).toBe(1536);
    });

    it('sums the whole tree for the root', () => {
      expect(createSampleTree().subtreeSize('')).toBe(1836);
    });

    it('is zero for an empty folder', () => {
      const result = FileTree.fromSnapshot({ name: 'root', type: 'folder', children: [] });

      expect(result.ok && result.value.subtreeSize('')).toBe(0);
    });
  });

  describe('fullPath', () => {
    it('prefixes the node path with the root name', () => {
      expect(createSampleTree().fullPath('src/components/Button.tsx')).toBe('root/src/components/Button.tsx');
    });

    it('is the root name for the root itself', () => {
      expect(createSampleTree().fullPath('')).toBe('root');
    });
  });

  describe('search', () => {
    const searchPaths = (query: string): string[] => createSampleTree().search(query).map((node) => node.path);

    it('matches names case-insensitively anywhere in the tree', () => {
      expect(searchPaths('BUTTON')).toEqual(['src/components/Button.tsx']);
    });

    it('matches a substring of the name and lists hits in tree order', () => {
      expect(searchPaths('s')).toEqual([
        'src',
        'src/index.ts',
        'src/components',
        'src/components/Button.tsx',
        'package.json',
      ]);
    });

    it('matches only names, not the folders a node lives in', () => {
      expect(searchPaths('src')).toEqual(['src']);
    });

    it('ignores surrounding whitespace in the query', () => {
      expect(searchPaths('  index ')).toEqual(['src/index.ts']);
    });

    it('returns nothing for a blank query', () => {
      expect(searchPaths('   ')).toEqual([]);
    });

    it('returns nothing when no name matches', () => {
      expect(searchPaths('README')).toEqual([]);
    });
  });

  describe('fromSnapshot validation', () => {
    const folder = (children: unknown[]) => ({ name: 'root', type: 'folder', children });

    it.each<[string, unknown, string]>([
      ['null', null, '(root): node must be an object'],
      ['an array', [], '(root): node must be an object'],
      ['a file as root', { name: 'root', type: 'file', size: 1 }, 'root: the root must be a folder'],
      ['a missing name', { type: 'folder', children: [] }, '(root): "name" must be a non-empty string'],
      ['an empty name', { name: '', type: 'folder', children: [] }, '(root): "name" must be a non-empty string'],
      ['a name with a slash', folder([{ name: 'a/b', type: 'file', size: 1 }]), 'root/[0]: "name" must not contain "/"'],
      ['an unknown type', folder([{ name: 'x', type: 'link' }]), 'root/x: "type" must be "file" or "folder"'],
      ['a negative size', folder([{ name: 'a', type: 'file', size: -1 }]), 'root/a: "size" must be a non-negative number'],
      ['a textual size', folder([{ name: 'a', type: 'file', size: '12' }]), 'root/a: "size" must be a non-negative number'],
      ['a missing size', folder([{ name: 'a', type: 'file' }]), 'root/a: "size" must be a non-negative number'],
      ['an infinite size', folder([{ name: 'a', type: 'file', size: Infinity }]), 'root/a: "size" must be a non-negative number'],
      ['missing children', { name: 'root', type: 'folder' }, 'root: "children" must be an array'],
      ['a non-object child', folder(['src']), 'root/[0]: node must be an object'],
      [
        'duplicate sibling names',
        folder([
          { name: 'a', type: 'file', size: 1 },
          { name: 'a', type: 'folder', children: [] },
        ]),
        'root: duplicate name "a"',
      ],
      [
        'a deeply nested problem',
        folder([{ name: 'src', type: 'folder', children: [{ name: 'deep', type: 'folder', children: [{ name: 'x.ts', type: 'file', size: null }] }] }]),
        'root/src/deep/x.ts: "size" must be a non-negative number',
      ],
    ])('rejects %s', (_case, snapshot, expectedMessage) => {
      const result = FileTree.fromSnapshot(snapshot);

      expect(result.ok ? 'accepted' : result.error.message).toBe(expectedMessage);
    });

    it('accepts an empty root folder', () => {
      expect(FileTree.fromSnapshot(folder([])).ok).toBe(true);
    });
  });

  describe('arbitrarily deep trees', () => {
    const DEPTH = 20_000;

    const createDeepSnapshot = (): unknown => {
      let node: unknown = { name: 'leaf.txt', type: 'file', size: 7 };
      for (let level = DEPTH; level >= 1; level -= 1) {
        node = { name: `d${level}`, type: 'folder', children: [node] };
      }
      return { name: 'root', type: 'folder', children: [node] };
    };

    const createDeepTree = (): FileTree => {
      const result = FileTree.fromSnapshot(createDeepSnapshot());
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    };

    it('supports lookup, sizing and search without exhausting the call stack', () => {
      const tree = createDeepTree();
      const [leaf] = tree.search('leaf');

      expect(leaf?.path.split('/')).toHaveLength(DEPTH + 1);
      expect(tree.subtreeSize('')).toBe(7);
      expect(tree.find(leaf?.path ?? '')?.name).toBe('leaf.txt');
    });
  });
});
