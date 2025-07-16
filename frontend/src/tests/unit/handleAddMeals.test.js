import assert from 'node:assert/strict';
import test from 'node:test';
import { createAddMealsHandler } from '../../hooks/addMealsHelper.js';

test('handleAddMeals uses provided meal type in mutation', async () => {
    const createMeal = test.mock.fn(async () => ({}));
    const handleAddMeals = createAddMealsHandler(createMeal, 'plan1');
    const meal = { mealName: 'A', price: 1, nutrition: {}, allergens: [] };
    await handleAddMeals([meal], 'BREAKFAST');
    assert.equal(createMeal.mock.callCount(), 1);
    const vars = createMeal.mock.calls[0].arguments[0].variables;
    assert.equal(vars.mealType, 'BREAKFAST');
});
