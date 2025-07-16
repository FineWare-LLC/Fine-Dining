// Prototype GPU matrix operations using OpenCL
// This module provides basic matrix multiplication with an
// optional GPU implementation using the 'opencl' npm package.
// If USE_GPU environment variable is set, the GPU path is attempted unless
// DISABLE_GPU explicitly disables it.

import { performance } from 'node:perf_hooks';

/**
 * CPU fallback matrix multiplication for square matrices.
 * @param {Float32Array} A
 * @param {Float32Array} B
 * @param {number} n size (n x n)
 * @returns {Float32Array}
 */
export function multiplyCPU(A, B, n) {
    const C = new Float32Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) sum += A[i * n + k] * B[k * n + j];
            C[i * n + j] = sum;
        }
    }
    return C;
}

/**
 * Attempt GPU matrix multiplication using OpenCL.
 * Falls back to CPU if any step fails or USE_GPU is not set.
 * @param {Float32Array} A
 * @param {Float32Array} B
 * @param {number} n
 * @returns {Promise<Float32Array>}
 */
export async function multiply(A, B, n) {
    const mode = process.env.GPU_MODE || (process.env.USE_GPU ? 'auto' : 'off');
    if (mode === 'off') {
        return multiplyCPU(A, B, n);
    }

    function clStep(description, fn) {
        try {
            return fn();
        } catch (err) {
            console.error(`OpenCL ${description} failed: ${err.message}`);
            throw err;
        }
    }

    let cl;
    try {
        cl = await import('opencl');
    } catch (err) {
        console.warn('OpenCL module not found, falling back to CPU:', err.message);
        if (mode === 'force') throw err;
        return multiplyCPU(A, B, n);
    }

    let context, device, queue, program, kernel, bufferA, bufferB, bufferC;
    try {
        context = clStep('create context', () => cl.createContextFromType([cl.DEVICE_TYPE_GPU]));
    } catch (err) {
        if (mode === 'force') throw err;
        return multiplyCPU(A, B, n);
    }

    try {
        device = clStep('get device', () => cl.getContextInfo(context, cl.CONTEXT_DEVICES)[0]);
        const vendor = clStep('get device vendor', () => cl.getDeviceInfo(device, cl.DEVICE_VENDOR));
        if (!/(NVIDIA|AMD|Intel)/i.test(vendor)) {
            console.warn(`Unsupported GPU device: ${vendor}. Falling back to CPU.`);
            cl.releaseContext(context);
            if (mode === 'force') throw new Error('Unsupported GPU device');
            return multiplyCPU(A, B, n);
        }
    } catch (err) {
        cl.releaseContext(context);
        if (mode === 'force') throw err;
        return multiplyCPU(A, B, n);
    }

    try {
        queue = clStep('create command queue', () => cl.createCommandQueue(context, device, 0));
    } catch (err) {
        cl.releaseContext(context);
        if (mode === 'force') throw err;
        return multiplyCPU(A, B, n);
    }

    try {
        const kernelSource = `__kernel void matMul(
      __global float* A,
      __global float* B,
      __global float* C,
      const int N) {
      int row = get_global_id(0);
      int col = get_global_id(1);
      float sum = 0.0f;
      for (int k = 0; k < N; ++k) {
        sum += A[row * N + k] * B[k * N + col];
      }
      C[row * N + col] = sum;
    }`;

        try {
            program = clStep('create program', () => cl.createProgramWithSource(context, kernelSource));
        } catch (err) {
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        try {
            clStep('build program', () => cl.buildProgram(program));
        } catch (err) {
            cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        try {
            kernel = clStep('create kernel', () => cl.createKernel(program, 'matMul'));
        } catch (err) {
            cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        const byteSize = n * n * 4;
        try {
            bufferA = clStep('create bufferA', () => cl.createBuffer(context, cl.MEM_READ_ONLY, byteSize));
            bufferB = clStep('create bufferB', () => cl.createBuffer(context, cl.MEM_READ_ONLY, byteSize));
            bufferC = clStep('create bufferC', () => cl.createBuffer(context, cl.MEM_WRITE_ONLY, byteSize));
        } catch (err) {
            if (kernel) cl.releaseKernel(kernel);
            if (program) cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        try {
            clStep('write bufferA', () => cl.enqueueWriteBuffer(queue, bufferA, true, 0, byteSize, A));
            clStep('write bufferB', () => cl.enqueueWriteBuffer(queue, bufferB, true, 0, byteSize, B));
        } catch (err) {
            if (bufferA) cl.releaseMemObject(bufferA);
            if (bufferB) cl.releaseMemObject(bufferB);
            if (bufferC) cl.releaseMemObject(bufferC);
            if (kernel) cl.releaseKernel(kernel);
            if (program) cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        try {
            clStep('set kernel arg 0', () => cl.setKernelArg(kernel, 0, 'pointer', bufferA));
            clStep('set kernel arg 1', () => cl.setKernelArg(kernel, 1, 'pointer', bufferB));
            clStep('set kernel arg 2', () => cl.setKernelArg(kernel, 2, 'pointer', bufferC));
            clStep('set kernel arg 3', () => cl.setKernelArg(kernel, 3, 'uint', n));
        } catch (err) {
            if (bufferA) cl.releaseMemObject(bufferA);
            if (bufferB) cl.releaseMemObject(bufferB);
            if (bufferC) cl.releaseMemObject(bufferC);
            if (kernel) cl.releaseKernel(kernel);
            if (program) cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        const globalWorkSize = [n, n];
        try {
            clStep('execute kernel', () => {
                cl.enqueueNDRangeKernel(queue, kernel, 2, null, globalWorkSize);
                cl.finish(queue);
            });
        } catch (err) {
            if (bufferA) cl.releaseMemObject(bufferA);
            if (bufferB) cl.releaseMemObject(bufferB);
            if (bufferC) cl.releaseMemObject(bufferC);
            if (kernel) cl.releaseKernel(kernel);
            if (program) cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        const result = new Float32Array(n * n);
        try {
            clStep('read result buffer', () => cl.enqueueReadBuffer(queue, bufferC, true, 0, byteSize, result));
        } catch (err) {
            if (bufferA) cl.releaseMemObject(bufferA);
            if (bufferB) cl.releaseMemObject(bufferB);
            if (bufferC) cl.releaseMemObject(bufferC);
            if (kernel) cl.releaseKernel(kernel);
            if (program) cl.releaseProgram(program);
            cl.releaseCommandQueue(queue);
            cl.releaseContext(context);
            if (mode === 'force') throw err;
            return multiplyCPU(A, B, n);
        }

        cl.releaseMemObject(bufferA);
        cl.releaseMemObject(bufferB);
        cl.releaseMemObject(bufferC);
        cl.releaseKernel(kernel);
        cl.releaseProgram(program);
        cl.releaseCommandQueue(queue);
        cl.releaseContext(context);

        return result;
    } catch (err) {
        console.warn('GPU computation failed, falling back to CPU:', err.message);
        if (bufferA) cl.releaseMemObject(bufferA);
        if (bufferB) cl.releaseMemObject(bufferB);
        if (bufferC) cl.releaseMemObject(bufferC);
        if (kernel) cl.releaseKernel(kernel);
        if (program) cl.releaseProgram(program);
        if (queue) cl.releaseCommandQueue(queue);
        if (context) cl.releaseContext(context);
        if (mode === 'force') throw err;
        return multiplyCPU(A, B, n);
    }
}

/**
 * Helper to benchmark multiplication using either CPU or GPU.
 * @param {number} n matrix dimension
 * @returns {Promise<number>} milliseconds elapsed
 */
export async function benchmark(n) {
    const A = new Float32Array(n * n).fill(1);
    const B = new Float32Array(n * n).fill(1);

    const start = performance.now();
    await multiply(A, B, n);
    return performance.now() - start;
}
