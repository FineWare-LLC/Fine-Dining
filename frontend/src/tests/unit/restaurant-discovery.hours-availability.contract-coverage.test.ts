// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import {
    RestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '../../lib/restaurantDiscoveryError';
import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider';
import { YelpProvider } from '../../services/providers/YelpProvider';

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('GooglePlacesProvider.findNearby preserves opening hours for open and closed restaurants', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            results: [
                {
                    place_id: 'google-open',
                    name: 'Sunrise Kitchen',
                    vicinity: '1 Bright St',
                    opening_hours: {
                        open_now: true,
                    },
                    geometry: {
                        location: {
                            lat: 40.7,
                            lng: -74.0,
                        },
                    },
                },
                {
                    place_id: 'google-closed',
                    name: 'Moonlight Diner',
                    formatted_address: '9 Night Ave',
                    opening_hours: {
                        open_now: false,
                    },
                    geometry: {
                        location: {
                            lat: 40.71,
                            lng: -74.01,
                        },
                    },
                },
            ],
        }),
    }));

    try {
        const provider = new GooglePlacesProvider('live-google-key');
        const restaurants = await provider.findNearby(40.7128, -74.006);

        assert.deepEqual(restaurants, [
            {
                placeId: 'google-open',
                name: 'Sunrise Kitchen',
                vicinity: '1 Bright St',
                rating: undefined,
                userRatingsTotal: undefined,
                location: {
                    latitude: 40.7,
                    longitude: -74.0,
                },
                open_now: true,
            },
            {
                placeId: 'google-closed',
                name: 'Moonlight Diner',
                vicinity: '9 Night Ave',
                rating: undefined,
                userRatingsTotal: undefined,
                location: {
                    latitude: 40.71,
                    longitude: -74.01,
                },
                open_now: false,
            },
        ]);
    } finally {
        restoreMocks(fetchMock);
    }
});

test('GooglePlacesProvider.findNearby rejects malformed payloads with a typed user-safe error', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            results: null,
        }),
    }));

    try {
        const provider = new GooglePlacesProvider('live-google-key');

        await assert.rejects(
            () => provider.findNearby(40.7128, -74.006),
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
    } finally {
        restoreMocks(fetchMock);
    }
});

test('YelpProvider.findNearby preserves closed status as an explicit boolean', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            businesses: [
                {
                    id: 'yelp-open',
                    name: 'Harbor Cafe',
                    coordinates: {
                        latitude: 40.72,
                        longitude: -74.02,
                    },
                    distance: 45.5,
                    rating: 4.7,
                    review_count: 19,
                    price: '$$',
                    is_closed: false,
                    url: 'https://example.com/harbor-cafe',
                    location: {
                        address1: '12 Harbor Rd',
                        city: 'New York',
                    },
                },
                {
                    id: 'yelp-closed',
                    name: 'Harbor Cafe After Hours',
                    coordinates: {
                        latitude: 40.73,
                        longitude: -74.03,
                    },
                    distance: 90.1,
                    rating: 4.1,
                    review_count: 8,
                    price: '$$',
                    is_closed: true,
                    url: 'https://example.com/harbor-cafe-after-hours',
                    location: {
                        address1: '14 Harbor Rd',
                        city: 'New York',
                    },
                },
            ],
        }),
    }));

    try {
        const provider = new YelpProvider('live-yelp-key');
        const restaurants = await provider.findNearby(40.7128, -74.006);

        assert.equal(restaurants[0].open_now, true);
        assert.equal(restaurants[1].open_now, false);
    } finally {
        restoreMocks(fetchMock);
    }
});
