// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

process.env.GOOGLE_PLACES_API_KEY = '';

const { normalizeCuisineCategories } = await import('../../services/places.service');
const { YelpProvider } = await import('../../services/providers/YelpProvider');

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('YelpProvider.findNearby normalizes cuisine labels and omits malformed category payloads', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            businesses: [
                {
                    id: 'yelp-1',
                    name: 'Tuscan Table',
                    coordinates: {
                        latitude: 40.7128,
                        longitude: -74.006,
                    },
                    distance: 123.4,
                    rating: 4.8,
                    review_count: 91,
                    price: '$$',
                    is_closed: false,
                    url: 'https://example.com/tuscan-table',
                    location: {
                        address1: '1 Olive St',
                        city: 'New York',
                    },
                    categories: [
                        { title: ' Italian ' },
                        { title: 'Pizza' },
                        { title: 'restaurant' },
                    ],
                },
                {
                    id: 'yelp-2',
                    name: 'Fallback Bistro',
                    coordinates: {
                        latitude: 40.7135,
                        longitude: -74.0055,
                    },
                    distance: 77.8,
                    rating: 4.1,
                    review_count: 12,
                    price: '$',
                    is_closed: true,
                    url: 'https://example.com/fallback-bistro',
                    location: {
                        address1: '9 Example Ave',
                        city: 'New York',
                    },
                    categories: [{}, null, { title: '' }],
                },
            ],
        }),
    }));

    try {
        const provider = new YelpProvider('live-yelp-key');
        const restaurants = await provider.findNearby(40.7128, -74.006, 2000, 'pizza');

        assert.deepEqual(restaurants, [
            {
                id: 'yelp-1',
                name: 'Tuscan Table',
                lat: 40.7128,
                lon: -74.006,
                distance_m: 123,
                rating: 4.8,
                price: '$$',
                open_now: true,
                provider: 'yelp',
                url: 'https://example.com/tuscan-table',
                address: '1 Olive St, New York',
                categories: normalizeCuisineCategories([' Italian ', 'Pizza', 'restaurant']),
                placeId: 'yelp-1',
                vicinity: '1 Olive St, New York',
                userRatingsTotal: 91,
                location: {
                    latitude: 40.7128,
                    longitude: -74.006,
                },
            },
            {
                id: 'yelp-2',
                name: 'Fallback Bistro',
                lat: 40.7135,
                lon: -74.0055,
                distance_m: 78,
                rating: 4.1,
                price: '$',
                open_now: undefined,
                provider: 'yelp',
                url: 'https://example.com/fallback-bistro',
                address: '9 Example Ave, New York',
                placeId: 'yelp-2',
                vicinity: '9 Example Ave, New York',
                userRatingsTotal: 12,
                location: {
                    latitude: 40.7135,
                    longitude: -74.0055,
                },
            },
        ]);
        assert.equal('categories' in restaurants[1], false);
        assert.equal(fetchMock.mock.callCount(), 1);
    } finally {
        restoreMocks(fetchMock);
    }
});
