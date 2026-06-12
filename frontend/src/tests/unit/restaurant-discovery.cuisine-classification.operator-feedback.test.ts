// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNearbyRestaurantsFeedbackState } from '../../utils/nearbyRestaurantsFeedback';

test('buildNearbyRestaurantsFeedbackState reports loading, empty, success, and error states accessibly', () => {
    assert.deepEqual(buildNearbyRestaurantsFeedbackState({ isLoading: true }), {
        state: 'loading',
        message: 'Getting your location...',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 56,
        showSpinner: true,
    });

    assert.deepEqual(
        buildNearbyRestaurantsFeedbackState({
            state: 'empty',
            message: 'No restaurants found in this area. Try increasing the search radius or selecting a different location.',
        }),
        {
            state: 'empty',
            message: 'No restaurants found in this area. Try increasing the search radius or selecting a different location.',
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: 'false',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(
        buildNearbyRestaurantsFeedbackState({
            state: 'success',
            message: 'Found 1 restaurant within 1.5 km.',
        }),
        {
            state: 'success',
            message: 'Found 1 restaurant within 1.5 km.',
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: 'false',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(buildNearbyRestaurantsFeedbackState({ state: 'error' }), {
        state: 'error',
        message: 'Could not load nearby restaurants. Please try again.',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
    });
});
