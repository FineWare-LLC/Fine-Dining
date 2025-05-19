import { benchmark } from './matrixOperations.mjs';

const size = parseInt(process.argv[2] || '512', 10);
benchmark(size).then(time => {
  console.log(`Matrix ${size}x${size} multiplication took ${time.toFixed(2)}ms`);
}).catch(err => {
  console.error('Benchmark failed:', err);
});
