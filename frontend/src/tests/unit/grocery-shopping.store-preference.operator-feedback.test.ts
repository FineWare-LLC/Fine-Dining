// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    StorePreferenceValidationError,
} from '../../utils/storePreference';
import {
    buildStorePreferenceFeedbackContainerStyles,
    buildStorePreferenceFeedbackState,
    resolveStorePreferenceState,
} from '../../utils/storePreferenceFeedback';

const mealsWithStorePreference = [
    {
        id: 'meal-1',
        mealName: 'Herb Chicken Bowl',
        restaurant: {
            defaultPriceMarket: '  Whole   Foods  ',
        },
    },
    {
        id: 'meal-2',
        mealName: 'Roasted Veggie Bowl',
        priceMarket: 'Whole Foods',
    },
    {
        id: 'meal-3',
        mealName: 'Crunchy Wrap',
        recipe: {
            purchaseOptions: [
                {
                    retailer: "  Trader   Joe's  ",
                },
            ],
        },
    },
];

test('resolveStorePreferenceState keeps preferred stores canonical across meal, restaurant, and recipe data', () => {
    assert.deepEqual(resolveStorePreferenceState(mealsWithStorePreference), {
        status: 'resolved',
        preferredStore: 'Whole Foods',
        matchedMealCount: 2,
        labeledMealCount: 3,
        missingMealCount: 0,
        totalMealCount: 3,
        error: null,
    });
});

test('buildStorePreferenceFeedbackState reports loading, empty, success, and error states accessibly', () => {
    assert.deepEqual(buildStorePreferenceFeedbackState({ isLoading: true }), {
        state: 'loading',
        title: null,
        message: 'Resolving store preference...',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 56,
        showSpinner: true,
        error: null,
    });

    assert.deepEqual(buildStorePreferenceFeedbackState({
        storePreferenceState: resolveStorePreferenceState([]),
    }), {
        state: 'empty',
        title: 'No store preference yet.',
        message: 'Add meals with store labels to guide links and prices.',
        actionLabel: 'Open planner',
        actionKind: 'open-planner',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(buildStorePreferenceFeedbackState({
        storePreferenceState: resolveStorePreferenceState(mealsWithStorePreference),
    }), {
        state: 'success',
        title: 'Store preference ready.',
        message: 'Preferred store is Whole Foods. 2 of 3 meals already match it. 1 meal still uses a different store.',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: null,
    });

    const invalidState = resolveStorePreferenceState([
        {
            id: 'meal-4',
            mealName: 'Broken Bowl',
            priceMarket: ['Whole Foods'],
        },
    ]);

    assert.ok(invalidState.error instanceof StorePreferenceValidationError);
    assert.deepEqual(buildStorePreferenceFeedbackState({
        storePreferenceState: invalidState,
    }), {
        state: 'error',
        title: 'Store preference unavailable.',
        message: 'We could not read your store preference. Please refresh the planner.',
        actionLabel: 'Refresh planner',
        actionKind: 'refresh-planner',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: invalidState.error,
    });
});

test('buildStorePreferenceFeedbackContainerStyles keeps store preference feedback visually stable without layout shift', () => {
    assert.deepEqual(buildStorePreferenceFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildStorePreferenceFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildStorePreferenceFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildStorePreferenceFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
