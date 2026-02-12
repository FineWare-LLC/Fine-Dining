import applyTypedArrayFlatMapPolyfill from '../frontend/src/utils/typedArrayFlatMapPolyfill.js';

export async function seedWithPolyfill(importFn = m => import(m), polyfill = applyTypedArrayFlatMapPolyfill) {
  polyfill();
  await importFn('./seed_database.mjs');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedWithPolyfill();
}
