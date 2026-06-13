// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    RECIPE_SWIPER_RESOLVED_MESSAGE,
    RecipeSwiperFeedbackValidationError,
    buildRecipeSwiperFeedbackState,
} from '../../utils/recipeSwiperFeedback';

const recipeSwiperPath = fileURLToPath(new URL('../../components/legacy/RecipeSwiper/RecipeSwiper.tsx', import.meta.url));
const recipeSwiperSource = fs.readFileSync(recipeSwiperPath, 'utf8');

test('buildRecipeSwiperFeedbackState reports loading, empty, success, and error states accessibly', () => {
    assert.deepEqual(buildRecipeSwiperFeedbackState({
        isLoading: true,
        availableRecipeCount: 4,
        visibleRecipeCount: 3,
    }), {
        state: 'loading',
        title: null,
        message: 'Finding delicious recipes for you...',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 384,
        showSpinner: true,
        error: null,
    });

    assert.deepEqual(buildRecipeSwiperFeedbackState({
        availableRecipeCount: 0,
        visibleRecipeCount: 0,
    }), {
        state: 'empty',
        title: 'No more recipes to explore!',
        message: "You've seen all available recipes matching your preferences.",
        actionLabel: 'Start Over',
        actionKind: 'reset-swiper',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 384,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(buildRecipeSwiperFeedbackState({
        availableRecipeCount: 4,
        visibleRecipeCount: 3,
    }), {
        state: 'resolved',
        title: null,
        message: null,
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 384,
        showSpinner: false,
        error: null,
    });

    const errorState = buildRecipeSwiperFeedbackState({
        error: new Error('Network error'),
        availableRecipeCount: 4,
        visibleRecipeCount: 3,
    });

    assert.equal(errorState.state, 'error');
    assert.equal(errorState.title, 'Recipe swiper unavailable');
    assert.equal(errorState.message, 'We could not load recipes. Please try again.');
    assert.equal(errorState.actionLabel, 'Try Again');
    assert.equal(errorState.actionKind, 'retry-swiper');
    assert.equal(errorState.role, 'alert');
    assert.equal(errorState.ariaLive, 'assertive');
    assert.equal(errorState.ariaBusy, 'false');
    assert.equal(errorState.minHeight, 384);
    assert.equal(errorState.showSpinner, false);
    assert.ok(errorState.error instanceof Error);
});

test('buildRecipeSwiperFeedbackState fails shut on malformed recipe counts', () => {
    const state = buildRecipeSwiperFeedbackState({
        availableRecipeCount: -1,
        visibleRecipeCount: 3,
    });

    assert.equal(state.state, 'error');
    assert.ok(state.error instanceof RecipeSwiperFeedbackValidationError);
    assert.equal(state.error.code, 'invalidPayload');
    assert.equal(
        state.error.message,
        'We could not read this recipe swipe state. Please refresh the recipes page.',
    );
    assert.equal(state.error.isUserSafe, true);
});

test('RecipeSwiper keeps swipe feedback shells accessible and layout-stable', () => {
    assert.match(recipeSwiperSource, /buildRecipeSwiperFeedbackState\(/);
    assert.match(recipeSwiperSource, /role=\{recipeSwiperFeedback\.role\}/);
    assert.match(recipeSwiperSource, /aria-live=\{recipeSwiperFeedback\.ariaLive\}/);
    assert.match(recipeSwiperSource, /aria-busy=\{recipeSwiperFeedback\.ariaBusy\}/);
    assert.match(recipeSwiperSource, /RECIPE_SWIPER_RESOLVED_MESSAGE/);
    assert.match(recipeSwiperSource, /style=\{srOnly\}/);
    assert.match(recipeSwiperSource, /h-96/);
});
