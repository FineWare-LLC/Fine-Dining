import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../../');

const docs = [
  'branching_guidelines.md',
  'user_guide.md',
  'troubleshooting.md',
  'encryption.md'
];

test('README references required documentation files', () => {
  for (const doc of docs) {
    const p = path.join(rootDir, 'docs', doc);
    assert.ok(fs.existsSync(p), `${doc} is missing`);
  }
});
