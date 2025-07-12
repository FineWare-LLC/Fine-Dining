/**
 * Browser API Mocks for Node.js Test Environment
 *
 * This module provides comprehensive mocking for browser APIs that are not available
 * in Node.js test environments, including navigator.geolocation, sessionStorage,
 * and localStorage.
 */

/**
 * Creates a mock geolocation API with configurable responses
 */
export function createGeolocationMock(options = {}) {
    const {
        getCurrentPositionSuccess = true,
        coords = { latitude: 37.7749, longitude: -122.4194 },
        error = { code: 1, message: 'Geolocation permission denied' },
        delay = 0,
    } = options;

    const mockGeolocation = {
        getCurrentPosition: (successCallback, errorCallback, options) => {
            setTimeout(() => {
                if (getCurrentPositionSuccess) {
                    successCallback({
                        coords: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy: 10,
                            altitude: null,
                            altitudeAccuracy: null,
                            heading: null,
                            speed: null,
                        },
                        timestamp: Date.now(),
                    });
                } else {
                    errorCallback(error);
                }
            }, delay);
        },
        watchPosition: (successCallback, errorCallback, options) => {
            // Simple implementation that calls getCurrentPosition once
            mockGeolocation.getCurrentPosition(successCallback, errorCallback, options);
            return 1; // Return a mock watch ID
        },
        clearWatch: (watchId) => {
            // Mock implementation - no actual cleanup needed
        },
    };

    return mockGeolocation;
}

/**
 * Creates a mock storage API (sessionStorage/localStorage) compatible with Node.js
 */
export function createStorageMock(options = {}) {
    const {
        throwOnQuotaExceeded = false,
        maxSize = Infinity,
    } = options;

    let storage = {};
    let currentSize = 0;

    const mockStorage = {
        getItem: (key) => {
            if (throwOnQuotaExceeded && key === 'test-quota') {
                throw new Error('Storage quota exceeded');
            }
            return storage[key] || null;
        },
        setItem: (key, value) => {
            if (throwOnQuotaExceeded && key === 'test-quota') {
                throw new Error('Storage quota exceeded');
            }
            const stringValue = String(value);
            const newSize = currentSize + stringValue.length;
            if (newSize > maxSize) {
                throw new Error('Storage quota exceeded');
            }
            storage[key] = stringValue;
            currentSize = newSize;
        },
        removeItem: (key) => {
            if (throwOnQuotaExceeded && key === 'test-quota') {
                throw new Error('Storage quota exceeded');
            }
            if (storage[key]) {
                currentSize -= storage[key].length;
                delete storage[key];
            }
        },
        clear: () => {
            storage = {};
            currentSize = 0;
        },
        get length() {
            return Object.keys(storage).length;
        },
        key: (index) => {
            const keys = Object.keys(storage);
            return keys[index] || null;
        },
    };

    return mockStorage;
}

/**
 * Sets up browser API mocks in the global environment
 */
export function setupBrowserMocks(options = {}) {
    const {
        geolocation = {},
        sessionStorage = {},
        localStorage = {},
    } = options;

    const mocks = {
        geolocation: createGeolocationMock(geolocation),
        sessionStorage: createStorageMock(sessionStorage),
        localStorage: createStorageMock(localStorage),
    };

    // Store original values for cleanup
    const originalValues = {};

    // Mock navigator.geolocation with proper property descriptor handling
    try {
        if (typeof global !== 'undefined') {
            // Handle navigator object creation/modification
            if (!global.navigator) {
                global.navigator = {};
            }

            // Store original value if it exists
            originalValues.geolocation = global.navigator.geolocation;

            // Try to define the property, fall back to direct assignment
            try {
                Object.defineProperty(global.navigator, 'geolocation', {
                    value: mocks.geolocation,
                    writable: true,
                    configurable: true,
                });
            } catch (e) {
                // Fallback for environments where property definition fails
                global.navigator.geolocation = mocks.geolocation;
            }
        }
    } catch (error) {
        console.warn('Failed to mock navigator.geolocation:', error.message);
    }

    // Mock sessionStorage
    try {
        if (typeof global !== 'undefined') {
            originalValues.sessionStorage = global.sessionStorage;
            global.sessionStorage = mocks.sessionStorage;
        }
    } catch (error) {
        console.warn('Failed to mock sessionStorage:', error.message);
    }

    // Mock localStorage
    try {
        if (typeof global !== 'undefined') {
            originalValues.localStorage = global.localStorage;
            global.localStorage = mocks.localStorage;
        }
    } catch (error) {
        console.warn('Failed to mock localStorage:', error.message);
    }

    return {
        mocks,
        originalValues,
        cleanup: () => cleanupBrowserMocks(originalValues),
    };
}

/**
 * Cleans up browser API mocks and restores original values
 */
export function cleanupBrowserMocks(originalValues = {}) {
    try {
        if (typeof global !== 'undefined') {
            // Restore navigator.geolocation
            if (global.navigator) {
                if (originalValues.geolocation !== undefined) {
                    global.navigator.geolocation = originalValues.geolocation;
                } else {
                    delete global.navigator.geolocation;
                }
            }

            // Restore sessionStorage
            if (originalValues.sessionStorage !== undefined) {
                global.sessionStorage = originalValues.sessionStorage;
            } else {
                delete global.sessionStorage;
            }

            // Restore localStorage
            if (originalValues.localStorage !== undefined) {
                global.localStorage = originalValues.localStorage;
            } else {
                delete global.localStorage;
            }
        }
    } catch (error) {
        console.warn('Failed to cleanup browser mocks:', error.message);
    }
}

/**
 * Utility function for test setup with automatic cleanup
 */
export function withBrowserMocks(testFn, mockOptions = {}) {
    return async () => {
        const { cleanup } = setupBrowserMocks(mockOptions);
        try {
            await testFn();
        } finally {
            cleanup();
        }
    };
}

/**
 * Pre-configured mock setups for common test scenarios
 */
export const mockPresets = {
    // Successful geolocation with default San Francisco coordinates
    geolocationSuccess: {
        geolocation: {
            getCurrentPositionSuccess: true,
            coords: { latitude: 37.7749, longitude: -122.4194 },
        },
    },

    // Geolocation permission denied
    geolocationDenied: {
        geolocation: {
            getCurrentPositionSuccess: false,
            error: { code: 1, message: 'Geolocation permission denied' },
        },
    },

    // Storage quota exceeded scenario
    storageQuotaExceeded: {
        sessionStorage: { throwOnQuotaExceeded: true },
        localStorage: { throwOnQuotaExceeded: true },
    },

    // Limited storage capacity
    limitedStorage: {
        sessionStorage: { maxSize: 100 },
        localStorage: { maxSize: 100 },
    },
};