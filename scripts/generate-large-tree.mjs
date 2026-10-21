import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const createRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const random = createRandom(20261021);
const pick = (items) => items[Math.floor(random() * items.length)];
const between = (min, max) => Math.floor(min + random() * (max - min + 1));
const fileSize = (base) => Math.max(1, Math.round(base * Math.exp((random() - 0.5) * 3)));

const file = (name, base = 2400) => ({ name, type: 'file', size: fileSize(base) });
const folder = (name, children) => ({ name, type: 'folder', children });

const WORDS = [
  'account', 'activity', 'button', 'input', 'select', 'tooltip', 'tabs', 'stepper', 'analytics', 'audit', 'avatar', 'badge', 'billing', 'calendar', 'card', 'cart', 'chart',
  'checkout', 'comment', 'dashboard', 'dialog', 'editor', 'feed', 'filter', 'form', 'gallery', 'header', 'inbox',
  'invoice', 'layout', 'login', 'media', 'menu', 'message', 'modal', 'navigation', 'notification', 'order', 'payment',
  'profile', 'project', 'report', 'search', 'settings', 'sidebar', 'signup', 'table', 'team', 'timeline', 'toast',
  'upload', 'user', 'wallet', 'workspace',
];

const pascal = (word) => word[0].toUpperCase() + word.slice(1);
const uniqueWords = (count) => [...new Set(Array.from({ length: count * 2 }, () => pick(WORDS)))].slice(0, count);

const component = (word) =>
  folder(pascal(word), [
    file(`${pascal(word)}.tsx`, 4200),
    file(`${pascal(word)}.test.tsx`, 3100),
    file(`${pascal(word)}.module.css`, 1300),
    file('index.ts', 90),
  ]);

const feature = (word) =>
  folder(word, [
    folder('components', uniqueWords(between(4, 12)).map(component)),
    folder('hooks', uniqueWords(between(1, 4)).map((hook) => file(`use${pascal(hook)}.ts`, 1600))),
    folder('api', [file(`${word}Client.ts`, 2800), file(`${word}Client.test.ts`, 2200), file('types.ts', 900)]),
    file('index.ts', 140),
  ]);

const frontendApp = (name) =>
  folder(name, [
    folder('src', [
      folder('features', uniqueWords(between(16, 26)).map(feature)),
      folder('shared', [folder('ui', uniqueWords(between(8, 14)).map(component)), file('theme.ts', 3600)]),
      file('main.tsx', 600),
      file('App.tsx', 1900),
    ]),
    folder('public', [file('favicon.ico', 15000), file('robots.txt', 70), folder('images', Array.from({ length: between(10, 30) }, (_, index) => file(`hero-${index + 1}.webp`, 180000)))]),
    file('package.json', 1400),
    file('tsconfig.json', 700),
    file('vite.config.ts', 500),
    file('README.md', 2600),
  ]);

const service = (name) =>
  folder(name, [
    folder('src', [
      folder('handlers', uniqueWords(between(6, 14)).map((handler) => file(`${handler}.handler.ts`, 3400))),
      folder('repositories', uniqueWords(between(3, 8)).map((repo) => file(`${repo}.repository.ts`, 2900))),
      folder('migrations', Array.from({ length: between(15, 60) }, (_, index) => file(`${String(index + 1).padStart(4, '0')}_${pick(WORDS)}.sql`, 1200))),
      file('server.ts', 2100),
    ]),
    folder('test', uniqueWords(between(4, 10)).map((testName) => file(`${testName}.spec.ts`, 3800))),
    file('Dockerfile', 800),
    file('package.json', 1100),
  ]);

const nodeModules = () =>
  folder(
    'node_modules',
    Array.from({ length: 1400 }, (_, index) =>
      folder(`${pick(WORDS)}-${pick(['utils', 'core', 'kit', 'js', 'parser', 'plugin'])}-${index}`, [
        file('package.json', 1800),
        file('README.md', 6000),
        file('LICENSE', 1080),
        folder('dist', Array.from({ length: between(2, 12) }, (_, distIndex) => file(`chunk-${distIndex}.js`, 24000))),
      ]),
    ),
  );

const deepChain = (depth) => {
  let node = file('bottom.txt', 42);
  for (let level = depth; level >= 1; level -= 1) node = folder(`level-${level}`, [node]);
  return folder('deeply-nested', [node]);
};

const tree = folder('acme-monorepo', [
  folder('apps', ['web', 'admin', 'marketing', 'mobile-web', 'docs-site', 'partner-portal', 'support', 'checkout', 'onboarding', 'storybook'].map(frontendApp)),
  folder('services', ['auth', 'billing', 'notifications', 'search', 'reports', 'media', 'gateway', 'scheduler', 'ledger', 'exports', 'webhooks', 'identity'].map(service)),
  folder('packages', ['ui', 'config', 'eslint-config', 'tsconfig', 'icons', 'analytics'].map((name) => folder(name, [folder('src', uniqueWords(between(6, 16)).map(component)), file('package.json', 900)]))),
  folder('docs', [folder('adr', Array.from({ length: 40 }, (_, index) => file(`${String(index + 1).padStart(4, '0')}-${pick(WORDS)}-decision.md`, 4200))), file('onboarding.md', 9000), file('architecture.md', 15000)]),
  nodeModules(),
  deepChain(120),
  folder('empty-folder', []),
  file('package.json', 2200),
  file('package-lock.json', 1850000),
  file('README.md', 7400),
  file('.gitignore', 240),
]);

const countNodes = (root) => {
  let files = 0;
  let folders = 0;
  const pending = [root];
  while (pending.length > 0) {
    const node = pending.pop();
    if (node.type === 'file') files += 1;
    else {
      folders += 1;
      pending.push(...node.children);
    }
  }
  return { files, folders };
};

const output = resolve(process.argv[2] ?? 'examples/large-tree.json');
mkdirSync(dirname(output), { recursive: true });
const json = JSON.stringify(tree);
writeFileSync(output, json);
const { files, folders } = countNodes(tree);
console.log(`${output}: ${files} files, ${folders} folders, ${(json.length / 1024 / 1024).toFixed(2)} MB`);
