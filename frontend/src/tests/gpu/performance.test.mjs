import { benchmark } from '../../gpu/matrixOperations.mjs';
import assert from 'node:assert';

describe('GPU performance benchmark', () => {
  it('multiplies a large matrix within a reasonable time', async () => {
    const time = await benchmark(256);
    console.log('Benchmark 256x256 took', time, 'ms');
    assert.ok(time < 1000 || !process.env.USE_GPU, 'Benchmark took too long');
  });
});
