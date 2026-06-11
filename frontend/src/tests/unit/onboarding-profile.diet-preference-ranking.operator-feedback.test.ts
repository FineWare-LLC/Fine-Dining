// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDietPreferenceRankingFeedbackState } from '../../context/authUtils';

test('buildDietPreferenceRankingFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildDietPreferenceRankingFeedbackState({ isLoading: true }), {
        state: 'loading',
        message: 'Saving your diet preferences...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildDietPreferenceRankingFeedbackState reports empty, ready, success, and error states accessibly', () => {
    assert.deepEqual(buildDietPreferenceRankingFeedbackState({}), {
        state: 'empty',
        message: 'Choose diet goals to shape recommendation order.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildDietPreferenceRankingFeedbackState({ hasDietGoals: true }), {
        state: 'success',
        message: 'Diet preferences are ready to save.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildDietPreferenceRankingFeedbackState({
        hasDietGoals: true,
        successMessage: 'Diet preferences saved. Redirecting to your dashboard...',
    }), {
        state: 'success',
        message: 'Diet preferences saved. Redirecting to your dashboard...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildDietPreferenceRankingFeedbackState({
        errorMessage: 'Please choose valid diet goals.',
    }), {
        state: 'error',
        message: 'Please choose valid diet goals.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});
