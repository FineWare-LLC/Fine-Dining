// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdPlanApprovalFeedbackContainerStyles,
    buildHouseholdPlanApprovalFeedbackState,
} from '../../utils/householdPlanApprovalFeedback';

test('buildHouseholdPlanApprovalFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdPlanApprovalFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking household plan approval...',
    }), {
        state: 'loading',
        message: 'Checking household plan approval...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdPlanApprovalFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdPlanApprovalFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to review plan approval.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdPlanApprovalFeedbackState({
        household: {
            planApproval: {
                status: 'draft',
            },
        },
    }), {
        state: 'empty',
        message: 'Your household plan is waiting for approval.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdPlanApprovalFeedbackState({
        household: {
            planApproval: {
                status: 'approved',
                approvedAt: '2026-06-13T18:40:00.000Z',
            },
        },
    }), {
        state: 'success',
        message: 'Your household plan is approved and ready to use.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdPlanApprovalFeedbackState({
        household: {
            planApproval: {
                status: 'approved',
            },
        },
    }), {
        state: 'error',
        message: 'Approved household plans must include an approval timestamp.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdPlanApprovalFeedbackContainerStyles keeps plan approval feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdPlanApprovalFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdPlanApprovalFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdPlanApprovalFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdPlanApprovalFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
