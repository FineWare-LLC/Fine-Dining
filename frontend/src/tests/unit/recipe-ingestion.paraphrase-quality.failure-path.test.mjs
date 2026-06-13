import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { validateRecipeSeedPayload } from '../../../scripts/validate-recipe-seed.mjs';

const seedPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

const fixture = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

test('validateRecipeSeedPayload rejects duplicated instruction steps as paraphrase quality failures', async () => {
    const mutated = JSON.parse(JSON.stringify(fixture));
    mutated.recipes[0].instructions = [
        'Warm the skillet over medium heat.',
        'Warm the skillet over medium heat.',
        'Fold in the vegetables and protein.',
        'Season lightly and serve while hot.',
    ].join('\n');

    await assert.rejects(
        () => validateRecipeSeedPayload(mutated),
        /Lemon Herb Chicken Quinoa Bowls: instructions contain duplicate steps/,
    );
});
