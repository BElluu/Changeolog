import { expect, test } from 'bun:test';
import { CommitClassifier } from '.';
import { CommitType } from '../types';

const c = new CommitClassifier();

test('parses Conventional Commits with scope and strips the prefix', () => {
  expect(c.classify('feat(auth): add login')).toEqual({
    type: CommitType.FEATURE,
    message: 'add login',
    scope: 'auth',
    breaking: false
  });
  expect(c.classify('fix: null pointer').type).toBe(CommitType.BUG);
  expect(c.classify('perf(db): cache queries').type).toBe(CommitType.PERF);
  expect(c.classify('docs: update readme').type).toBe(CommitType.DOCS);
  expect(c.classify('chore: bump deps').type).toBe(CommitType.OTHER);
});

test('detects breaking changes via ! and footer', () => {
  expect(c.classify('feat!: drop node 16').breaking).toBe(true);
  expect(c.classify('feat(api)!: new schema')).toMatchObject({ breaking: true, scope: 'api' });
  expect(c.classify('fix: thing', 'details\n\nBREAKING CHANGE: removed flag').breaking).toBe(true);
  expect(c.classify('fix: thing', 'no footer here').breaking).toBe(false);
});

test('unknown prefix falls back to keywords on the full message', () => {
  expect(c.classify('Note: fix crash on start')).toMatchObject({
    type: CommitType.BUG,
    message: 'Note: fix crash on start'
  });
});

test('keyword priority: a bug fix mentioning "new" is a bug, not a feature', () => {
  expect(c.classify('Fix new issue with login').type).toBe(CommitType.BUG);
  expect(c.classify('Fix XSS vulnerability').type).toBe(CommitType.SECURITY);
});

test('Polish keywords', () => {
  expect(c.classify('Naprawiono błąd w logowaniu').type).toBe(CommitType.BUG);
  expect(c.classify('Dodano nowy raport').type).toBe(CommitType.FEATURE);
  expect(c.classify('Refaktoryzacja modułu płatności').type).toBe(CommitType.REFACTOR);
  expect(c.classify('Poprawa bezpieczeństwa sesji').type).toBe(CommitType.SECURITY);
});

test('unmatched commits are "other", not "feature"', () => {
  expect(c.classify('Merge branch main').type).toBe(CommitType.OTHER);
});

test('user patterns take precedence and are validated', () => {
  const custom = new CommitClassifier({ docs: ['^wiki'] });
  expect(custom.classify('wiki: new page').type).toBe(CommitType.DOCS);
  expect(() => new CommitClassifier({ bogus: ['x'] })).toThrow(/Unknown commit type/);
  expect(() => new CommitClassifier({ bug: ['('] })).toThrow(/Invalid pattern/);
});
