import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CLI = resolve(import.meta.dir, 'cli.ts');

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'changeolog-cli-'));
  const git = (...a: string[]) =>
    Bun.spawnSync(['git', '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: dir });
  git('init', '-q');
  git('remote', 'add', 'origin', 'git@github.com:o/r.git');
  git('commit', '--allow-empty', '-q', '-m', 'base');
  git('tag', 'v0');
  git('commit', '--allow-empty', '-q', '-m', 'feat(ui): dark mode #7');
  git('commit', '--allow-empty', '-q', '-m', 'fix: crash on start');
  git('tag', 'v1');
  const cli = (...args: string[]) => {
    const r = Bun.spawnSync(['bun', CLI, ...args], { cwd: dir });
    return { code: r.exitCode, out: r.stdout.toString(), err: r.stderr.toString() };
  };
  return { dir, cli };
}

test('analyze + generate writes a linked changelog using the tag as release', () => {
  const { dir, cli } = setup();
  expect(cli('analyze', '--from', 'v0').code).toBe(0);
  expect(cli('generate').code).toBe(0);
  const md = readFileSync(join(dir, 'CHANGELOG.md'), 'utf8');
  expect(md).toMatch(/## \[v1\] - \d{4}-\d{2}-\d{2}/);
  expect(md).toContain('ui: dark mode [#7](https://github.com/o/r/issues/7)');
  expect(md).toContain('crash on start');
});

test('generate --update is idempotent and stdout mode prints content', () => {
  const { dir, cli } = setup();
  cli('analyze', '--from', 'v0');
  cli('generate', '--update');
  cli('generate', '--update');
  const md = readFileSync(join(dir, 'CHANGELOG.md'), 'utf8');
  expect(md.match(/## \[v1\]/g)?.length).toBe(1);

  const out = cli('generate', '--format', 'json', '-o', '-');
  expect(JSON.parse(out.out).version).toBe('v1');
});

test('generate fails clearly without a stage file or with bad options', () => {
  const { dir, cli } = setup();
  expect(cli('generate').code).toBe(1);
  cli('analyze', '--from', 'v0');
  expect(cli('generate', '--format', 'pdf').code).toBe(1);
  expect(cli('generate', '--format', 'html', '--update').code).toBe(1);
  expect(existsSync(join(dir, 'CHANGELOG.html'))).toBe(false);
});
