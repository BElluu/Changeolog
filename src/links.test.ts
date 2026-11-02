import { expect, test } from 'bun:test';
import { commitUrl, hashHtml, issueUrl, linkifyHtml, linkifyMarkdown, normalizeRepoUrl } from './links';

test('normalizes common remote formats and drops credentials', () => {
  const want = 'https://github.com/o/r';
  expect(normalizeRepoUrl('git@github.com:o/r.git')).toBe(want);
  expect(normalizeRepoUrl('https://github.com/o/r.git')).toBe(want);
  expect(normalizeRepoUrl('https://user:secret@github.com/o/r/')).toBe(want);
  expect(normalizeRepoUrl('ssh://git@github.com:22/o/r.git')).toBe(want);
  expect(normalizeRepoUrl('')).toBeUndefined();
  expect(normalizeRepoUrl('not a url')).toBeUndefined();
  expect(normalizeRepoUrl('file:///tmp/repo')).toBeUndefined();
});

test('builds provider specific urls', () => {
  expect(commitUrl('https://github.com/o/r', 'abc')).toBe('https://github.com/o/r/commit/abc');
  expect(commitUrl('https://gitlab.com/o/r', 'abc')).toBe('https://gitlab.com/o/r/-/commit/abc');
  expect(commitUrl('https://bitbucket.org/o/r', 'abc')).toBe('https://bitbucket.org/o/r/commits/abc');
  expect(issueUrl('https://gitlab.com/o/r', '5')).toBe('https://gitlab.com/o/r/-/issues/5');
});

test('links issue references without touching HTML entities', () => {
  const repo = 'https://github.com/o/r';
  expect(linkifyMarkdown('fix #12 and #3', repo)).toBe(
    'fix [#12](https://github.com/o/r/issues/12) and [#3](https://github.com/o/r/issues/3)'
  );
  expect(linkifyMarkdown('fix #12')).toBe('fix #12');
  const html = linkifyHtml(`it's #7 <b>`, repo);
  expect(html).toContain('it&#39;s');
  expect(html).toContain('href="https://github.com/o/r/issues/7"');
  expect(html).toContain('&lt;b&gt;');
  expect(html).not.toContain('issues/39');
});

test('hash link falls back to plain text without a repo url', () => {
  expect(hashHtml('abc1234', 'abc1234ffff')).toBe('abc1234');
  expect(hashHtml('abc1234', 'abc1234ffff', 'https://github.com/o/r')).toContain('/commit/abc1234ffff');
});
