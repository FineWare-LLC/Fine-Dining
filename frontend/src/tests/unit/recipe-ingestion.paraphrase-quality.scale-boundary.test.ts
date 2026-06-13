// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateRecipeSeedPayload } from '../../../scripts/validate-recipe-seed.mjs';

const seedPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

const fixture = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('validateRecipeSeedPayload keeps the full 100-recipe paraphrase fixture deterministic', async () => {
    const firstPass = await validateRecipeSeedPayload(fixture);
    const secondPass = await validateRecipeSeedPayload(fixture);

    assert.deepEqual(firstPass, {
        recipeCount: 100,
        ingredientLines: 911,
    });
    assert.deepEqual(secondPass, firstPass);
});

test('validateRecipeSeedPayload rejects a large fixture row when numbered paraphrase steps repeat', async () => {
    const mutated = JSON.parse(JSON.stringify(fixture));
    const recipeName = mutated.recipes[99].recipeName;
    mutated.recipes[99].instructions = [
        '1. Warm the skillet over medium heat.',
        '2. Warm the skillet over medium heat.',
        '3. Fold in the vegetables and protein.',
        '4. Season lightly and serve while hot.',
    ].join('\n');

    await assert.rejects(
        () => validateRecipeSeedPayload(mutated),
        new RegExp(`${escapeRegExp(recipeName)}: instructions contain duplicate steps`),
    );
});
