import assert from 'node:assert/strict';
import test from 'node:test';
import safeFlatMap from '../../utils/safeFlatMap.js';

test('safeFlatMap returns empty array for non-array input', () => {
    const result = safeFlatMap({}, x => [x]);
    assert.deepEqual(result, []);
});

test('safeFlatMap maps and flattens arrays', () => {
    const result = safeFlatMap([1, 2], x => [x, x * 2]);
    assert.deepEqual(result, [1, 2, 2, 4]);
});
