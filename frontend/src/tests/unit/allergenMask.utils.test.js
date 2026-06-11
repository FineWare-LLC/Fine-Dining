import test from 'node:test';
import assert from 'node:assert/strict';

import { computeMealAllergenMask } from '../../utils/allergenMask.js';

await test('computeMealAllergenMask returns union of ingredient allergen bitmasks while ignoring blanks', async () => {
  const ingredients = [
    { allergenMask: 0b0001 },
    { allergenMask: 0b1000 },
    { allergenMask: undefined },
    {},
    { allergenMask: 0b0100 },
    { allergenMask: 0b1000 },
  ];

  const mask = computeMealAllergenMask(ingredients);

  assert.equal(mask, 0b1101);
});
