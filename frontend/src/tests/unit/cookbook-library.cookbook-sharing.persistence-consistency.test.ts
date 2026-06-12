// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCookbookSharingDisplayState } from '../../utils/cookbookSharing';

const clone = (value) => JSON.parse(JSON.stringify(value));

test('buildCookbookSharingDisplayState keeps shared cookbook status canonical across refresh snapshots', () => {
    const persistedCookbook = {
        id: 'cookbook-42',
        name: 'Household Favorites',
        isPublic: true,
    };

    const expected = {
        isPublic: true,
        label: 'Shared',
        ariaLabel: 'Shared cookbook',
        color: 'success',
        variant: 'filled',
    };

    assert.deepEqual(buildCookbookSharingDisplayState(persistedCookbook), expected);
    assert.deepEqual(buildCookbookSharingDisplayState(clone(persistedCookbook)), expected);
});

test('buildCookbookSharingDisplayState keeps private cookbook status canonical across refresh snapshots', () => {
    const persistedCookbook = {
        id: 'cookbook-42',
        name: 'Household Favorites',
        isPublic: false,
    };

    const expected = {
        isPublic: false,
        label: 'Private',
        ariaLabel: 'Private cookbook',
        color: 'default',
        variant: 'outlined',
    };

    assert.deepEqual(buildCookbookSharingDisplayState(persistedCookbook), expected);
    assert.deepEqual(buildCookbookSharingDisplayState(clone(persistedCookbook)), expected);
});
