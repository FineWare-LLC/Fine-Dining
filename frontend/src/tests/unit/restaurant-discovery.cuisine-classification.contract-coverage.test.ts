// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import {
    CuisineClassificationError,
    CuisineClassificationErrorCodes,
    normalizeCuisineCategories,
} from '../../services/places.service';
import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider';
import { OverpassProvider } from '../../services/providers/OverpassProvider';

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('normalizeCuisineCategories accepts provider payloads and returns canonical labels', () => {
    assert.deepEqual(
        normalizeCuisineCategories([
            ' italian ',
            'mexican_restaurant',
            'Mexican',
            'sushi-bar',
            'food',
            'thai / japanese',
        ]),
        ['Italian', 'Japanese', 'Mexican', 'Sushi', 'Thai'],
    );

    assert.deepEqual(
        normalizeCuisineCategories('italian; pizza; restaurant'),
        ['Italian', 'Pizza'],
    );
});

test('normalizeCuisineCategories rejects malformed payloads with a typed user-safe error', () => {
    assert.throws(
        () => normalizeCuisineCategories(['italian', 12]),
        (error) => {
            assert.ok(error instanceof CuisineClassificationError);
            assert.equal(error.code, CuisineClassificationErrorCodes.INVALID_PAYLOAD);
            assert.equal(
                error.message,
                'Please provide cuisine labels as strings or string arrays.',
            );
            assert.equal(error.isUserSafe, true);
            return true;
        },
    );
});

test('GooglePlacesProvider maps provider types into normalized cuisine labels', async () => {
    const provider = new GooglePlacesProvider('valid-key');
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            results: [
                {
                    place_id: 'google-1',
                    name: 'Casa Azul',
                    vicinity: '123 Main St',
                    types: ['mexican_restaurant', 'restaurant', 'food'],
                    geometry: {
                        location: {
                            lat: 40.7,
                            lng: -74.0,
                        },
                    },
                },
            ],
        }),
    }));

    try {
        const result = await provider.findNearby(40.7, -74.0);

        assert.deepEqual(result[0].categories, ['Mexican']);
        assert.equal(result[0].name, 'Casa Azul');
    } finally {
        restoreMocks(fetchMock);
    }
});

test('OverpassProvider maps cuisine tags into normalized cuisine labels', async () => {
    const provider = new OverpassProvider();
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            elements: [
                {
                    type: 'node',
                    id: 42,
                    lat: 40.7,
                    lon: -74.0,
                    tags: {
                        name: "Tony's Trattoria",
                        cuisine: ' italian ; pizza ; restaurant ',
                    },
                },
            ],
        }),
    }));

    try {
        const result = await provider.findNearby(40.7, -74.0);

        assert.deepEqual(result[0].categories, ['Italian', 'Pizza']);
        assert.equal(result[0].name, "Tony's Trattoria");
    } finally {
        restoreMocks(fetchMock);
    }
});
