// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLocalRestaurantResult } from '../../services/localRestaurantFilter.service';

test('buildLocalRestaurantResult clamps a negative maxResults to zero for a large fixture', () => {
    const upstreamRestaurants = Array.from({ length: 1000 }, (_, index) => {
        const label = String(index).padStart(4, '0');
        return {
            name: `Cafe ${label}`,
            vicinity: `Block ${label}`,
            rating: 4.5,
        };
    });

    const result = buildLocalRestaurantResult(
        {
            restaurants: upstreamRestaurants,
            source: 'overpass',
            status: 'success',
        },
        {
            minLocalScore: 0,
            excludeChains: true,
            maxResults: -10,
        },
    );

    assert.equal(result.status, 'empty');
    assert.equal(result.filteredCount, 1000);
    assert.equal(result.localCount, 0);
    assert.deepEqual(result.restaurants, []);
    assert.deepEqual(result.filterCriteria, {
        minLocalScore: 0,
        excludeChains: true,
        maxResults: 0,
    });
});
