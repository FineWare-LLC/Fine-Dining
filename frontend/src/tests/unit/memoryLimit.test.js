import assert from 'node:assert/strict';
import test from 'node:test';
import getMemoryLimit from '../../lib/getMemoryLimit.js';

test('process is limited to 1GB of memory', () => {
    assert.equal(getMemoryLimit(), 1024);
});
