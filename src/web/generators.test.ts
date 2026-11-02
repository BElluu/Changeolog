import { expect, test } from 'bun:test';
import { generateHTML, generateJSON, generateMarkdown } from './generators';
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

const mixed = {
  ...data,
  appName: 'App',
  commits: [
    { hash: '1'.repeat(40), shortHash: '1111111', message: 'add login', scope: 'auth', breaking: true,
      author: 'a', email: 'e', date: new Date(), type: 'feature' },
    { hash: '2'.repeat(40), shortHash: '2222222', message: 'speed up query',
      author: 'a', email: 'e', date: new Date(), type: 'perf' },
    { hash: '3'.repeat(40), shortHash: '3333333', message: 'bump deps',
      author: 'a', email: 'e', date: new Date(), type: 'other' }
  ]
} as unknown as StagedData;

test('markdown has a section per used type and shows scope/breaking', () => {
  const md = generateMarkdown(mixed);
  expect(md).toContain('New Features');
  expect(md).toContain('Performance');
  expect(md).toContain('Other Changes');
  expect(md).not.toContain('Bug Fixes');
  expect(md).toContain('BREAKING: auth: add login');
});

test('generated page scripts are syntactically valid', () => {
  const pages = [generateHTML(mixed, 'full', 'pl'), renderEditor(mixed)];
  for (const html of pages) {
    for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      expect(() => new Function(m[1])).not.toThrow();
    }
  }
});

test('JSON export keeps raw message, scope and breaking flag', () => {
  const json = JSON.parse(generateJSON(mixed));
  expect(json.commits[0]).toMatchObject({ message: 'add login', scope: 'auth', breaking: true });
});

test('editor: selecting commits for grouping works (regression: selectedCommits scope)', () => {
  const body = /<script>([\s\S]*?)<\/script>/.exec(renderEditor(mixed))?.[1];
  expect(body).toBeDefined();

  const classes = new Set<string>();
  const el = {
    innerHTML: '',
    textContent: '',
    value: '',
    classList: { toggle: (c: string, on: boolean) => (on ? classes.add(c) : classes.delete(c)), add() {}, remove() {} }
  };
  const win: Record<string, any> = {};
  const doc = { getElementById: () => el, querySelector: () => el };
  new Function('window', 'document', 'fetch', body as string)(win, doc, async () => ({}));

  expect(() => win.toggleCommitSelection('a', true)).not.toThrow();
  expect(classes.has('hidden')).toBe(true); // one selected: action stays hidden
  win.toggleCommitSelection('b', true);
  expect(classes.has('hidden')).toBe(false); // two selected: action shows
  expect(el.textContent).toContain('(2)');
});
