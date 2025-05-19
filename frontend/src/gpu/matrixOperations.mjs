// Prototype GPU matrix operations using OpenCL
// This module provides basic matrix multiplication with an
// optional GPU implementation using the 'opencl' npm package.
// If USE_GPU environment variable is set, the GPU path is attempted.

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
  if (!process.env.USE_GPU) {
    return multiplyCPU(A, B, n);
  }

  let cl;
  try {
    cl = await import('opencl');
  } catch (err) {
    console.warn('OpenCL module not found, falling back to CPU:', err.message);
    return multiplyCPU(A, B, n);
  }

  try {
    const context = cl.createContextFromType([cl.DEVICE_TYPE_GPU]);
    const device = cl.getContextInfo(context, cl.CONTEXT_DEVICES)[0];
    const queue = cl.createCommandQueue(context, device, 0);

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

    const program = cl.createProgramWithSource(context, kernelSource);
    cl.buildProgram(program);
    const kernel = cl.createKernel(program, 'matMul');

    const byteSize = n * n * 4;
    const bufferA = cl.createBuffer(context, cl.MEM_READ_ONLY, byteSize);
    const bufferB = cl.createBuffer(context, cl.MEM_READ_ONLY, byteSize);
    const bufferC = cl.createBuffer(context, cl.MEM_WRITE_ONLY, byteSize);

    cl.enqueueWriteBuffer(queue, bufferA, true, 0, byteSize, A);
    cl.enqueueWriteBuffer(queue, bufferB, true, 0, byteSize, B);

    cl.setKernelArg(kernel, 0, 'pointer', bufferA);
    cl.setKernelArg(kernel, 1, 'pointer', bufferB);
    cl.setKernelArg(kernel, 2, 'pointer', bufferC);
    cl.setKernelArg(kernel, 3, 'uint', n);

    const globalWorkSize = [n, n];
    cl.enqueueNDRangeKernel(queue, kernel, 2, null, globalWorkSize);
    cl.finish(queue);

    const result = new Float32Array(n * n);
    cl.enqueueReadBuffer(queue, bufferC, true, 0, byteSize, result);

    cl.releaseKernel(kernel);
    cl.releaseProgram(program);
    cl.releaseMemObject(bufferA);
    cl.releaseMemObject(bufferB);
    cl.releaseMemObject(bufferC);
    cl.releaseCommandQueue(queue);
    cl.releaseContext(context);

    return result;
  } catch (err) {
    console.warn('GPU computation failed, falling back to CPU:', err.message);
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
