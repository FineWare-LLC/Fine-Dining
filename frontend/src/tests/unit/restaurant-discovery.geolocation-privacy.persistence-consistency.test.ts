// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    clearCoordinatesCache,
    getRestaurantSearchCoordinates,
} from '../../utils/geolocation';
import { setupBrowserMocks } from '../utils/browserMocks';

test('getRestaurantSearchCoordinates normalizes persisted coordinate snapshots across refreshes', async () => {
    const { cleanup } = setupBrowserMocks({
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 40.7128, longitude: -74.006 },
        },
    });

    try {
        clearCoordinatesCache();

        let geolocationCalls = 0;
        global.navigator.geolocation.getCurrentPosition = () => {
            geolocationCalls += 1;
            throw new Error('geolocation should not be called when the persisted snapshot is valid');
        };

        global.sessionStorage.setItem(
            'fine-dining-coordinates',
            JSON.stringify({
                latitude: '40.7128',
                longitude: '-74.006',
                source: 'geolocation',
            }),
        );
        global.sessionStorage.setItem('fine-dining-coordinates-time', String(Date.now()));

        const coordinates = await getRestaurantSearchCoordinates();

        assert.equal(typeof coordinates.latitude, 'number');
        assert.equal(typeof coordinates.longitude, 'number');
        assert.equal(coordinates.latitude, 40.7128);
        assert.equal(coordinates.longitude, -74.006);
        assert.equal(coordinates.source, 'geolocation');
        assert.equal(geolocationCalls, 0);
        assert.equal(
            global.sessionStorage.getItem('fine-dining-coordinates'),
            JSON.stringify({
                latitude: 40.7128,
                longitude: -74.006,
                source: 'geolocation',
            }),
        );
    } finally {
        cleanup();
    }
});
