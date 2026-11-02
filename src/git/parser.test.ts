import { expect, test } from 'bun:test';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { GitParser } from './parser';

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'changeolog-'));
  const git = (...a: string[]) =>
    Bun.spawnSync(['git', '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: dir });
  git('init', '-q');
  git('commit', '--allow-empty', '-q', '-m', 'base');
  git('tag', 'v0');
  git('commit', '--allow-empty', '-q', '-m', 'JIRA-1 fix login');
  git('commit', '--allow-empty', '-q', '-m', 'chore: misc');
  return dir;
}

test('--pattern is treated as a regex', async () => {
  const dir = makeRepo();
  const commits = await new GitParser(dir).parseRange({
    from: 'v0', to: 'HEAD', repo: dir, pattern: '^JIRA-\\d+'
  });
  expect(commits.map(c => c.message)).toEqual(['JIRA-1 fix login']);
});

test('invalid --pattern gives a clear error', async () => {
  const dir = makeRepo();
  await expect(new GitParser(dir).parseRange({
    from: 'v0', to: 'HEAD', repo: dir, pattern: '('
  })).rejects.toThrow(/Invalid --pattern/);
});

test('classifies Conventional Commits, strips prefix and flags breaking changes', async () => {
  const dir = makeRepo();
  const git = (...a: string[]) =>
    Bun.spawnSync(['git', '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: dir });
  git('commit', '--allow-empty', '-q', '-m', 'feat(api)!: new schema');
  git('commit', '--allow-empty', '-q', '-m', 'fix: crash', '-m', 'BREAKING CHANGE: flag removed');
  const commits = await new GitParser(dir).parseRange({ from: 'v0', to: 'HEAD', repo: dir });
  const byMsg = Object.fromEntries(commits.map(c => [c.message, c]));
  expect(byMsg['new schema']).toMatchObject({ type: 'feature', scope: 'api', breaking: true });
  expect(byMsg.crash).toMatchObject({ type: 'bug', breaking: true });
  expect(byMsg.misc).toMatchObject({ type: 'other' });
  expect(byMsg['JIRA-1 fix login']).toMatchObject({ type: 'bug' });
});
