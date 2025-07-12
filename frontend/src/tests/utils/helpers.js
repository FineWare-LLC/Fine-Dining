/**
 * @fileoverview Test helper functions for common testing patterns
 */

import { expect } from '@playwright/test';

/**
 * Waits for an element to be visible with a custom timeout
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<void>}
 */
export async function waitForVisible(locator, timeout = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
}

/**
 * Waits for an element to be hidden with a custom timeout
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<void>}
 */
export async function waitForHidden(locator, timeout = 5000) {
    await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * Fills a form field and waits for it to be updated
 * @param {import('@playwright/test').Locator} field - Form field locator
 * @param {string} value - Value to fill
 * @returns {Promise<void>}
 */
export async function fillAndWait(field, value) {
    await field.fill(value);
    await field.blur(); // Trigger any onChange handlers
    // Wait a short time for any async validation or state updates
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Clicks an element and waits for navigation or loading to complete
 * @param {import('@playwright/test').Locator} element - Element to click
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for click and wait
 * @returns {Promise<void>}
 */
export async function clickAndWait(element, page, options = {}) {
    const { waitForNavigation = false, waitForSelector = null, timeout = 5000 } = options;

    if (waitForNavigation) {
        await Promise.all([
            page.waitForNavigation({ timeout }),
            element.click(),
        ]);
    } else if (waitForSelector) {
        await Promise.all([
            page.waitForSelector(waitForSelector, { timeout }),
            element.click(),
        ]);
    } else {
        await element.click();
        // Default wait for any loading states to complete
        await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {
            // Ignore timeout - some pages may have ongoing network activity
        });
    }
}

/**
 * Waits for a loading spinner to appear and then disappear
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} spinnerSelector - CSS selector for the loading spinner
 * @param {number} timeout - Maximum time to wait (default: 10000)
 * @returns {Promise<void>}
 */
export async function waitForLoadingComplete(page, spinnerSelector = '[data-testid="loading-spinner"]', timeout = 10000) {
    try {
    // Wait for spinner to appear (optional - it might already be there)
        await page.waitForSelector(spinnerSelector, { timeout: 1000 }).catch(() => {});
        // Wait for spinner to disappear
        await page.waitForSelector(spinnerSelector, { state: 'hidden', timeout });
    } catch (error) {
    // If spinner never appears or disappears, continue - this is often acceptable
        console.warn(`Loading spinner not found or didn't disappear: ${error.message}`);
    }
}

/**
 * Scrolls an element into view and ensures it's visible
 * @param {import('@playwright/test').Locator} element - Element to scroll to
 * @returns {Promise<void>}
 */
export async function scrollIntoView(element) {
    await element.scrollIntoViewIfNeeded();
    await waitForVisible(element);
}

/**
 * Takes a screenshot with a descriptive name
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 * @returns {Promise<Buffer>}
 */
export async function takeScreenshot(page, name, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;

    return await page.screenshot({
        path: `test-results/screenshots/${filename}`,
        fullPage: true,
        ...options,
    });
}

/**
 * Waits for a specific number of elements to be present
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {number} count - Expected number of elements
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<void>}
 */
export async function waitForCount(locator, count, timeout = 5000) {
    await locator.first().waitFor({ timeout });
    await expect(locator).toHaveCount(count);
}

/**
 * Retries an action until it succeeds or timeout is reached
 * @param {Function} action - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>} Result of the action
 */
export async function retryAction(action, options = {}) {
    const { maxRetries = 3, delay = 1000, timeout = 10000 } = options;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await action();
        } catch (error) {
            const elapsed = Date.now() - startTime;

            if (attempt === maxRetries || elapsed >= timeout) {
                throw new Error(`Action failed after ${attempt} attempts: ${error.message}`);
            }

            console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Mocks a GraphQL request with specific response data
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} operationName - GraphQL operation name
 * @param {Object} responseData - Mock response data
 * @returns {Promise<void>}
 */
export async function mockGraphQLRequest(page, operationName, responseData) {
    await page.route('**/api/graphql', async route => {
        const request = route.request();
        const postData = request.postData();

        if (postData && postData.includes(operationName)) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(responseData),
            });
        } else {
            await route.continue();
        }
    });
}

/**
 * Sets up authentication for tests
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} user - User object for authentication
 * @returns {Promise<void>}
 */
export async function setupAuth(page, user) {
    // Set authentication token in localStorage
    await page.addInitScript((userData) => {
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
    }, user);
}

/**
 * Clears all authentication data
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function clearAuth(page) {
    await page.evaluate(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.clear();
    });
}

/**
 * Waits for a specific text to appear on the page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - Text to wait for
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<void>}
 */
export async function waitForText(page, text, timeout = 5000) {
    await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * Checks if an element contains specific text
 * @param {import('@playwright/test').Locator} element - Element locator
 * @param {string} expectedText - Expected text content
 * @returns {Promise<boolean>}
 */
export async function hasText(element, expectedText) {
    try {
        const text = await element.textContent();
        return text && text.includes(expectedText);
    } catch {
        return false;
    }
}

// ============================================================================
// Browser API Mocking Utilities for Node.js Unit Tests
// ============================================================================

/**
 * Storage for original browser API implementations to enable restoration
 */
const originalAPIs = {
    navigator: null,
    sessionStorage: null,
    localStorage: null,
};

/**
 * Creates a mock sessionStorage implementation for Node.js testing
 * @param {Object} options - Configuration options
 * @returns {Object} Mock sessionStorage object
 */
export function createMockSessionStorage(options = {}) {
    const { throwOnQuotaExceeded = false, quotaLimit = 5000000 } = options;
    const storage = new Map();
    let currentSize = 0;

    return {
        storage,
        getItem(key) {
            if (throwOnQuotaExceeded) {
                throw new Error('Storage quota exceeded');
            }
            return storage.get(key) || null;
        },
        setItem(key, value) {
            if (throwOnQuotaExceeded) {
                throw new Error('Storage quota exceeded');
            }
            const valueStr = String(value);
            const newSize = currentSize + key.length + valueStr.length;
            if (newSize > quotaLimit) {
                throw new Error('Storage quota exceeded');
            }
            storage.set(key, valueStr);
            currentSize = newSize;
        },
        removeItem(key) {
            if (throwOnQuotaExceeded) {
                throw new Error('Storage quota exceeded');
            }
            if (storage.has(key)) {
                const value = storage.get(key);
                currentSize -= key.length + value.length;
                storage.delete(key);
            }
        },
        clear() {
            storage.clear();
            currentSize = 0;
        },
        get length() {
            return storage.size;
        },
        key(index) {
            const keys = Array.from(storage.keys());
            return keys[index] || null;
        },
    };
}

/**
 * Creates a mock geolocation implementation for testing
 * @param {Object} options - Configuration options
 * @returns {Object} Mock geolocation object
 */
export function createMockGeolocation(options = {}) {
    const {
        shouldSucceed = true,
        position = { coords: { latitude: 40.7128, longitude: -74.0060 } },
        error = new Error('Geolocation permission denied'),
        delay = 0,
    } = options;

    return {
        getCurrentPosition(success, errorCallback, options) {
            setTimeout(() => {
                if (shouldSucceed) {
                    success(position);
                } else {
                    errorCallback(error);
                }
            }, delay);
        },
        watchPosition(success, errorCallback, options) {
            // Simple implementation for testing
            return this.getCurrentPosition(success, errorCallback, options);
        },
        clearWatch(watchId) {
            // No-op for testing
        },
    };
}

/**
 * Safely mocks the navigator object in Node.js environment
 * @param {Object} mockGeolocation - Mock geolocation implementation
 * @returns {Function} Cleanup function to restore original navigator
 */
export function mockNavigator(mockGeolocation = null) {
    // Store original navigator if it exists
    if (typeof global !== 'undefined' && global.navigator) {
        originalAPIs.navigator = global.navigator;
    }

    const mockNavigator = {
        geolocation: mockGeolocation || createMockGeolocation(),
        userAgent: 'Node.js Test Environment',
        platform: 'test',
    };

    // Use Object.defineProperty to handle read-only properties
    if (typeof global !== 'undefined') {
        try {
            Object.defineProperty(global, 'navigator', {
                value: mockNavigator,
                writable: true,
                configurable: true,
            });
        } catch (error) {
            // If defineProperty fails, try direct assignment as fallback
            global.navigator = mockNavigator;
        }
    }

    // Return cleanup function
    return () => {
        if (typeof global !== 'undefined') {
            if (originalAPIs.navigator) {
                try {
                    Object.defineProperty(global, 'navigator', {
                        value: originalAPIs.navigator,
                        writable: true,
                        configurable: true,
                    });
                } catch (error) {
                    global.navigator = originalAPIs.navigator;
                }
            } else {
                delete global.navigator;
            }
        }
    };
}

/**
 * Safely mocks sessionStorage in Node.js environment
 * @param {Object} mockStorage - Mock storage implementation
 * @returns {Function} Cleanup function to restore original sessionStorage
 */
export function mockSessionStorage(mockStorage = null) {
    // Store original sessionStorage if it exists
    if (typeof global !== 'undefined' && global.sessionStorage) {
        originalAPIs.sessionStorage = global.sessionStorage;
    }

    const storage = mockStorage || createMockSessionStorage();

    // Set up mock sessionStorage
    if (typeof global !== 'undefined') {
        try {
            Object.defineProperty(global, 'sessionStorage', {
                value: storage,
                writable: true,
                configurable: true,
            });
        } catch (error) {
            global.sessionStorage = storage;
        }
    }

    // Return cleanup function
    return () => {
        if (typeof global !== 'undefined') {
            if (originalAPIs.sessionStorage) {
                try {
                    Object.defineProperty(global, 'sessionStorage', {
                        value: originalAPIs.sessionStorage,
                        writable: true,
                        configurable: true,
                    });
                } catch (error) {
                    global.sessionStorage = originalAPIs.sessionStorage;
                }
            } else {
                delete global.sessionStorage;
            }
        }
    };
}

/**
 * Sets up comprehensive browser API mocks for Node.js testing
 * @param {Object} options - Configuration options
 * @returns {Function} Cleanup function to restore all original APIs
 */
export function mockBrowserAPIs(options = {}) {
    const {
        geolocation = {},
        sessionStorage: sessionStorageOptions = {},
        localStorage: localStorageOptions = {},
    } = options;

    const cleanupFunctions = [];

    // Mock navigator with geolocation
    const mockGeolocation = createMockGeolocation(geolocation);
    const cleanupNavigator = mockNavigator(mockGeolocation);
    cleanupFunctions.push(cleanupNavigator);

    // Mock sessionStorage
    const mockStorage = createMockSessionStorage(sessionStorageOptions);
    const cleanupSessionStorage = mockSessionStorage(mockStorage);
    cleanupFunctions.push(cleanupSessionStorage);

    // Return combined cleanup function
    return () => {
        cleanupFunctions.forEach(cleanup => {
            try {
                cleanup();
            } catch (error) {
                console.warn('Error during browser API cleanup:', error.message);
            }
        });
    };
}

/**
 * Restores all browser APIs to their original state
 * @returns {void}
 */
export function restoreBrowserAPIs() {
    if (typeof global !== 'undefined') {
    // Restore navigator
        if (originalAPIs.navigator) {
            try {
                Object.defineProperty(global, 'navigator', {
                    value: originalAPIs.navigator,
                    writable: true,
                    configurable: true,
                });
            } catch (error) {
                global.navigator = originalAPIs.navigator;
            }
        } else {
            delete global.navigator;
        }

        // Restore sessionStorage
        if (originalAPIs.sessionStorage) {
            try {
                Object.defineProperty(global, 'sessionStorage', {
                    value: originalAPIs.sessionStorage,
                    writable: true,
                    configurable: true,
                });
            } catch (error) {
                global.sessionStorage = originalAPIs.sessionStorage;
            }
        } else {
            delete global.sessionStorage;
        }

        // Restore localStorage
        if (originalAPIs.localStorage) {
            try {
                Object.defineProperty(global, 'localStorage', {
                    value: originalAPIs.localStorage,
                    writable: true,
                    configurable: true,
                });
            } catch (error) {
                global.localStorage = originalAPIs.localStorage;
            }
        } else {
            delete global.localStorage;
        }
    }
}
