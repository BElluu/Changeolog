import { expect, test } from 'bun:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, validateConfig } from '.';

const tmp = () => mkdtempSync(join(tmpdir(), 'changeolog-cfg-'));

test('missing default config is fine, explicit missing config is an error', async () => {
  const cwd = process.cwd();
  process.chdir(tmp());
  try {
    expect(await loadConfig()).toEqual({});
  } finally {
    process.chdir(cwd);
  }
  await expect(loadConfig(join(tmp(), 'nope.json'))).rejects.toThrow(/not found/);
});

test('loads a valid config file', async () => {
  const file = join(tmp(), 'c.json');
  await Bun.write(file, JSON.stringify({ appName: 'X', patterns: { bug: ['^hotfix'] } }));
  expect(await loadConfig(file)).toEqual({ appName: 'X', patterns: { bug: ['^hotfix'] } });
});

test('rejects malformed config', async () => {
  const file = join(tmp(), 'bad.json');
  await Bun.write(file, '{ not json');
  await expect(loadConfig(file)).rejects.toThrow(/Cannot read config/);
  expect(() => validateConfig([])).toThrow(/JSON object/);
  expect(() => validateConfig({ appName: 1 })).toThrow(/appName/);
  expect(() => validateConfig({ patterns: { bug: 'x' } })).toThrow(/patterns/);
});
