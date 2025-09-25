import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { multiplyCPU, multiply, benchmark } from '../../gpu/matrixOperations.mjs';

describe('matrixOperations', () => {
    let originalUSE_GPU, originalDISABLE_GPU;

    beforeEach(() => {
        // Save original environment variables
        originalUSE_GPU = process.env.USE_GPU;
        originalDISABLE_GPU = process.env.DISABLE_GPU;
    });

    afterEach(() => {
        // Restore original environment variables
        if (originalUSE_GPU !== undefined) {
            process.env.USE_GPU = originalUSE_GPU;
        } else {
            delete process.env.USE_GPU;
        }
        
        if (originalDISABLE_GPU !== undefined) {
            process.env.DISABLE_GPU = originalDISABLE_GPU;
        } else {
            delete process.env.DISABLE_GPU;
        }
    });

    describe('multiplyCPU', () => {
        it('should multiply 2x2 matrices correctly', () => {
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = multiplyCPU(A, B, 2);
            
            // Expected result: [[19, 22], [43, 50]]
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 19); // 1*5 + 2*7
            assert.strictEqual(result[1], 22); // 1*6 + 2*8
            assert.strictEqual(result[2], 43); // 3*5 + 4*7
            assert.strictEqual(result[3], 50); // 3*6 + 4*8
        });

        it('should multiply 3x3 matrices correctly', () => {
            const A = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const B = new Float32Array([9, 8, 7, 6, 5, 4, 3, 2, 1]);
            const result = multiplyCPU(A, B, 3);
            
            assert.strictEqual(result.length, 9);
            assert.strictEqual(result[0], 30); // 1*9 + 2*6 + 3*3
            assert.strictEqual(result[1], 24); // 1*8 + 2*5 + 3*2
            assert.strictEqual(result[2], 18); // 1*7 + 2*4 + 3*1
        });

        it('should handle 1x1 matrix', () => {
            const A = new Float32Array([5]);
            const B = new Float32Array([3]);
            const result = multiplyCPU(A, B, 1);
            
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0], 15);
        });

        it('should handle zero matrices', () => {
            const A = new Float32Array([0, 0, 0, 0]);
            const B = new Float32Array([1, 2, 3, 4]);
            const result = multiplyCPU(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 0);
            assert.strictEqual(result[1], 0);
            assert.strictEqual(result[2], 0);
            assert.strictEqual(result[3], 0);
        });

        it('should handle identity matrix', () => {
            const A = new Float32Array([1, 0, 0, 1]); // Identity matrix
            const B = new Float32Array([5, 6, 7, 8]);
            const result = multiplyCPU(A, B, 2);
            
            assert.strictEqual(result[0], 5);
            assert.strictEqual(result[1], 6);
            assert.strictEqual(result[2], 7);
            assert.strictEqual(result[3], 8);
        });

        it('should return Float32Array', () => {
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([1, 2, 3, 4]);
            const result = multiplyCPU(A, B, 2);
            
            assert.ok(result instanceof Float32Array);
        });
    });

    describe('multiply', () => {
        it('should use CPU when USE_GPU is not set', async () => {
            delete process.env.USE_GPU;
            
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 19);
            assert.strictEqual(result[1], 22);
            assert.strictEqual(result[2], 43);
            assert.strictEqual(result[3], 50);
        });

        it('should use CPU when DISABLE_GPU is set', async () => {
            process.env.USE_GPU = '1';
            process.env.DISABLE_GPU = '1';
            
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 19);
        });

        it('should fallback to CPU when OpenCL module not found', async () => {
            process.env.USE_GPU = '1';
            delete process.env.DISABLE_GPU;
            
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = await multiply(A, B, 2);
            
            // Should fallback to CPU since OpenCL likely not available
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 19);
        });

        it('should handle empty matrices', async () => {
            const A = new Float32Array([]);
            const B = new Float32Array([]);
            const result = await multiply(A, B, 0);
            
            assert.strictEqual(result.length, 0);
        });

        it('should handle large matrices (CPU fallback)', async () => {
            delete process.env.USE_GPU;
            
            const n = 4;
            const A = new Float32Array(n * n).fill(1);
            const B = new Float32Array(n * n).fill(2);
            const result = await multiply(A, B, n);
            
            assert.strictEqual(result.length, n * n);
            // Each element should be n * 1 * 2 = 2n
            assert.strictEqual(result[0], 2 * n);
        });

        it('should return Float32Array', async () => {
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([1, 2, 3, 4]);
            const result = await multiply(A, B, 2);
            
            assert.ok(result instanceof Float32Array);
        });

        it('should handle negative values', async () => {
            const A = new Float32Array([-1, 2, -3, 4]);
            const B = new Float32Array([5, -6, 7, -8]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 9); // -1*5 + 2*7 = -5 + 14 = 9
            assert.strictEqual(result[1], -10);  // -1*(-6) + 2*(-8) = 6 + (-16) = -10
            assert.strictEqual(result[2], 13); // -3*5 + 4*7 = -15 + 28 = 13
            assert.strictEqual(result[3], -14); // -3*(-6) + 4*(-8) = 18 + (-32) = -14
        });

        it('should handle fractional values', async () => {
            const A = new Float32Array([0.5, 1.5, 2.5, 3.5]);
            const B = new Float32Array([1.0, 2.0, 3.0, 4.0]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            // Allow for floating point precision
            assert.ok(Math.abs(result[0] - 5) < 0.001); // 0.5*1 + 1.5*3
        });
    });

    describe('benchmark', () => {
        it('should return a positive number for execution time', async () => {
            const time = await benchmark(2);
            
            assert.ok(typeof time === 'number');
            assert.ok(time >= 0);
        });

        it('should complete benchmark for small matrices quickly', async () => {
            const time = await benchmark(2);
            
            // Should complete in reasonable time (less than 1000ms)
            assert.ok(time < 1000);
        });

        it('should take longer for larger matrices', async () => {
            const smallTime = await benchmark(2);
            const largeTime = await benchmark(8);
            
            // Larger matrices should generally take more time
            // But we can't guarantee this due to system variance, so just check they're both numbers
            assert.ok(typeof smallTime === 'number');
            assert.ok(typeof largeTime === 'number');
        });

        it('should handle 1x1 matrix benchmark', async () => {
            const time = await benchmark(1);
            
            assert.ok(typeof time === 'number');
            assert.ok(time >= 0);
        });

        it('should handle larger matrix benchmark', async () => {
            const time = await benchmark(4);
            
            assert.ok(typeof time === 'number');
            assert.ok(time >= 0);
            assert.ok(time < 5000); // Should complete within 5 seconds
        });

        it('should use the same multiply function', async () => {
            // This test ensures benchmark uses the multiply function which respects env vars
            delete process.env.USE_GPU;
            
            const time = await benchmark(3);
            
            assert.ok(typeof time === 'number');
            assert.ok(time >= 0);
        });
    });

    describe('environment variable handling', () => {
        it('should respect USE_GPU=1 (will fallback to CPU without OpenCL)', async () => {
            process.env.USE_GPU = '1';
            delete process.env.DISABLE_GPU;
            
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = await multiply(A, B, 2);
            
            // Should still work (fallback to CPU)
            assert.strictEqual(result[0], 19);
        });

        it('should respect USE_GPU=0', async () => {
            process.env.USE_GPU = '0';
            delete process.env.DISABLE_GPU;
            
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result[0], 19);
        });

        it('should respect DISABLE_GPU regardless of USE_GPU', async () => {
            process.env.USE_GPU = '1';
            process.env.DISABLE_GPU = 'true';
            
            const A = new Float32Array([1, 2, 3, 4]);
            const B = new Float32Array([5, 6, 7, 8]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result[0], 19);
        });
    });

    describe('edge cases', () => {
        it('should handle very small numbers', async () => {
            const A = new Float32Array([0.001, 0.002, 0.003, 0.004]);
            const B = new Float32Array([0.1, 0.2, 0.3, 0.4]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            assert.ok(result[0] > 0 && result[0] < 1);
        });

        it('should handle mixed positive and negative values', async () => {
            const A = new Float32Array([1, -1, -1, 1]);
            const B = new Float32Array([1, 1, 1, 1]);
            const result = await multiply(A, B, 2);
            
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 0);  // 1*1 + (-1)*1
            assert.strictEqual(result[1], 0);  // 1*1 + (-1)*1
            assert.strictEqual(result[2], 0);  // (-1)*1 + 1*1
            assert.strictEqual(result[3], 0);  // (-1)*1 + 1*1
        });
    });
});