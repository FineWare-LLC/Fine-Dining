import test from 'node:test';
import assert from 'node:assert/strict';
import { getPlanIdFromQuery } from '../../utils/activeMealPlan.js';

test('getPlanIdFromQuery handles mealPlanId param', () => {
  assert.equal(getPlanIdFromQuery({ mealPlanId: 'a' }), 'a');
});

test('getPlanIdFromQuery falls back to planId', () => {
  assert.equal(getPlanIdFromQuery({ planId: 'b' }), 'b');
});

test('getPlanIdFromQuery returns null when not present', () => {
  assert.equal(getPlanIdFromQuery({}), null);
});
