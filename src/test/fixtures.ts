export const sampleSnapshot = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'index.ts', type: 'file', size: 1024 },
        {
          name: 'components',
          type: 'folder',
          children: [{ name: 'Button.tsx', type: 'file', size: 512 }],
        },
      ],
    },
    { name: 'package.json', type: 'file', size: 300 },
  ],
} as const;

export const sampleJson = JSON.stringify(sampleSnapshot);

export const mixedJson = JSON.stringify({
  name: 'root',
  type: 'folder',
  children: [
    { name: 'b.txt', type: 'file', size: 10 },
    { name: 'file10.txt', type: 'file', size: 5 },
    { name: 'A', type: 'folder', children: [{ name: 'big.bin', type: 'file', size: 100 }] },
    { name: 'file2.txt', type: 'file', size: 50 },
    { name: 'c', type: 'folder', children: [] },
  ],
});
