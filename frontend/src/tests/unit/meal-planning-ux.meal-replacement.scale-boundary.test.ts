// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { usePlannerStore } from '../../components/legacy/PlannerCanvas/store/plannerStore';

const clone = (value) => JSON.parse(JSON.stringify(value));

const createMeal = (overrides = {}) => ({
    id: 'meal-filler',
    mealType: 'lunch',
    mealName: 'Filler meal',
    servings: 1,
    nutrition: {
        calories: 240,
        protein: 16,
        carbohydrates: 24,
        fat: 8,
        sodium: 320,
        fiber: 4,
        sugar: 6,
    },
    ...overrides,
});

const buildLargeMealPlanSnapshot = () => {
    const mealPlan = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
    };
    const selectedMeals = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

    for (let index = 0; index < 128; index += 1) {
        const mealType = mealTypes[index % mealTypes.length];
        const meal = createMeal({
            id: `meal-${index}`,
            mealType,
            mealName: `Meal ${String(index).padStart(3, '0')}`,
            servings: (index % 3) + 1,
            nutrition: {
                calories: 180 + index,
                protein: 12 + (index % 9),
                carbohydrates: 20 + (index % 11),
                fat: 6 + (index % 7),
                sodium: 250 + index,
                fiber: 3 + (index % 5),
                sugar: 4 + (index % 6),
            },
        });

        mealPlan[mealType].push(meal);
        selectedMeals.push(meal);
    }

    const breakfastMeal = createMeal({
        id: 'meal-shared-id',
        mealType: 'breakfast',
        mealName: 'Breakfast anchor',
        servings: 2,
        nutrition: {
            calories: 440,
            protein: 28,
            carbohydrates: 32,
            fat: 16,
            sodium: 410,
            fiber: 6,
            sugar: 8,
        },
    });
    const lunchMeal = createMeal({
        id: 'meal-shared-id',
        mealType: 'lunch',
        mealName: 'Lunch anchor',
        servings: 3,
        nutrition: {
            calories: 610,
            protein: 34,
            carbohydrates: 44,
            fat: 22,
            sodium: 530,
            fiber: 7,
            sugar: 10,
        },
    });

    mealPlan.breakfast.unshift(breakfastMeal);
    mealPlan.lunch.push(lunchMeal);
    selectedMeals.unshift(breakfastMeal);
    selectedMeals.push(lunchMeal);

    return {
        selectedMeals,
        mealPlan,
        history: [],
        historyIndex: -1,
        canUndo: false,
        canRedo: false,
        complianceScore: 0,
        breakfastMeal,
        lunchMeal,
    };
};

const snapshotPlannerState = () => ({
    selectedMeals: clone(usePlannerStore.getState().selectedMeals),
    mealPlan: clone(usePlannerStore.getState().mealPlan),
    history: clone(usePlannerStore.getState().history),
    historyIndex: usePlannerStore.getState().historyIndex,
    canUndo: usePlannerStore.getState().canUndo,
    canRedo: usePlannerStore.getState().canRedo,
    complianceScore: usePlannerStore.getState().complianceScore,
});

const normalizeSnapshot = (snapshot) => ({
    ...snapshot,
    history: snapshot.history.map(({ timestamp, ...entry }) => entry),
});

test('swapMeal keeps a large plan aligned when the same source id appears in multiple meal types', () => {
    const originalState = usePlannerStore.getState();
    const baseline = buildLargeMealPlanSnapshot();
    const replacementMeal = createMeal({
        id: 'meal-lunch-replacement',
        mealType: 'lunch',
        mealName: 'Lunch replacement',
        servings: 1,
        nutrition: {
            calories: 395,
            protein: 30,
            carbohydrates: 36,
            fat: 14,
            sodium: 360,
            fiber: 5,
            sugar: 9,
        },
    });

    try {
        usePlannerStore.setState(clone({
            selectedMeals: baseline.selectedMeals,
            mealPlan: baseline.mealPlan,
            history: baseline.history,
            historyIndex: baseline.historyIndex,
            canUndo: baseline.canUndo,
            canRedo: baseline.canRedo,
            complianceScore: baseline.complianceScore,
        }));

        usePlannerStore.getState().swapMeal(baseline.lunchMeal.id, replacementMeal, 'lunch');
        const firstResult = snapshotPlannerState();

        usePlannerStore.setState(clone({
            selectedMeals: baseline.selectedMeals,
            mealPlan: baseline.mealPlan,
            history: baseline.history,
            historyIndex: baseline.historyIndex,
            canUndo: baseline.canUndo,
            canRedo: baseline.canRedo,
            complianceScore: baseline.complianceScore,
        }));

        usePlannerStore.getState().swapMeal(baseline.lunchMeal.id, replacementMeal, 'lunch');
        const secondResult = snapshotPlannerState();

        assert.deepEqual(normalizeSnapshot(firstResult), normalizeSnapshot(secondResult));
        assert.equal(firstResult.selectedMeals.length, baseline.selectedMeals.length);
        assert.deepEqual(firstResult.mealPlan.breakfast[0], baseline.breakfastMeal);
        assert.deepEqual(firstResult.mealPlan.lunch[firstResult.mealPlan.lunch.length - 1], {
            ...replacementMeal,
            servings: baseline.lunchMeal.servings,
            mealType: 'lunch',
        });
        assert.deepEqual(
            firstResult.selectedMeals
                .filter((meal) => meal.id === baseline.lunchMeal.id)
                .map((meal) => meal.mealType),
            ['breakfast'],
        );
        assert.equal(
            firstResult.selectedMeals.find((meal) => meal.id === replacementMeal.id)?.mealType,
            'lunch',
        );
        assert.equal(firstResult.history.length, 1);
        assert.equal(firstResult.history[0].action, 'swapMeal');
        assert.equal(firstResult.history[0].mealType, 'lunch');
        assert.equal(firstResult.history[0].oldMeal.id, baseline.lunchMeal.id);
        assert.deepEqual(firstResult.history[0].newMeal, {
            ...replacementMeal,
            servings: baseline.lunchMeal.servings,
            mealType: 'lunch',
        });
    } finally {
        usePlannerStore.setState(originalState, true);
    }
});
