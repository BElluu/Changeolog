import { expect, test } from 'bun:test';
import { generateHTML } from './generators';
import { renderEditor } from './editor';
import type { StagedData } from '../types';

const evil = '<img src=x onerror=alert(1)></script><script>alert(2)</script>';
const data = {
  version: '1.0', createdAt: new Date(), updatedAt: new Date(),
  fromRef: 'v1', toRef: 'HEAD', appName: evil,
  commits: [{ hash: 'a'.repeat(40), shortHash: 'aaaaaaa', message: evil, author: evil,
    email: 'e', date: new Date(), type: 'bug' }],
  groups: [], excluded: []
} as unknown as StagedData;

for (const template of ['full', 'simple'] as const) {
  test(`${template} HTML export has no raw injected markup`, () => {
    const html = generateHTML(data, template, 'en');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>alert');
  });
}

test('editor page has no raw injected markup', () => {
  const html = renderEditor(data);
  expect(html).not.toContain('<img src=x');
  expect(html).not.toContain('<script>alert');
});
