// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import {
    RestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '../../lib/restaurantDiscoveryError';
import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider';
import { OverpassProvider } from '../../services/providers/OverpassProvider';

process.env.GOOGLE_PLACES_API_KEY = '';

const RATE_LIMIT_MESSAGE = 'Nearby restaurants are rate limited right now. Please try again in a few minutes.';

const { findNearbyLocalRestaurants } = await import('../../services/localRestaurantFilter.service');

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('findNearbyLocalRestaurants rethrows provider rate limits instead of masking them as empty results', async () => {
    const isValidKeyMock = mock.method(GooglePlacesProvider.prototype, 'isValidKey', () => false);
    const rateLimitedError = new RestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.RATE_LIMITED,
        RATE_LIMIT_MESSAGE,
    );
    const overpassMock = mock.method(OverpassProvider.prototype, 'findNearby', async () => {
        throw rateLimitedError;
    });

    try {
        await assert.rejects(
            () => findNearbyLocalRestaurants(40.7128, -74.006, 1500, 'sushi'),
            (error) => {
                assert.strictEqual(error, rateLimitedError);
                assert.equal(error.code, RestaurantDiscoveryErrorCodes.RATE_LIMITED);
                assert.equal(error.message, RATE_LIMIT_MESSAGE);
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(isValidKeyMock.mock.callCount(), 1);
        assert.equal(overpassMock.mock.callCount(), 1);
    } finally {
        restoreMocks(isValidKeyMock, overpassMock);
    }
});
