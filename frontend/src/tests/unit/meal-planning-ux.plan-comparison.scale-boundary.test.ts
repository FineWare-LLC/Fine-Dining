// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMealPlanComparisonState } from '../../utils/activeMealPlan';

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildLargeComparisonPlans = () => {
    const plans = [];

    for (let index = 240; index >= 1; index -= 1) {
        plans.push({
            id: `plan-${String(index).padStart(3, '0')}`,
            title: `Bulk plan ${index}`,
            totalCost: 20 + (index % 17),
            totalCalories: 1400 + (index % 23) * 15,
            solverMeta: {
                feasible: index % 4 !== 0,
                solveTimeMs: 50 + (index % 11),
                totalVariables: 100 + index,
                objectiveValue: 1000 + index,
            },
            slots: [
                {
                    id: `slot-${index}`,
                    day: (index % 7) + 1,
                    mealType: index % 2 === 0 ? 'DINNER' : 'LUNCH',
                    recipe: {
                        id: `recipe-${index}`,
                        recipeName: `Bulk recipe ${index}`,
                    },
                    nutritionPerServing: {
                        calories: 400 + index,
                        protein: 20 + (index % 5),
                        carbohydrates: 30 + (index % 7),
                        fat: 10 + (index % 3),
                    },
                    notes: `Large payload ${index}`,
                },
            ],
        });
    }

    plans.push(
        {
            id: 'plan-cheapest',
            title: 'Cheapest plan',
            totalCost: 5,
            totalCalories: 2100,
            solverMeta: {
                feasible: true,
                solveTimeMs: 30,
                totalVariables: 220,
                objectiveValue: 5,
            },
            slots: [{
                id: 'slot-cheapest',
                day: 1,
                mealType: 'DINNER',
                recipe: { id: 'recipe-cheapest', recipeName: 'Budget noodles' },
                nutritionPerServing: { calories: 700, protein: 18, carbohydrates: 72, fat: 12 },
            }],
        },
        {
            id: 'plan-priciest',
            title: 'Priciest plan',
            totalCost: 99,
            totalCalories: 1800,
            solverMeta: {
                feasible: false,
                solveTimeMs: 45,
                totalVariables: 260,
                objectiveValue: 99,
            },
            slots: [{
                id: 'slot-priciest',
                day: 2,
                mealType: 'LUNCH',
                recipe: { id: 'recipe-priciest', recipeName: 'Luxury tasting menu' },
                nutritionPerServing: { calories: 600, protein: 32, carbohydrates: 44, fat: 28 },
            }],
        },
        {
            id: 'plan-lowest-calories',
            title: 'Lowest calorie plan',
            totalCost: 42,
            totalCalories: 1000,
            solverMeta: {
                feasible: true,
                solveTimeMs: 25,
                totalVariables: 180,
                objectiveValue: 42,
            },
            slots: [{
                id: 'slot-lowest-calories',
                day: 3,
                mealType: 'BREAKFAST',
                recipe: { id: 'recipe-lowest-calories', recipeName: 'Green smoothie' },
                nutritionPerServing: { calories: 250, protein: 12, carbohydrates: 28, fat: 6 },
            }],
        },
        {
            id: 'plan-highest-calories',
            title: 'Highest calorie plan',
            totalCost: 41,
            totalCalories: 5000,
            solverMeta: {
                feasible: true,
                solveTimeMs: 26,
                totalVariables: 190,
                objectiveValue: 41,
            },
            slots: [{
                id: 'slot-highest-calories',
                day: 4,
                mealType: 'DINNER',
                recipe: { id: 'recipe-highest-calories', recipeName: 'Feast platter' },
                nutritionPerServing: { calories: 1600, protein: 48, carbohydrates: 82, fat: 40 },
            }],
        },
    );

    return plans;
};

test('resolveMealPlanComparisonState keeps a large comparison fixture deterministic without repeated full-array sorts', () => {
    const persistedPlans = buildLargeComparisonPlans();
    const originalSnapshot = clone(persistedPlans);

    const measureSortCalls = (inputPlans) => {
        const originalSort = Array.prototype.sort;
        let sortCalls = 0;

        Array.prototype.sort = function patchedSort(...args) {
            sortCalls += 1;
            return originalSort.apply(this, args);
        };

        try {
            return {
                result: resolveMealPlanComparisonState(inputPlans),
                sortCalls,
            };
        } finally {
            Array.prototype.sort = originalSort;
        }
    };

    const firstPass = measureSortCalls(persistedPlans);
    const refreshedPass = measureSortCalls(clone(persistedPlans));

    assert.deepEqual(persistedPlans, originalSnapshot);
    assert.equal(firstPass.sortCalls, 1);
    assert.equal(refreshedPass.sortCalls, 1);
    assert.deepEqual(firstPass.result, refreshedPass.result);
    assert.equal(firstPass.result.status, 'resolved');
    assert.equal(firstPass.result.sortedPlans.length, persistedPlans.length);
    assert.equal(firstPass.result.sortedPlans[0].id, 'plan-cheapest');
    assert.equal(firstPass.result.sortedPlans.at(-1).id, 'plan-priciest');
    assert.deepEqual(firstPass.result.summary, {
        planCount: persistedPlans.length,
        feasiblePlanCount: persistedPlans.filter((plan) => plan.solverMeta.feasible === true).length,
        cheapestPlanId: 'plan-cheapest',
        highestCostPlanId: 'plan-priciest',
        lowestCaloriesPlanId: 'plan-lowest-calories',
        highestCaloriesPlanId: 'plan-highest-calories',
        costSpread: 94,
        calorieSpread: 4000,
    });
});
