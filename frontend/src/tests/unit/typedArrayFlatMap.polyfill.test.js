//
// Existing geolocation tests fail; legacy code cleanup needed.
import assert from 'node:assert/strict';
import test from 'node:test';
import applyPolyfill from '../../utils/typedArrayFlatMapPolyfill.js';

test('Float32Array.flatMap maps and flattens values', async () => {
    applyPolyfill();
    const arr = new Float32Array([1, 2]);
    const result = arr.flatMap(x => [x, x * 2]);
    assert.deepEqual(result, [1, 2, 2, 4]);
});
