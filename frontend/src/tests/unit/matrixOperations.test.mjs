import assert from 'node:assert/strict';
import test from 'node:test';
import { multiplyCPU, benchmark } from '../../gpu/matrixOperations.mjs';

// Test multiplyCPU with a simple 2x2 matrix multiplication
// [ [1,2], [3,4] ] * [ [5,6], [7,8] ] = [ [19,22], [43,50] ]
test('multiplyCPU correctly multiplies 2x2 matrices', () => {
    const A = Float32Array.from([1, 2, 3, 4]);
    const B = Float32Array.from([5, 6, 7, 8]);
    const result = multiplyCPU(A, B, 2);
    const expected = Float32Array.from([19, 22, 43, 50]);
    assert.deepEqual(Array.from(result), Array.from(expected));
});

let openclAvailable = false;
try {
    await import('opencl');
    openclAvailable = true;
} catch {
    // OpenCL not available, GPU tests will be skipped
}

if (openclAvailable) {
    test('benchmark completes using GPU when available', async () => {
        process.env.USE_GPU = '1';
        const time = await benchmark(4);
        assert.equal(typeof time, 'number');
        assert.ok(time > 0);
    });
} else {
    test('benchmark completes using GPU when available', { skip: true }, () => {});
}

// CPU benchmark should always run

test('benchmark completes quickly on CPU', async () => {
    delete process.env.USE_GPU;
    const time = await benchmark(4);
    assert.equal(typeof time, 'number');
    assert.ok(time < 100);
});

test('GPU_MODE=off bypasses OpenCL import', async t => {
    process.env.USE_GPU = '1';
    process.env.GPU_MODE = 'off';
    const warnTracker = t.mock.method(console, 'warn', () => {});
    const { multiply } = await import('../../gpu/matrixOperations.mjs');
    const A = Float32Array.from([1, 0, 0, 1]);
    const result = await multiply(A, A, 2);
    assert.equal(warnTracker.mock.callCount(), 0);
    assert.deepEqual(Array.from(result), Array.from(A));
});

test('GPU_MODE=auto falls back to CPU when OpenCL missing', async t => {
    process.env.GPU_MODE = 'auto';
    const warnTracker = t.mock.method(console, 'warn', () => {});
    const { multiply } = await import('../../gpu/matrixOperations.mjs');
    const A = Float32Array.from([1, 0, 0, 1]);
    const result = await multiply(A, A, 2);
    assert.ok(warnTracker.mock.callCount() > 0);
    assert.deepEqual(Array.from(result), Array.from(A));
});

test('GPU_MODE=force throws when OpenCL is unavailable', async () => {
    process.env.GPU_MODE = 'force';
    const { multiply } = await import('../../gpu/matrixOperations.mjs');
    const A = Float32Array.from([1, 0, 0, 1]);
    await assert.rejects(() => multiply(A, A, 2));
});
