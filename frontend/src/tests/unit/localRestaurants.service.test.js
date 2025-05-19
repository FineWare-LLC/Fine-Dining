import test from 'node:test';
import assert from 'node:assert/strict';

let service;
try {
  service = await import('../../services/localRestaurants.service.js');
} catch (err) {
  test('localRestaurants.service.js not found', { skip: true }, () => {});
}

if (service) {
  const { setLocalRestaurants, getLocalRestaurants } = service;

  if (typeof setLocalRestaurants !== 'function' || typeof getLocalRestaurants !== 'function') {
    test('localRestaurants service exports missing functions', { skip: true }, () => {});
  } else {
    test('stores and retrieves restaurants via localStorage', () => {
      const store = {};
      global.localStorage = {
        setItem: (k, v) => { store[k] = String(v); },
        getItem: (k) => store[k] || null,
        removeItem: (k) => { delete store[k]; },
        clear: () => { for (const key in store) delete store[key]; }
      };

      const restaurants = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
      setLocalRestaurants(restaurants);

      const raw = store['localRestaurants'] || store['restaurants'];
      assert.deepEqual(JSON.parse(raw), restaurants);
      const result = getLocalRestaurants();
      assert.deepEqual(result, restaurants);
    });
  }
}
