// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider';

process.env.GOOGLE_PLACES_API_KEY = 'valid-key';

const { findNearbyRestaurants } = await import('../../services/places.service');

const LARGE_RESTAURANT_COUNT = 128;

function buildOverpassElements(order = 'asc') {
    const indexes = Array.from({ length: LARGE_RESTAURANT_COUNT }, (_, index) => index);

    if (order === 'desc') {
        indexes.reverse();
    }

    return indexes.map((index) => {
        const suffix = String(index + 1).padStart(4, '0');

        return {
            type: 'node',
            id: index + 1,
            lat: 40.7 + index * 0.0001,
            lon: -74.0 - index * 0.0001,
            tags: {
                name: `Cafe ${suffix}`,
                'addr:street': `Block ${suffix}`,
            },
        };
    });
}

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('findNearbyRestaurants keeps a large Overpass fallback deterministic when provider order flips at the scale boundary', async () => {
    const isValidKeyMock = mock.method(GooglePlacesProvider.prototype, 'isValidKey', () => true);
    const googleMock = mock.method(GooglePlacesProvider.prototype, 'findNearby', async () => {
        throw new Error('Google outage');
    });

    const payloads = [
        buildOverpassElements('asc'),
        buildOverpassElements('desc'),
    ];
    let overpassCall = 0;

    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        json: async () => ({
            elements: payloads[overpassCall++],
        }),
    }));

    try {
        const first = await findNearbyRestaurants(40.7128, -74.006, 1500, 'sushi');
        const second = await findNearbyRestaurants(40.7128, -74.006, 1500, 'sushi');

        assert.equal(first.source, 'overpass');
        assert.equal(first.status, 'success');
        assert.equal(first.restaurants.length, LARGE_RESTAURANT_COUNT);
        assert.equal(second.source, 'overpass');
        assert.equal(second.status, 'success');
        assert.deepEqual(first.restaurants, second.restaurants);
        assert.equal(fetchMock.mock.callCount(), 2);
        assert.equal(googleMock.mock.callCount(), 2);
        assert.equal(isValidKeyMock.mock.callCount(), 2);
    } finally {
        restoreMocks(isValidKeyMock, googleMock, fetchMock);
    }
});
