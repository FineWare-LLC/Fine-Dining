/**
 * Integration tests for geolocation utility usage in dashboard component
 * Tests the integration between the dashboard and geolocation utility
 */

import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { getRestaurantSearchCoordinates, clearCoordinatesCache } from '../../utils/geolocation.js';
import { setupBrowserMocks, cleanupBrowserMocks, mockPresets } from '../utils/browserMocks.js';

describe('Geolocation Integration Tests', () => {
    let cleanup = null;

    beforeEach(() => {
    // Clear any cached coordinates before each test
        clearCoordinatesCache();
    });

    afterEach(() => {
    // Clean up browser mocks if they were set up
        if (cleanup) {
            cleanup();
            cleanup = null;
        }
    });

    it('should return fallback coordinates when geolocation is not available', async () => {
    // Setup browser mocks without geolocation
        const mockSetup = setupBrowserMocks();
        cleanup = mockSetup.cleanup;

        // Remove geolocation to simulate unsupported browser
        if (global.navigator) {
            delete global.navigator.geolocation;
        }

        const coordinates = await getRestaurantSearchCoordinates();

        assert.strictEqual(coordinates.latitude, 35.968);
        assert.strictEqual(coordinates.longitude, -83.187);
        assert.strictEqual(coordinates.source, 'fallback');
    });

    it('should return geolocation coordinates when available', async () => {
    // Setup browser mocks with successful geolocation
        const mockSetup = setupBrowserMocks({
            geolocation: {
                getCurrentPositionSuccess: true,
                coords: { latitude: 40.7128, longitude: -74.0060 },
            },
        });
        cleanup = mockSetup.cleanup;

        const coordinates = await getRestaurantSearchCoordinates();

        assert.strictEqual(coordinates.latitude, 40.7128);
        assert.strictEqual(coordinates.longitude, -74.0060);
        assert.strictEqual(coordinates.source, 'geolocation');
    });

    it('should cache coordinates and return cached values on subsequent calls', async () => {
    // Setup browser mocks with successful geolocation
        const mockSetup = setupBrowserMocks({
            geolocation: {
                getCurrentPositionSuccess: true,
                coords: { latitude: 40.7128, longitude: -74.0060 },
            },
        });
        cleanup = mockSetup.cleanup;

        // First call should use geolocation
        const coordinates1 = await getRestaurantSearchCoordinates();
        assert.strictEqual(coordinates1.source, 'geolocation');
        assert.strictEqual(coordinates1.latitude, 40.7128);
        assert.strictEqual(coordinates1.longitude, -74.0060);

        // Second call should use cache
        const coordinates2 = await getRestaurantSearchCoordinates();
        assert.strictEqual(coordinates2.latitude, coordinates1.latitude);
        assert.strictEqual(coordinates2.longitude, coordinates1.longitude);
    });

    it('should force refresh coordinates when requested', async () => {
        // Setup browser mocks with successful geolocation
        const mockSetup = setupBrowserMocks({
            geolocation: {
                getCurrentPositionSuccess: true,
                coords: { latitude: 40.7128, longitude: -74.0060 }
            }
        });
        cleanup = mockSetup.cleanup;

        // First call
        const coordinates1 = await getRestaurantSearchCoordinates();
        assert.strictEqual(coordinates1.latitude, 40.7128);
        assert.strictEqual(coordinates1.longitude, -74.0060);

        // Second call with force refresh should bypass cache
        const coordinates2 = await getRestaurantSearchCoordinates(true);
        assert.strictEqual(coordinates2.latitude, 40.7128);
        assert.strictEqual(coordinates2.longitude, -74.0060);
    });

    it('should handle geolocation errors gracefully', async () => {
    // Mock navigator with geolocation error
        global.navigator = {
            geolocation: {
                getCurrentPosition(success, error, options) {
                    setTimeout(() => {
                        error(new Error('Geolocation permission denied'));
                    }, 0);
                },
            },
        };

        const coordinates = await getRestaurantSearchCoordinates();

        // Should fall back to default coordinates
        assert.strictEqual(coordinates.latitude, 35.968);
        assert.strictEqual(coordinates.longitude, -83.187);
        assert.strictEqual(coordinates.source, 'fallback');
    });

    it('should handle sessionStorage errors gracefully', async () => {
    // Mock sessionStorage that throws errors
        global.sessionStorage = {
            getItem() {
                throw new Error('Storage quota exceeded');
            },
            setItem() {
                throw new Error('Storage quota exceeded');
            },
            removeItem() {
                throw new Error('Storage quota exceeded');
            },
        };

        // Mock navigator with successful geolocation
        global.navigator = {
            geolocation: {
                getCurrentPosition(success, error, options) {
                    setTimeout(() => {
                        success({
                            coords: {
                                latitude: 40.7128,
                                longitude: -74.0060,
                            },
                        });
                    }, 0);
                },
            },
        };

        // Should still work despite storage errors
        const coordinates = await getRestaurantSearchCoordinates();
        assert.strictEqual(coordinates.latitude, 40.7128);
        assert.strictEqual(coordinates.longitude, -74.0060);
    });
});
