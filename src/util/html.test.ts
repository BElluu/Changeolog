import { expect, test } from 'bun:test';
import { escapeHtml, jsonForScript } from './html';

test('escapeHtml neutralises markup and quotes', () => {
  expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe(
    '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;'
  );
  expect(escapeHtml(undefined)).toBe('');
});

test('jsonForScript cannot close the script tag', () => {
  const out = jsonForScript({ m: '</script><script>alert(1)</script>' });
  expect(out).not.toContain('</script');
  expect(JSON.parse(out).m).toBe('</script><script>alert(1)</script>');
});
