// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLocalRestaurantResult } from '../../services/localRestaurantFilter.service';

test('buildLocalRestaurantResult returns an empty status when filtering removes every restaurant', () => {
    const upstream = {
        restaurants: [
            { name: "McDonald's", vicinity: '123 Chain Ave' },
            { name: 'Burger King', vicinity: '456 Chain Ave' },
        ],
        source: 'overpass',
        status: 'success',
    };

    const result = buildLocalRestaurantResult(upstream, {
        excludeChains: true,
        minLocalScore: 30,
        maxResults: 20,
    });

    assert.deepEqual(result, {
        restaurants: [],
        source: 'overpass',
        status: 'empty',
        filteredCount: 2,
        localCount: 0,
        filterCriteria: {
            minLocalScore: 30,
            excludeChains: true,
            maxResults: 20,
        },
    });
});

test('buildLocalRestaurantResult keeps success when a local restaurant survives filtering', () => {
    const upstream = {
        restaurants: [
            { name: "Alice's Cafe", vicinity: '1 Main St' },
            { name: 'Burger King', vicinity: '456 Chain Ave' },
        ],
        source: 'overpass',
        status: 'success',
    };

    const result = buildLocalRestaurantResult(upstream, {
        excludeChains: true,
        minLocalScore: 30,
        maxResults: 20,
    });

    assert.equal(result.status, 'success');
    assert.equal(result.source, 'overpass');
    assert.equal(result.filteredCount, 2);
    assert.equal(result.localCount, 1);
    assert.equal(result.restaurants[0].name, "Alice's Cafe");
    assert.equal(result.restaurants[0].isChain, false);
});

test('buildLocalRestaurantResult preserves upstream error status', () => {
    const upstream = {
        restaurants: [],
        source: null,
        status: 'error',
    };

    const result = buildLocalRestaurantResult(upstream, {
        excludeChains: true,
        minLocalScore: 30,
        maxResults: 20,
    });

    assert.deepEqual(result, {
        restaurants: [],
        source: null,
        status: 'error',
        filteredCount: 0,
        localCount: 0,
        filterCriteria: {
            minLocalScore: 30,
            excludeChains: true,
            maxResults: 20,
        },
    });
});
