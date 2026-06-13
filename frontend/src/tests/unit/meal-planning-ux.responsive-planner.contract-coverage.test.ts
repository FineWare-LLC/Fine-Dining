// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    PlannerGenerationValidationError,
    resolvePlannerGenerationRequest,
} from '../../utils/responsivePlanner';

test('resolvePlannerGenerationRequest normalizes a valid responsive planner payload into mutation variables', () => {
    const generationState = resolvePlannerGenerationRequest({
        cookbookId: '  cookbook-42  ',
        startDate: '2026-06-11',
        days: '7',
        title: '  ',
        objective: 'balanced',
    });

    assert.equal(generationState.status, 'resolved');
    assert.deepEqual(generationState.request, {
        cookbookId: 'cookbook-42',
        startDate: '2026-06-11T00:00:00.000Z',
        endDate: '2026-06-18T00:00:00.000Z',
        title: 'Meal Plan (7 days)',
        objective: 'balanced',
    });
    assert.equal(generationState.error, null);
});

test('resolvePlannerGenerationRequest returns an empty state until a cookbook is selected', () => {
    const generationState = resolvePlannerGenerationRequest({
        cookbookId: ' ',
        startDate: '2026-06-11',
        days: 7,
    });

    assert.equal(generationState.status, 'empty');
    assert.equal(generationState.request, null);
    assert.equal(generationState.error, null);
});

test('resolvePlannerGenerationRequest rejects malformed start dates with a typed, user-safe error', () => {
    const generationState = resolvePlannerGenerationRequest({
        cookbookId: 'cookbook-42',
        startDate: 'not-a-date',
        days: 7,
    });

    assert.equal(generationState.status, 'invalid');
    assert.equal(generationState.request, null);
    assert.ok(generationState.error instanceof PlannerGenerationValidationError);
    assert.equal(generationState.error.code, 'invalidStartDate');
    assert.equal(generationState.error.message, 'Choose a valid start date.');
    assert.equal(generationState.error.isUserSafe, true);
});
