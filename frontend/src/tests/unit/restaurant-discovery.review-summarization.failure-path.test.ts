// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import {
    RestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '../../lib/restaurantDiscoveryError';
import { YelpProvider } from '../../services/providers/YelpProvider';

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('YelpProvider.findNearby rejects malformed review payloads with a user-safe error', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            businesses: null,
        }),
    }));

    try {
        const provider = new YelpProvider('live-yelp-key');

        await assert.rejects(
            () => provider.findNearby(40.7128, -74.006, 2000, 'sushi'),
            (error) => {
                assert.ok(error instanceof RestaurantDiscoveryError);
                assert.equal(error.code, RestaurantDiscoveryErrorCodes.UNAVAILABLE);
                assert.equal(
                    error.message,
                    'Nearby restaurants are temporarily unavailable. Please try again.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(fetchMock.mock.callCount(), 1);
    } finally {
        restoreMocks(fetchMock);
    }
});
