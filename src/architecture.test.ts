import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(process.cwd(), 'src');

type SourceFile = { readonly path: string; readonly imports: readonly string[] };

const listSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [fullPath] : [];
  });

const IMPORT_PATTERN = /(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g;

const sourceFiles: SourceFile[] = listSourceFiles(SRC)
  .filter((path) => !relative(SRC, path).startsWith(`test${sep}`))
  .map((path) => ({
    path: relative(SRC, path).split(sep).join('/'),
    imports: [...readFileSync(path, 'utf8').matchAll(IMPORT_PATTERN)].map((match) => match[1] ?? ''),
  }));

const violations = (isViolation: (file: SourceFile, specifier: string) => boolean): string[] =>
  sourceFiles.flatMap((file) =>
    file.imports.filter((specifier) => isViolation(file, specifier)).map((specifier) => `${file.path} -> ${specifier}`),
  );

const moduleOf = (path: string): string | undefined => /^modules\/([^/]+)\//.exec(path)?.[1];

describe('architecture', () => {
  it('lets modules talk to each other only through their public index', () => {
    expect(
      violations((file, specifier) => {
        const target = /^@\/modules\/([^/]+)\/.+/.exec(specifier);
        return target !== null && target[1] !== moduleOf(file.path);
      }),
    ).toEqual([]);
  });

  it('keeps shared code independent of modules and the app', () => {
    expect(
      violations((file, specifier) => file.path.startsWith('shared/') && /^@\/(modules|app)\b/.test(specifier)),
    ).toEqual([]);
  });

  it('keeps modules independent of the app composition root', () => {
    expect(violations((file, specifier) => file.path.startsWith('modules/') && /^@\/app\b/.test(specifier))).toEqual([]);
  });

  it('keeps the domain free of frameworks and outer layers', () => {
    expect(
      violations(
        (file, specifier) =>
          /\/domain\//.test(file.path) && /^(react|react-dom|react-router-dom)$|\/(application|infrastructure|ui)\//.test(specifier),
      ),
    ).toEqual([]);
  });

  it('keeps application services free of UI and infrastructure', () => {
    expect(
      violations(
        (file, specifier) =>
          /\/application\//.test(file.path) && /^(react|react-dom|react-router-dom)$|\/(infrastructure|ui)\//.test(specifier),
      ),
    ).toEqual([]);
  });

  it('inspects a meaningful set of source files', () => {
    expect(sourceFiles.length).toBeGreaterThan(20);
  });
});
