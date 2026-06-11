import assert from 'node:assert/strict';
import test from 'node:test';

let MealModel, repo;
try {
    ({ MealModel } = await import('../../models/Meal/index.js'));
    repo = await import('../../data/MealRepository.js');
} catch (err) {
    test('MealRepository module unavailable', { skip: true }, () => {});
}

if (repo) {
    const { countMeals, findMeals, findMealById } = repo;

    test('countMeals delegates to MealModel.countDocuments', async t => {
        const tracker = t.mock.method(MealModel, 'countDocuments', async () => 4);
        const query = { price: { $gt: 0 } };
        const result = await countMeals(query);
        assert.equal(result, 4);
        assert.equal(tracker.mock.callCount(), 1);
        assert.deepEqual(tracker.mock.calls[0].arguments, [query]);
    });

    test('findMeals delegates to MealModel.find', async t => {
        const meals = [{ _id: '1' }];
        const tracker = t.mock.method(MealModel, 'find', async () => meals);
        const query = { name: 'A' };
        const result = await findMeals(query);
        assert.equal(result, meals);
        assert.equal(tracker.mock.callCount(), 1);
        assert.deepEqual(tracker.mock.calls[0].arguments, [query]);
    });

    test('findMealById delegates to MealModel.findById', async t => {
        const meal = { _id: '2' };
        const tracker = t.mock.method(MealModel, 'findById', async id => {
            assert.equal(id, '2');
            return meal;
        });
        const result = await findMealById('2');
        assert.equal(result, meal);
        assert.equal(tracker.mock.callCount(), 1);
    });
}
