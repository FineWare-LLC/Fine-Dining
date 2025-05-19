import test from 'node:test';
import assert from 'node:assert/strict';

import * as normalizer from '../../lib/HiGHS/src/normalizer/index.mjs';
import * as enricher from '../../lib/HiGHS/src/enricher/index.mjs';
import * as sampler from '../../lib/HiGHS/src/sampler/index.mjs';

// Sample raw data that would normally come from the fetcher
const raw = [
  {
    meal_name: 'Mock Meal 1',
    calories: '100',
    protein: '10',
    carbohydrates: '20',
    fat: '5',
    sodium: '300',
    price: '4',
    allergens: '[]'
  },
  {
    meal_name: 'Mock Meal 2',
    calories: '200',
    protein: '20',
    carbohydrates: '30',
    fat: '10',
    sodium: '500',
    price: '6',
    allergens: '[]'
  }
];

test('pipeline modules transform data sequentially', async () => {
  const norm = await normalizer.run(raw);
  const enr = await enricher.run(norm);
  const samp = await sampler.run(enr);

  assert.equal(norm.length, raw.length);
  assert.equal(enr.length, raw.length);
  assert.equal(samp.length, raw.length);
  assert.ok('protein_density' in enr[0]);
});
