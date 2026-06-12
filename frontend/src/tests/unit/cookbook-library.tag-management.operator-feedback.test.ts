// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    RECIPE_SEARCH_RESOLVED_MESSAGE,
    buildRecipeSearchFeedbackContainerStyles,
    buildRecipeSearchFeedbackState,
} from '../../utils/recipeSearchFeedback';

const recipesPagePath = fileURLToPath(new URL('../../pages/recipes.tsx', import.meta.url));
const recipesPageSource = fs.readFileSync(recipesPagePath, 'utf8');

const canonicalRecipes = [
    {
        id: 'recipe-42',
        recipeName: 'Weeknight Pasta',
    },
];

test('buildRecipeSearchFeedbackState exposes loading, empty, success, and error states with stable spacing', () => {
    assert.equal(RECIPE_SEARCH_RESOLVED_MESSAGE, 'Recipes loaded.');

    assert.deepEqual(buildRecipeSearchFeedbackState({ isLoading: true }), {
        state: 'loading',
        title: null,
        message: 'Loading recipes...',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 72,
        showSpinner: true,
        error: null,
    });

    assert.deepEqual(buildRecipeSearchFeedbackState({ recipes: [] }), {
        state: 'empty',
        title: 'No recipes found',
        message: 'Try adjusting your filters.',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(buildRecipeSearchFeedbackState({ recipes: canonicalRecipes }), {
        state: 'resolved',
        title: null,
        message: null,
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    const errorState = buildRecipeSearchFeedbackState({
        error: new Error('Network error'),
    });

    assert.equal(errorState.state, 'error');
    assert.equal(errorState.title, 'Recipe search unavailable');
    assert.equal(
        errorState.message,
        'We could not read your recipes right now. Please refresh the page.',
    );
    assert.equal(errorState.actionLabel, 'Try again');
    assert.equal(errorState.actionKind, 'retry-search');
    assert.equal(errorState.role, 'alert');
    assert.equal(errorState.ariaLive, 'assertive');
    assert.equal(errorState.ariaBusy, 'false');
    assert.equal(errorState.minHeight, 72);
    assert.equal(errorState.showSpinner, false);
    assert.ok(errorState.error instanceof Error);

    assert.deepEqual(buildRecipeSearchFeedbackContainerStyles('resolved'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });
});

test('recipes page announces resolved recipe search results without shifting layout shells', () => {
    assert.match(recipesPageSource, /recipeSearchFeedback\.state === 'resolved'/);
    assert.match(recipesPageSource, /sx=\{srOnly\}/);
    assert.match(recipesPageSource, /RECIPE_SEARCH_RESOLVED_MESSAGE/);
    assert.match(recipesPageSource, /recipeSearchFeedback\.state === 'error'/);
    assert.match(recipesPageSource, /refetch\(\)\.catch\(\(\) => \{\}\)/);
});
