import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';

const composePath = new URL('../../../../docker-compose.yml', import.meta.url);

test('docker-compose defines app and mongodb services', async () => {
  const content = await fs.readFile(composePath, 'utf8');
  assert.match(content, /services:/);
  assert.match(content, /app:/);
  assert.match(content, /mongodb:/);
});
