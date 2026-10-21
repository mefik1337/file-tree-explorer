import { err, ok, type Result } from '@/shared/lib/result';
import { childPath, PATH_SEPARATOR, ROOT_PATH } from './NodePath';
import type { FolderNode, TreeNode } from './TreeNode';

export type TreeValidationError = {
  readonly message: string;
};

export type BuiltTree = {
  readonly root: FolderNode;
  readonly nodesParentsFirst: readonly TreeNode[];
};

type RawNode = Record<string, unknown>;

type MutableFolder = { kind: 'folder'; name: string; path: string; children: TreeNode[] };

type ValidNode =
  | { kind: 'file'; name: string; size: number }
  | { kind: 'folder'; name: string; rawChildren: readonly unknown[] };

const UNNAMED_ROOT_LOCATION = '(root)';

const isRawNode = (value: unknown): value is RawNode =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidSize = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const invalid = (location: string, reason: string): Result<never, TreeValidationError> =>
  err({ message: `${location}: ${reason}` });

const validateNode = (
  raw: unknown,
  unnamedLocation: string,
  locationOf: (name: string) => string,
): Result<ValidNode, TreeValidationError> => {
  if (!isRawNode(raw)) return invalid(unnamedLocation, 'node must be an object');

  const { name, type } = raw;
  if (typeof name !== 'string' || name === '') {
    return invalid(unnamedLocation, '"name" must be a non-empty string');
  }
  if (name.includes(PATH_SEPARATOR)) return invalid(unnamedLocation, `"name" must not contain "${PATH_SEPARATOR}"`);

  const location = locationOf(name);
  if (type === 'file') {
    return isValidSize(raw.size)
      ? ok({ kind: 'file', name, size: raw.size })
      : invalid(location, '"size" must be a non-negative number');
  }
  if (type === 'folder') {
    return Array.isArray(raw.children)
      ? ok({ kind: 'folder', name, rawChildren: raw.children })
      : invalid(location, '"children" must be an array');
  }
  return invalid(location, '"type" must be "file" or "folder"');
};

export const buildTree = (snapshot: unknown): Result<BuiltTree, TreeValidationError> => {
  const validRoot = validateNode(snapshot, UNNAMED_ROOT_LOCATION, (name) => name);
  if (!validRoot.ok) return validRoot;
  if (validRoot.value.kind !== 'folder') return invalid(validRoot.value.name, 'the root must be a folder');

  const root: MutableFolder = { kind: 'folder', name: validRoot.value.name, path: ROOT_PATH, children: [] };
  const nodesParentsFirst: TreeNode[] = [root];
  const pending: Array<{ rawChildren: readonly unknown[]; target: MutableFolder; location: string }> = [
    { rawChildren: validRoot.value.rawChildren, target: root, location: root.name },
  ];

  for (let next = pending.pop(); next; next = pending.pop()) {
    const { rawChildren, target, location } = next;
    const siblingNames = new Set<string>();

    for (const [position, rawChild] of rawChildren.entries()) {
      const validChild = validateNode(
        rawChild,
        `${location}${PATH_SEPARATOR}[${position}]`,
        (name) => `${location}${PATH_SEPARATOR}${name}`,
      );
      if (!validChild.ok) return validChild;

      const child = validChild.value;
      if (siblingNames.has(child.name)) return invalid(location, `duplicate name "${child.name}"`);
      siblingNames.add(child.name);

      const path = childPath(target.path, child.name);
      if (child.kind === 'file') {
        const file: TreeNode = { kind: 'file', name: child.name, path, size: child.size };
        target.children.push(file);
        nodesParentsFirst.push(file);
      } else {
        const folder: MutableFolder = { kind: 'folder', name: child.name, path, children: [] };
        target.children.push(folder);
        nodesParentsFirst.push(folder);
        pending.push({
          rawChildren: child.rawChildren,
          target: folder,
          location: `${location}${PATH_SEPARATOR}${child.name}`,
        });
      }
    }
  }

  return ok({ root, nodesParentsFirst });
};
