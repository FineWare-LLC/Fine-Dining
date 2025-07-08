/**
 * Integration tests for geolocation utility usage in dashboard component
 * Tests the integration between the dashboard and geolocation utility
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { getRestaurantSearchCoordinates, clearCoordinatesCache } from '../../utils/geolocation.js';

describe('Geolocation Integration Tests', () => {
  beforeEach(() => {
    // Clear any cached coordinates before each test
    clearCoordinatesCache();
    
    // Mock sessionStorage for testing
    global.sessionStorage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
      removeItem(key) {
        delete this.data[key];
      }
    };
  });

  afterEach(() => {
    // Clean up after each test
    clearCoordinatesCache();
    delete global.sessionStorage;
    delete global.navigator;
  });

  it('should return fallback coordinates when geolocation is not available', async () => {
    // Mock navigator without geolocation
    global.navigator = {};

    const coordinates = await getRestaurantSearchCoordinates();

    assert.strictEqual(coordinates.latitude, 35.968);
    assert.strictEqual(coordinates.longitude, -83.187);
    assert.strictEqual(coordinates.source, 'fallback');
  });

  it('should return geolocation coordinates when available', async () => {
    // Mock navigator with successful geolocation
    global.navigator = {
      geolocation: {
        getCurrentPosition(success, error, options) {
          // Simulate successful geolocation
          setTimeout(() => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060
              }
            });
          }, 0);
        }
      }
    };

    const coordinates = await getRestaurantSearchCoordinates();

    assert.strictEqual(coordinates.latitude, 40.7128);
    assert.strictEqual(coordinates.longitude, -74.0060);
    assert.strictEqual(coordinates.source, 'geolocation');
  });

  it('should cache coordinates and return cached values on subsequent calls', async () => {
    // Mock navigator with successful geolocation
    let callCount = 0;
    global.navigator = {
      geolocation: {
        getCurrentPosition(success, error, options) {
          callCount++;
          setTimeout(() => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060
              }
            });
          }, 0);
        }
      }
    };

    // First call should use geolocation
    const coordinates1 = await getRestaurantSearchCoordinates();
    assert.strictEqual(callCount, 1);
    assert.strictEqual(coordinates1.source, 'geolocation');

    // Second call should use cache
    const coordinates2 = await getRestaurantSearchCoordinates();
    assert.strictEqual(callCount, 1); // Should not increment
    assert.strictEqual(coordinates2.latitude, coordinates1.latitude);
    assert.strictEqual(coordinates2.longitude, coordinates1.longitude);
  });

  it('should force refresh coordinates when requested', async () => {
    // Mock navigator with successful geolocation
    let callCount = 0;
    global.navigator = {
      geolocation: {
        getCurrentPosition(success, error, options) {
          callCount++;
          setTimeout(() => {
            success({
              coords: {
                latitude: 40.7128 + callCount, // Slightly different each time
                longitude: -74.0060
              }
            });
          }, 0);
        }
      }
    };

    // First call
    const coordinates1 = await getRestaurantSearchCoordinates();
    assert.strictEqual(callCount, 1);

    // Second call with force refresh
    const coordinates2 = await getRestaurantSearchCoordinates(true);
    assert.strictEqual(callCount, 2); // Should increment
    assert.notStrictEqual(coordinates2.latitude, coordinates1.latitude);
  });

  it('should handle geolocation errors gracefully', async () => {
    // Mock navigator with geolocation error
    global.navigator = {
      geolocation: {
        getCurrentPosition(success, error, options) {
          setTimeout(() => {
            error(new Error('Geolocation permission denied'));
          }, 0);
        }
      }
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
      }
    };

    // Mock navigator with successful geolocation
    global.navigator = {
      geolocation: {
        getCurrentPosition(success, error, options) {
          setTimeout(() => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060
              }
            });
          }, 0);
        }
      }
    };

    // Should still work despite storage errors
    const coordinates = await getRestaurantSearchCoordinates();
    assert.strictEqual(coordinates.latitude, 40.7128);
    assert.strictEqual(coordinates.longitude, -74.0060);
  });
});