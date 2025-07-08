import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getCurrentPosition, 
  getRestaurantSearchCoordinates, 
  clearCoordinatesCache, 
  isDefaultCoordinates 
} from '../../utils/geolocation.js';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: null,
};

// Mock sessionStorage
const mockSessionStorage = {
  storage: new Map(),
  getItem(key) {
    return this.storage.get(key) || null;
  },
  setItem(key, value) {
    this.storage.set(key, value);
  },
  removeItem(key) {
    this.storage.delete(key);
  },
  clear() {
    this.storage.clear();
  }
};

// Setup global mocks
global.navigator = { geolocation: mockGeolocation };
global.sessionStorage = mockSessionStorage;

test('getCurrentPosition returns fallback coordinates when geolocation is not supported', async () => {
  // Disable geolocation
  global.navigator.geolocation = null;
  
  const result = await getCurrentPosition();
  
  assert.strictEqual(result.latitude, 35.968);
  assert.strictEqual(result.longitude, -83.187);
  assert.strictEqual(result.source, 'fallback');
});

test('getCurrentPosition returns geolocation coordinates when successful', async () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  };
  
  mockGeolocation.getCurrentPosition = (success) => {
    setTimeout(() => success(mockPosition), 0);
  };
  global.navigator.geolocation = mockGeolocation;
  
  const result = await getCurrentPosition();
  
  assert.strictEqual(result.latitude, 40.7128);
  assert.strictEqual(result.longitude, -74.0060);
  assert.strictEqual(result.source, 'geolocation');
});

test('getCurrentPosition returns fallback coordinates when geolocation fails', async () => {
  const mockError = new Error('Permission denied');
  
  mockGeolocation.getCurrentPosition = (success, error) => {
    setTimeout(() => error(mockError), 0);
  };
  global.navigator.geolocation = mockGeolocation;
  
  const result = await getCurrentPosition();
  
  assert.strictEqual(result.latitude, 35.968);
  assert.strictEqual(result.longitude, -83.187);
  assert.strictEqual(result.source, 'fallback');
});

test('getRestaurantSearchCoordinates caches coordinates', async () => {
  const mockPosition = {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194
    }
  };
  
  mockGeolocation.getCurrentPosition = (success) => {
    setTimeout(() => success(mockPosition), 0);
  };
  global.navigator.geolocation = mockGeolocation;
  
  // Clear cache first
  clearCoordinatesCache();
  
  // First call should fetch fresh coordinates
  const result1 = await getRestaurantSearchCoordinates();
  assert.strictEqual(result1.latitude, 37.7749);
  assert.strictEqual(result1.longitude, -122.4194);
  
  // Mock geolocation to return different coordinates
  const mockPosition2 = {
    coords: {
      latitude: 34.0522,
      longitude: -118.2437
    }
  };
  
  mockGeolocation.getCurrentPosition = (success) => {
    setTimeout(() => success(mockPosition2), 0);
  };
  
  // Second call should return cached coordinates (not the new mock coordinates)
  const result2 = await getRestaurantSearchCoordinates();
  assert.strictEqual(result2.latitude, 37.7749); // Should be cached value
  assert.strictEqual(result2.longitude, -122.4194); // Should be cached value
});

test('getRestaurantSearchCoordinates force refresh bypasses cache', async () => {
  const mockPosition1 = {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194
    }
  };
  
  const mockPosition2 = {
    coords: {
      latitude: 34.0522,
      longitude: -118.2437
    }
  };
  
  // First call
  mockGeolocation.getCurrentPosition = (success) => {
    setTimeout(() => success(mockPosition1), 0);
  };
  global.navigator.geolocation = mockGeolocation;
  
  const result1 = await getRestaurantSearchCoordinates();
  assert.strictEqual(result1.latitude, 37.7749);
  
  // Second call with force refresh
  mockGeolocation.getCurrentPosition = (success) => {
    setTimeout(() => success(mockPosition2), 0);
  };
  
  const result2 = await getRestaurantSearchCoordinates(true);
  assert.strictEqual(result2.latitude, 34.0522); // Should be new value
  assert.strictEqual(result2.longitude, -118.2437); // Should be new value
});

test('clearCoordinatesCache removes cached data', async () => {
  // Set some cached data
  mockSessionStorage.setItem('fine-dining-coordinates', JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060,
    source: 'geolocation'
  }));
  mockSessionStorage.setItem('fine-dining-coordinates-time', Date.now().toString());
  
  // Verify cache exists
  assert.ok(mockSessionStorage.getItem('fine-dining-coordinates'));
  assert.ok(mockSessionStorage.getItem('fine-dining-coordinates-time'));
  
  // Clear cache
  clearCoordinatesCache();
  
  // Verify cache is cleared
  assert.strictEqual(mockSessionStorage.getItem('fine-dining-coordinates'), null);
  assert.strictEqual(mockSessionStorage.getItem('fine-dining-coordinates-time'), null);
});

test('isDefaultCoordinates correctly identifies default coordinates', () => {
  const defaultCoords = { latitude: 35.968, longitude: -83.187 };
  const customCoords = { latitude: 40.7128, longitude: -74.0060 };
  
  assert.strictEqual(isDefaultCoordinates(defaultCoords), true);
  assert.strictEqual(isDefaultCoordinates(customCoords), false);
});

test('getCurrentPosition respects timeout option', async () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  };
  
  let capturedOptions = null;
  mockGeolocation.getCurrentPosition = (success, error, options) => {
    capturedOptions = options;
    setTimeout(() => success(mockPosition), 0);
  };
  global.navigator.geolocation = mockGeolocation;
  
  await getCurrentPosition({ timeout: 5000 });
  
  assert.strictEqual(capturedOptions.timeout, 5000);
});

test('getRestaurantSearchCoordinates handles sessionStorage errors gracefully', async () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  };
  
  mockGeolocation.getCurrentPosition = (success) => {
    setTimeout(() => success(mockPosition), 0);
  };
  global.navigator.geolocation = mockGeolocation;
  
  // Mock sessionStorage to throw errors
  const originalSetItem = mockSessionStorage.setItem;
  mockSessionStorage.setItem = () => {
    throw new Error('Storage quota exceeded');
  };
  
  // Should still work despite storage errors
  const result = await getRestaurantSearchCoordinates();
  assert.strictEqual(result.latitude, 40.7128);
  assert.strictEqual(result.longitude, -74.0060);
  
  // Restore original setItem
  mockSessionStorage.setItem = originalSetItem;
});