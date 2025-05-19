import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider.js';
import { OverpassProvider } from '../../services/providers/OverpassProvider.js';

// Import the service after setting up environment variables
process.env.GOOGLE_PLACES_API_KEY = 'valid-key';
const { findNearbyRestaurants } = await import('../../services/places.service.js');

function restoreMocks(...mocks) {
  for (const m of mocks) {
    if (typeof m?.mock?.restore === 'function') m.mock.restore();
  }
}

test('findNearbyRestaurants returns Google results with valid key', async () => {
  const isValid = mock.method(GooglePlacesProvider.prototype, 'isValidKey', () => true);
  const googleMock = mock.method(GooglePlacesProvider.prototype, 'findNearby', async () => [{ name: 'G' }]);
  const overpassMock = mock.method(OverpassProvider.prototype, 'findNearby', async () => [{ name: 'O' }]);

  const res = await findNearbyRestaurants(1, 2);

  assert.deepEqual(res, { restaurants: [{ name: 'G' }], source: 'google' });
  assert.equal(googleMock.mock.callCount(), 1);
  assert.equal(overpassMock.mock.callCount(), 0);

  restoreMocks(isValid, googleMock, overpassMock);
});

test('findNearbyRestaurants falls back to Overpass when Google fails', async () => {
  const isValid = mock.method(GooglePlacesProvider.prototype, 'isValidKey', () => true);
  const googleMock = mock.method(GooglePlacesProvider.prototype, 'findNearby', async () => {
    throw new Error('Google fail');
  });
  const overpassMock = mock.method(OverpassProvider.prototype, 'findNearby', async () => [{ name: 'O' }]);

  const res = await findNearbyRestaurants(1, 2);

  assert.deepEqual(res, { restaurants: [{ name: 'O' }], source: 'overpass' });
  assert.equal(googleMock.mock.callCount(), 1);
  assert.equal(overpassMock.mock.callCount(), 1);

  restoreMocks(isValid, googleMock, overpassMock);
});
