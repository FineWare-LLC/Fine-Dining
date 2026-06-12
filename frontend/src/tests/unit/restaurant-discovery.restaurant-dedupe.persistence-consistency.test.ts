// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { RestaurantModel } from '../../models/Restaurant/index';
import { OverpassProvider } from '../../services/providers/OverpassProvider';
import { fetchAndStoreNearbyRestaurants } from '../../services/localRestaurants.service';

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('fetchAndStoreNearbyRestaurants keeps deduped restaurant snapshots stable across refreshes', async () => {
    const overpassMock = mock.method(OverpassProvider.prototype, 'findNearby', async () => ([
        {
            name: 'Atlas Bistro',
            vicinity: '123 Market St',
            rating: 4.6,
            userRatingsTotal: 128,
            open_now: true,
            categories: [' italian '],
            location: {
                latitude: 40.7128,
                longitude: -74.006,
            },
        },
        {
            name: 'Atlas Bistro',
            vicinity: '123 Market St',
            rating: 4.6,
            userRatingsTotal: 128,
            open_now: true,
            categories: [' italian '],
            location: {
                latitude: 40.7128,
                longitude: -74.006,
            },
        },
        {
            name: 'Beacon Cafe',
            vicinity: '9 Harbor Rd',
            rating: 4.2,
            userRatingsTotal: 32,
            open_now: false,
            location: {
                latitude: 40.713,
                longitude: -74.0058,
            },
        },
    ]));
    const insertManyMock = mock.method(RestaurantModel, 'insertMany', async (docs, options) => {
        assert.deepEqual(options, { ordered: true });
        assert.deepEqual(docs, [
            {
                restaurantName: 'Atlas Bistro',
                address: '123 Market St',
                averageRating: 4.6,
                ratingCount: 128,
                open_now: true,
                cuisineType: ['Italian'],
            },
            {
                restaurantName: 'Beacon Cafe',
                address: '9 Harbor Rd',
                averageRating: 4.2,
                ratingCount: 32,
                open_now: false,
            },
        ]);

        return docs.map((doc, index) => (
            new RestaurantModel({
                _id: `restaurant-${index + 1}`,
                ...doc,
            }).toObject({
                depopulate: true,
                versionKey: false,
            })
        ));
    });

    try {
        const result = await fetchAndStoreNearbyRestaurants(40.7128, -74.006);
        const refreshed = result.map((restaurant) => (
            new RestaurantModel(restaurant).toObject({
                depopulate: true,
                versionKey: false,
            })
        ));

        assert.equal(result.length, 2);
        assert.deepEqual(refreshed, result);
        assert.equal(overpassMock.mock.callCount(), 1);
        assert.equal(insertManyMock.mock.callCount(), 1);
    } finally {
        restoreMocks(overpassMock, insertManyMock);
    }
});
