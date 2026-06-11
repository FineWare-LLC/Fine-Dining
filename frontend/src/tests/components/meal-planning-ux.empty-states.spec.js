// @ts-check
import assert from 'node:assert/strict';
import { test } from '@playwright/experimental-ct-react';
import {
    getMealCatalogEmptyStateMessage,
    getMealPlanOptimizerEmptyStateMessage,
} from '../../utils/mealPlanningEmptyState.js';

test.describe('Meal planning empty states', () => {
    test('copy exposes the next action in the browser suite', () => {
        assert.equal(
            getMealCatalogEmptyStateMessage(),
            'No meals found. Try adjusting your search or filters.',
        );
        assert.equal(
            getMealPlanOptimizerEmptyStateMessage(),
            'No optimized meal plan generated yet. Select meals in the first tab, then use Generate Optimized Meal Plan below.',
        );
    });
});
