// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    ProcessedMealsLoadError,
    parseProcessedMealsCsv,
    parseProcessedMealsJson,
} from '../../../../highs-pipeline/src/processedMealsLoader.mjs';

const JSON_FIXTURE = JSON.stringify([
    {
        chain: "McDonald's",
        meal_name: 'Spicy McCrispy™',
        price: 0,
        calories: 437,
        protein: 30,
        carbohydrates: 54,
        fat: 18,
        sodium: 608,
        allergens: ['Wheat', 'Fish'],
        protein_density: 6.86,
        carb_protein_ratio: 1.8,
        sodium_per_calorie: 1.39,
        price_per_protein: 0,
        health_score: 0.67,
        protein_category: 'high',
    },
]);

const CSV_FIXTURE = [
    'chain,meal_name,price,calories,protein,carbohydrates,fat,sodium,allergens,protein_density,carb_protein_ratio,sodium_per_calorie,price_per_protein,health_score,protein_category',
    `McDonald's,Spicy McCrispy™,0,437,30,54,18,608,"[""Wheat"",""Fish""]",6.86,1.80,1.39,0.00,0.67,high`,
].join('\n');

const INVALID_CSV_FIXTURE = [
    'chain,meal_name,price,calories,protein,carbohydrates,fat,sodium,allergens,protein_density,carb_protein_ratio,sodium_per_calorie,price_per_protein,health_score,protein_category',
    `McDonald's,Spicy McCrispy™,0,437,30,54,18,608,"Wheat, Fish",6.86,1.80,1.39,0.00,0.67,high`,
].join('\n');

test('parseProcessedMealsCsv preserves the same canonical record shape as parseProcessedMealsJson', () => {
    const csvMeals = parseProcessedMealsCsv(CSV_FIXTURE);
    const jsonMeals = parseProcessedMealsJson(JSON_FIXTURE);

    assert.deepEqual(csvMeals, jsonMeals);
    assert.deepEqual(csvMeals, [
        {
            chain: "McDonald's",
            meal_name: 'Spicy McCrispy™',
            price: 0,
            calories: 437,
            protein: 30,
            carbohydrates: 54,
            fat: 18,
            sodium: 608,
            allergens: ['Wheat', 'Fish'],
            protein_density: 6.86,
            carb_protein_ratio: 1.8,
            sodium_per_calorie: 1.39,
            price_per_protein: 0,
            health_score: 0.67,
            protein_category: 'high',
        },
    ]);
});

test('parseProcessedMealsCsv rejects malformed allergen payloads with a typed user-safe error', () => {
    assert.throws(
        () => parseProcessedMealsCsv(INVALID_CSV_FIXTURE),
        (error) => {
            assert.ok(error instanceof ProcessedMealsLoadError);
            assert.equal(error.code, 'invalidPayload');
            assert.equal(error.isUserSafe, true);
            assert.match(error.message, /processed meal/i);
            return true;
        },
    );
});
