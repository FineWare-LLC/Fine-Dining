// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildQADashboardFeedbackContainerStyles,
    buildQADashboardFeedbackState,
} from '../../components/legacy/QA/QADashboard.tsx';

test('buildQADashboardFeedbackState exposes loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildQADashboardFeedbackState({ isLoading: true }), {
        state: 'loading',
        message: 'Loading question categories...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildQADashboardFeedbackState reports the empty QA dashboard with stable layout spacing', () => {
    assert.deepEqual(buildQADashboardFeedbackState({ categoryCount: 0 }), {
        state: 'empty',
        message: 'No question categories are available yet.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildQADashboardFeedbackState reports a successful QA dashboard handoff', () => {
    assert.deepEqual(buildQADashboardFeedbackState({ categoryCount: 3 }), {
        state: 'success',
        message: 'Showing 3 question categories.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildQADashboardFeedbackState reports category fetch failures as alerts', () => {
    assert.deepEqual(
        buildQADashboardFeedbackState({
            errorMessage: 'Could not load question categories. Please try again.',
        }),
        {
            state: 'error',
            message: 'Could not load question categories. Please try again.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildQADashboardFeedbackContainerStyles keeps QA dashboard feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildQADashboardFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildQADashboardFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildQADashboardFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildQADashboardFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
