// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    getActiveMealPlanRouteState,
    resolveMealPlanCalendarState,
} from '../../utils/activeMealPlan.ts';
import {
    getMealCatalogEmptyStateMessage,
    getMealPlanOptimizerEmptyStateMessage,
} from '../../utils/mealPlanningEmptyState.js';

test('meal planning empty-state copy tells users how to continue', () => {
    assert.equal(
        getMealCatalogEmptyStateMessage(),
        'No meals found. Try adjusting your search or filters.',
    );
    assert.equal(
        getMealPlanOptimizerEmptyStateMessage(),
        'No optimized meal plan generated yet. Select meals in the first tab, then use Generate Optimized Meal Plan below.',
    );
});

test('getActiveMealPlanRouteState keeps the empty planner prompt stable when no plan is selected', () => {
    const state = getActiveMealPlanRouteState({});

    assert.equal(state.selection.status, 'empty');
    assert.equal(state.feedback.state, 'empty');
    assert.equal(state.feedback.message, 'Open a meal plan link to continue.');
    assert.equal(state.plannerHref, '/planner');
    assert.equal(state.alertMessage, null);
    assert.equal(state.alertSeverity, null);
    assert.equal(state.hasActiveMealPlanQuery, false);
});

test('resolveMealPlanCalendarState keeps empty schedules nullable-safe', () => {
    assert.deepEqual(resolveMealPlanCalendarState(null), {
        status: 'empty',
        dayGroups: {},
        error: null,
    });

    assert.deepEqual(resolveMealPlanCalendarState([]), {
        status: 'empty',
        dayGroups: {},
        error: null,
    });
});
