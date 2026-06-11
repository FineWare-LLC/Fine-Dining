import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { benchmark } from '../../gpu/matrixOperations.mjs';

describe('GPU performance benchmark', () => {
    it('multiplies a large matrix within a reasonable time', async () => {
        const time = await benchmark(256);
        console.log('Benchmark 256x256 took', time, 'ms');
        const gpuEnabled = process.env.USE_GPU && !process.env.DISABLE_GPU;
        assert.ok(time < 1000 || !gpuEnabled, 'Benchmark took too long');
    });
});
