import { expect, test } from 'bun:test';
import { mergeChangelog, renderExport } from '.';
import type { StagedData } from '../types';

const section = (v: string, body: string) => `## [${v}] - 2026-01-01\n\n### Features\n\n- ${body}\n`;

test('creates a new changelog with a header', () => {
  expect(mergeChangelog(undefined, section('1.0.0', 'a'), '1.0.0', 'App')).toBe(
    `# App Changelog\n\n${section('1.0.0', 'a')}`
  );
});

test('inserts the newest release above older ones and keeps the intro', () => {
  const existing = `# Changelog\n\nIntro text.\n\n${section('1.0.0', 'old')}`;
  const out = mergeChangelog(existing, section('1.1.0', 'new'), '1.1.0', 'App');
  expect(out.indexOf('## [1.1.0]')).toBeLessThan(out.indexOf('## [1.0.0]'));
  expect(out).toContain('Intro text.');
  expect(out.endsWith('\n')).toBe(true);
});

test('re-running replaces the same release instead of duplicating it', () => {
  const first = mergeChangelog(`# C\n\n${section('1.0.0', 'old')}`, section('1.1.0', 'v1'), '1.1.0', 'App');
  const second = mergeChangelog(first, section('1.1.0', 'v2'), '1.1.0', 'App');
  expect(second.match(/## \[1\.1\.0\]/g)?.length).toBe(1);
  expect(second).toContain('v2');
  expect(second).not.toContain('v1');
  expect(second).toContain('## [1.0.0]');
});

const data = {
  version: '1.0', createdAt: new Date(), updatedAt: new Date(),
  fromRef: 'v1', toRef: 'v2', release: 'v2', releaseDate: '2026-02-03',
  repoUrl: 'https://github.com/o/r',
  commits: [{ hash: 'a'.repeat(40), shortHash: 'aaaaaaa', message: 'fix login #42', author: 'a',
    email: 'e', date: new Date(), type: 'bug' }],
  groups: [], excluded: []
} as unknown as StagedData;

test('markdown uses the release tag/date and links commits and issues', () => {
  const { content, filename } = renderExport(data, { format: 'markdown' });
  expect(filename).toBe('CHANGELOG.md');
  expect(content).toContain('## [v2] - 2026-02-03');
  expect(content).toContain('[#42](https://github.com/o/r/issues/42)');
  expect(content).toContain(`https://github.com/o/r/commit/${'a'.repeat(40)}`);
});

test('html links commits and issues', () => {
  const { content } = renderExport(data, { format: 'html', template: 'full' });
  expect(content).toContain('https://github.com/o/r/issues/42');
  expect(content).toContain(`/commit/${'a'.repeat(40)}`);
});

test('json export carries the release', () => {
  const json = JSON.parse(renderExport(data, { format: 'json' }).content);
  expect(json).toMatchObject({ version: 'v2', date: '2026-02-03' });
});

test('rejects unknown formats', () => {
  expect(() => renderExport(data, { format: 'pdf' as never })).toThrow(/Invalid format/);
});
