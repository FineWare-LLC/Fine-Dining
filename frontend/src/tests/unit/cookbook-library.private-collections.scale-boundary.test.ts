// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import mongoose from 'mongoose';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { buildCookbookSharingDisplayState } from '../../utils/cookbookSharing';

const LARGE_PRIVATE_ENTRY_COUNT = 400;

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildObjectIdString = (index) => (
    new mongoose.Types.ObjectId(index.toString(16).padStart(24, '0')).toString()
);

const buildLargePrivateCookbookFixture = () => {
    const entries = Array.from({ length: LARGE_PRIVATE_ENTRY_COUNT }, (_, index) => {
        const entryNumber = String(index + 1).padStart(4, '0');

        return {
            recipe: buildObjectIdString(index + 10),
            desiredServings: (index % 4) + 1,
            maxTimesPerWeek: index % 3,
            minTimesPerWeek: index % 2,
            allowedMealTypes: index % 2 === 0 ? ['DINNER'] : ['LUNCH'],
            preferenceScore: (index % 10) + 1,
            notes: `Private note ${entryNumber}`,
        };
    });

    const cookbook = new Cookbook({
        user: buildObjectIdString(1),
        name: 'Large private cookbook',
        description: 'Large fixture for private collections at the scale boundary',
        entries,
        meals: [],
        recipes: [],
        restaurants: [],
    });

    return { cookbook, entries };
};

test('cookbook schema keeps a large private cookbook private and deterministic at the scale boundary', async () => {
    const { cookbook, entries } = buildLargePrivateCookbookFixture();
    const originalEntries = clone(entries);
    const snapshot = cookbook.toObject({ depopulate: true, versionKey: false });

    assert.equal(cookbook.isPublic, false);
    await assert.doesNotReject(cookbook.validate());
    assert.deepEqual(entries, originalEntries);
    assert.deepEqual(buildCookbookSharingDisplayState(snapshot), {
        isPublic: false,
        label: 'Private',
        ariaLabel: 'Private cookbook',
        color: 'default',
        variant: 'outlined',
    });
});
