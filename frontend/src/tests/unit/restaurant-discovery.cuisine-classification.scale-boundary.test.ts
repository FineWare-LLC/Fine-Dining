// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeCuisineCategories } from '../../services/places.service';

const LARGE_CUISINE_PAYLOAD_SIZE = 512;

function buildLargeCuisinePayload(order = 'forward') {
    const labels = Array.from({ length: LARGE_CUISINE_PAYLOAD_SIZE }, (_, index) => {
        switch (index % 6) {
            case 0:
                return ' mexican_restaurant ';
            case 1:
                return 'thai / japanese';
            case 2:
                return 'italian; pizza; restaurant';
            case 3:
                return 'cafe';
            case 4:
                return 'sushi-bar';
            default:
                return 'food court';
        }
    });

    return order === 'reverse' ? [...labels].reverse() : labels;
}

test('normalizeCuisineCategories returns a deterministic canonical cuisine set at the scale boundary', () => {
    const forward = normalizeCuisineCategories(buildLargeCuisinePayload('forward'));
    const reversed = normalizeCuisineCategories(buildLargeCuisinePayload('reverse'));

    assert.deepEqual(forward, ['Italian', 'Japanese', 'Mexican', 'Pizza', 'Sushi', 'Thai']);
    assert.deepEqual(reversed, forward);
});
