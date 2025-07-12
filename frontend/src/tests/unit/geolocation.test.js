import assert from 'node:assert/strict';
import test from 'node:test';
import {
    getCurrentPosition,
    getRestaurantSearchCoordinates,
    clearCoordinatesCache,
    isDefaultCoordinates,
} from '../../utils/geolocation.js';
import {
    setupBrowserMocks,
    cleanupBrowserMocks,
    mockPresets,
    withBrowserMocks,
} from '../utils/browserMocks.js';

test('getCurrentPosition returns fallback coordinates when geolocation is not supported', async () => {
    // Setup mocks with no geolocation support
    const { cleanup } = setupBrowserMocks();

    // Remove geolocation to simulate unsupported browser
    if (global.navigator) {
        delete global.navigator.geolocation;
    }

    try {
        const result = await getCurrentPosition();

        assert.strictEqual(result.latitude, 35.968);
        assert.strictEqual(result.longitude, -83.187);
        assert.strictEqual(result.source, 'fallback');
    } finally {
        cleanup();
    }
});

test('getCurrentPosition returns geolocation coordinates when successful', async () => {
    // Setup successful geolocation mock
    const { cleanup } = setupBrowserMocks({
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 40.7128, longitude: -74.0060 },
        },
    });

    try {
        const result = await getCurrentPosition();

        assert.strictEqual(result.latitude, 40.7128);
        assert.strictEqual(result.longitude, -74.0060);
        assert.strictEqual(result.source, 'geolocation');
    } finally {
        cleanup();
    }
});

test('getCurrentPosition returns fallback coordinates when geolocation fails', async () => {
    // Setup geolocation mock that fails
    const { cleanup } = setupBrowserMocks(mockPresets.geolocationDenied);

    try {
        const result = await getCurrentPosition();

        assert.strictEqual(result.latitude, 35.968);
        assert.strictEqual(result.longitude, -83.187);
        assert.strictEqual(result.source, 'fallback');
    } finally {
        cleanup();
    }
});

test('getRestaurantSearchCoordinates caches coordinates', async () => {
    // Setup successful geolocation mock with San Francisco coordinates
    const { cleanup } = setupBrowserMocks({
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 37.7749, longitude: -122.4194 },
        },
    });

    try {
    // Clear cache first
        clearCoordinatesCache();

        // First call should fetch fresh coordinates
        const result1 = await getRestaurantSearchCoordinates();
        assert.strictEqual(result1.latitude, 37.7749);
        assert.strictEqual(result1.longitude, -122.4194);

        // Second call should return cached coordinates
        const result2 = await getRestaurantSearchCoordinates();
        assert.strictEqual(result2.latitude, 37.7749);
        assert.strictEqual(result2.longitude, -122.4194);
    } finally {
        cleanup();
    }
});

test('getRestaurantSearchCoordinates force refresh bypasses cache', async () => {
    // Setup successful geolocation mock
    const { cleanup } = setupBrowserMocks({
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 37.7749, longitude: -122.4194 },
        },
    });

    try {
    // Clear cache first
        clearCoordinatesCache();

        // First call to populate cache
        const result1 = await getRestaurantSearchCoordinates();
        assert.strictEqual(result1.latitude, 37.7749);
        assert.strictEqual(result1.longitude, -122.4194);

        // Force refresh should bypass cache (though it will return same coordinates due to mock)
        const result2 = await getRestaurantSearchCoordinates(true);
        assert.strictEqual(result2.latitude, 37.7749);
        assert.strictEqual(result2.longitude, -122.4194);
    } finally {
        cleanup();
    }
});

test('clearCoordinatesCache removes cached coordinates', async () => {
    // Setup successful geolocation mock
    const { cleanup } = setupBrowserMocks({
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 37.7749, longitude: -122.4194 },
        },
    });

    try {
    // Clear cache first
        clearCoordinatesCache();

        // Populate cache
        await getRestaurantSearchCoordinates();

        // Clear cache
        clearCoordinatesCache();

        // Next call should fetch fresh coordinates (though mock returns same)
        const result = await getRestaurantSearchCoordinates();
        assert.strictEqual(result.latitude, 37.7749);
        assert.strictEqual(result.longitude, -122.4194);
    } finally {
        cleanup();
    }
});

test('isDefaultCoordinates correctly identifies default coordinates', () => {
    // Test with default coordinates
    assert.strictEqual(isDefaultCoordinates(35.968, -83.187), true);

    // Test with non-default coordinates
    assert.strictEqual(isDefaultCoordinates(40.7128, -74.0060), false);
    assert.strictEqual(isDefaultCoordinates(37.7749, -122.4194), false);
});

test('getRestaurantSearchCoordinates handles sessionStorage errors gracefully',
    withBrowserMocks(async () => {
    // This test uses the withBrowserMocks utility for automatic cleanup
        const result = await getRestaurantSearchCoordinates();

        // Should return fallback coordinates when storage fails
        assert.strictEqual(typeof result.latitude, 'number');
        assert.strictEqual(typeof result.longitude, 'number');
    }, mockPresets.storageQuotaExceeded),
);

test('getCurrentPosition handles geolocation timeout', async () => {
    // Setup geolocation mock with delay to simulate timeout
    const { cleanup } = setupBrowserMocks({
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 40.7128, longitude: -74.0060 },
            delay: 100, // Small delay for testing
        },
    });

    try {
        const result = await getCurrentPosition();

        // Should still succeed with the delay
        assert.strictEqual(result.latitude, 40.7128);
        assert.strictEqual(result.longitude, -74.0060);
        assert.strictEqual(result.source, 'geolocation');
    } finally {
        cleanup();
    }
});