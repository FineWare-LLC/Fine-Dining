// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { RestaurantModel } from '../../models/Restaurant/index';
import {
    RestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '../../lib/restaurantDiscoveryError';
import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider';
import { OverpassProvider } from '../../services/providers/OverpassProvider';

process.env.GOOGLE_PLACES_API_KEY = 'valid-key';

const RATE_LIMIT_MESSAGE = 'Nearby restaurants are rate limited right now. Please try again in a few minutes.';

const { findNearbyRestaurants } = await import('../../services/places.service');
const { fetchAndStoreNearbyRestaurants } = await import('../../services/localRestaurants.service');

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('GooglePlacesProvider.findNearby rejects HTTP 429 with a rate-limit error', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({}),
    }));

    try {
        const provider = new GooglePlacesProvider('live-google-key');

        await assert.rejects(
            () => provider.findNearby(40.7128, -74.006),
            (error) => {
                assert.ok(error instanceof RestaurantDiscoveryError);
                assert.equal(error.code, RestaurantDiscoveryErrorCodes.RATE_LIMITED);
                assert.equal(error.message, RATE_LIMIT_MESSAGE);
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(fetchMock.mock.callCount(), 1);
    } finally {
        restoreMocks(fetchMock);
    }
});

test('OverpassProvider.findNearby rejects HTTP 429 with a rate-limit error', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({}),
    }));

    try {
        const provider = new OverpassProvider();

        await assert.rejects(
            () => provider.findNearby(40.7128, -74.006),
            (error) => {
                assert.ok(error instanceof RestaurantDiscoveryError);
                assert.equal(error.code, RestaurantDiscoveryErrorCodes.RATE_LIMITED);
                assert.equal(error.message, RATE_LIMIT_MESSAGE);
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(fetchMock.mock.callCount(), 1);
    } finally {
        restoreMocks(fetchMock);
    }
});

test('findNearbyRestaurants stops after a Google rate limit without calling Overpass', async () => {
    const isValidKeyMock = mock.method(GooglePlacesProvider.prototype, 'isValidKey', () => true);
    const rateLimitedError = new RestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.RATE_LIMITED,
        RATE_LIMIT_MESSAGE,
    );
    const googleMock = mock.method(GooglePlacesProvider.prototype, 'findNearby', async () => {
        throw rateLimitedError;
    });
    const overpassMock = mock.method(OverpassProvider.prototype, 'findNearby', async () => [
        {
            name: 'Fallback Bistro',
            vicinity: '1 Backup St',
        },
    ]);

    try {
        await assert.rejects(
            () => findNearbyRestaurants(40.7128, -74.006, 1500, 'sushi'),
            (error) => {
                assert.strictEqual(error, rateLimitedError);
                assert.equal(error.code, RestaurantDiscoveryErrorCodes.RATE_LIMITED);
                assert.equal(error.message, RATE_LIMIT_MESSAGE);
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(isValidKeyMock.mock.callCount(), 1);
        assert.equal(googleMock.mock.callCount(), 1);
        assert.equal(overpassMock.mock.callCount(), 0);
    } finally {
        restoreMocks(isValidKeyMock, googleMock, overpassMock);
    }
});

test('fetchAndStoreNearbyRestaurants preserves Overpass rate-limit errors before persistence', async () => {
    const rateLimitedError = new RestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.RATE_LIMITED,
        RATE_LIMIT_MESSAGE,
    );
    const overpassMock = mock.method(OverpassProvider.prototype, 'findNearby', async () => {
        throw rateLimitedError;
    });
    const insertManyMock = mock.method(RestaurantModel, 'insertMany', async () => []);

    try {
        await assert.rejects(
            () => fetchAndStoreNearbyRestaurants(40.7128, -74.006),
            (error) => {
                assert.strictEqual(error, rateLimitedError);
                assert.equal(error.code, RestaurantDiscoveryErrorCodes.RATE_LIMITED);
                assert.equal(error.message, RATE_LIMIT_MESSAGE);
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(overpassMock.mock.callCount(), 1);
        assert.equal(insertManyMock.mock.callCount(), 0);
    } finally {
        restoreMocks(overpassMock, insertManyMock);
    }
});
