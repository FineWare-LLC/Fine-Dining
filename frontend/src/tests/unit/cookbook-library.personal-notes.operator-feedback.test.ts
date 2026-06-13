// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cookbookPagePath = fileURLToPath(new URL('../../pages/cookbook.tsx', import.meta.url));
const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');

test('cookbook page exposes personal notes editing feedback in the entry dialog', () => {
    assert.match(cookbookPageSource, /label="Notes"/);
    assert.match(cookbookPageSource, /multiline/);
    assert.match(cookbookPageSource, /rows=\{3\}/);
    assert.match(cookbookPageSource, /No personal notes yet\./);
    assert.match(cookbookPageSource, /Saving personal notes\.\.\./);
    assert.match(cookbookPageSource, /isUpdatingEntry/);
    assert.match(cookbookPageSource, /disabled=\{isUpdatingEntry\}/);
    assert.match(cookbookPageSource, /notes:\s*editEntry\.notes\s*\?\?\s*''/);
});
