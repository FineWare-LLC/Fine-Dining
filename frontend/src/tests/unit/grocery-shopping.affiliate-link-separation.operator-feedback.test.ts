// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    AffiliateLinkSeparationValidationError,
    buildAffiliateLinkSeparationFeedbackContainerStyles,
    buildAffiliateLinkSeparationFeedbackState,
    resolveAffiliateLinkSeparationState,
} from '../../utils/affiliateLinkSeparationFeedback.ts';

const cleanMeals = [
    {
        id: 'meal-1',
        mealName: 'Herb Chicken Bowl',
        recipe: {
            recipeName: 'Herb Chicken Bowl',
            instructions: 'Mix the herbs. Bake until cooked through.',
            ingredients: [
                {
                    name: 'Chicken',
                    canonicalName: 'chicken',
                    category: 'Protein',
                    purchaseOptions: [
                        {
                            retailer: 'Instacart',
                            productName: 'Chicken Breast',
                            url: 'https://retailer.example/chicken-breast',
                            affiliateUrl: '',
                            affiliateProvider: '',
                            linkType: 'SEARCH',
                            monetizationStatus: 'PENDING_PARTNER',
                        },
                    ],
                },
            ],
        },
    },
    {
        id: 'meal-2',
        mealName: 'Roasted Veggie Bowl',
        recipe: {
            recipeName: 'Roasted Veggie Bowl',
            instructions: 'Roast the vegetables and serve warm.',
            ingredients: [],
        },
    },
];

const leakingMeals = [
    {
        id: 'meal-3',
        mealName: 'Leaky Bowl',
        recipe: {
            recipeName: 'Leaky Bowl',
            instructions: 'Serve with a side of https://merchant.example/buy for garnish.',
            ingredients: [],
        },
    },
];

test('resolveAffiliateLinkSeparationState keeps shopping links isolated from recipe text and counts linked purchase options', () => {
    assert.deepEqual(resolveAffiliateLinkSeparationState(cleanMeals), {
        status: 'resolved',
        selectedMealCount: 2,
        linkedPurchaseOptionCount: 1,
        error: null,
    });
});

test('buildAffiliateLinkSeparationFeedbackState reports loading, empty, success, and error states accessibly', () => {
    assert.deepEqual(buildAffiliateLinkSeparationFeedbackState({ isLoading: true }), {
        state: 'loading',
        title: null,
        message: 'Checking shopping links...',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 56,
        showSpinner: true,
        error: null,
    });

    assert.deepEqual(buildAffiliateLinkSeparationFeedbackState({
        affiliateLinkSeparationState: resolveAffiliateLinkSeparationState([]),
    }), {
        state: 'empty',
        title: 'No meals selected yet.',
        message: 'Add meals to confirm shopping links stay in purchaseOptions.',
        actionLabel: 'Open planner',
        actionKind: 'open-planner',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(buildAffiliateLinkSeparationFeedbackState({
        affiliateLinkSeparationState: resolveAffiliateLinkSeparationState(cleanMeals),
    }), {
        state: 'success',
        title: 'Shopping links separated.',
        message: 'Shopping links stay in purchaseOptions for 2 selected meals. 1 purchase option remains linked to ingredient metadata.',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: null,
    });

    const invalidState = resolveAffiliateLinkSeparationState(leakingMeals);

    assert.ok(invalidState.error instanceof AffiliateLinkSeparationValidationError);
    assert.deepEqual(buildAffiliateLinkSeparationFeedbackState({
        affiliateLinkSeparationState: invalidState,
    }), {
        state: 'error',
        title: 'Shopping links need cleanup.',
        message: 'We found merchant links in recipe text. Please keep shopping links in purchaseOptions.',
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

test('buildAffiliateLinkSeparationFeedbackContainerStyles keeps affiliate-link feedback visually stable without layout shift', () => {
    assert.deepEqual(buildAffiliateLinkSeparationFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildAffiliateLinkSeparationFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildAffiliateLinkSeparationFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildAffiliateLinkSeparationFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
