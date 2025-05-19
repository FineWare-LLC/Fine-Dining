import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeString } from '../../lib/sanitize.js';

test('sanitizeString escapes HTML tags', () => {
  const input = "<script>alert('xss')</script>";
  const expected = "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;";
  assert.equal(sanitizeString(input), expected);
});

test('sanitizeString leaves plain text intact', () => {
  const input = "Hello World";
  assert.equal(sanitizeString(input), 'Hello World');
});
