import { expect, test } from 'bun:test';
import { validateStagedData } from '.';

const valid = () => ({
  fromRef: 'v1', toRef: 'HEAD',
  commits: [{ hash: 'abc', shortHash: 'abc', message: 'm', author: 'a', type: 'bug' }],
  groups: [{ id: 'g', message: 'm', author: 'a', commits: ['abc'], type: 'feature' }],
  excluded: ['abc']
});

test('accepts well-formed stage data', () => {
  expect(validateStagedData(valid()).fromRef).toBe('v1');
});

test('rejects malformed stage data', () => {
  expect(() => validateStagedData(null)).toThrow();
  expect(() => validateStagedData({ ...valid(), commits: 'x' })).toThrow();
  expect(() => validateStagedData({ ...valid(), excluded: [1] })).toThrow();
  const bad = valid(); bad.commits[0].type = 'nope';
  expect(() => validateStagedData(bad)).toThrow();
});
