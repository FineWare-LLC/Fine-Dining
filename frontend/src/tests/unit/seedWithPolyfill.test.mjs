import test from 'node:test';
import assert from 'node:assert/strict';

import { seedWithPolyfill } from '../../../../highs-pipeline/seed_with_polyfill.mjs';

export default test('seed_with_polyfill applies flatMap polyfill before seeding', async () => {
  const original = Float32Array.prototype.flatMap;
  delete Float32Array.prototype.flatMap;

  let polyfillCalled = false;
  let seedCalled = false;

  await seedWithPolyfill(async () => { seedCalled = true; });

  polyfillCalled = typeof Float32Array.prototype.flatMap === 'function';

  assert.ok(polyfillCalled);
  assert.ok(seedCalled);

  if (original) {
    Float32Array.prototype.flatMap = original;
  } else {
    delete Float32Array.prototype.flatMap;
  }
});
