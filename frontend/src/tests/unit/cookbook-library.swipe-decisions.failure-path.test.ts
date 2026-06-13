// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    applyRecipeSwiperDecision,
    buildRecipeSwiperFailureMessage,
    rollbackRecipeSwiperDecision,
} from '../../utils/recipeSwiperState';

test('applyRecipeSwiperDecision and rollbackRecipeSwiperDecision restore the swipe window after a failed mutation', () => {
    const initialState = {
        currentIndex: 1,
        swipedRecipeIds: new Set(['recipe-1']),
    };

    const optimisticState = applyRecipeSwiperDecision(initialState, 'recipe-2');
    assert.equal(optimisticState.currentIndex, 2);
    assert.deepEqual([...optimisticState.swipedRecipeIds], ['recipe-1', 'recipe-2']);

    const restoredState = rollbackRecipeSwiperDecision(optimisticState, 'recipe-2');
    assert.equal(restoredState.currentIndex, 1);
    assert.deepEqual([...restoredState.swipedRecipeIds], ['recipe-1']);
});

test('buildRecipeSwiperFailureMessage keeps user-safe errors visible and masks internal failures', () => {
    assert.equal(
        buildRecipeSwiperFailureMessage({
            isUserSafe: true,
            message: 'We could not save that swipe. Please try again.',
        }),
        'We could not save that swipe. Please try again.',
    );

    assert.equal(
        buildRecipeSwiperFailureMessage(new Error('database unavailable')),
        'We could not save that swipe. Please try again.',
    );
});
