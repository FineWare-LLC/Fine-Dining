// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import mongoose from 'mongoose';

import Cookbook from '../../models/Cookbook/cookbookSchema';

const SCALE_BOUNDARY_RESTAURANT_COUNT = 10_000;

const buildObjectId = (index) => new mongoose.Types.ObjectId(index.toString(16).padStart(24, '0'));

const buildSharedCookbookFixture = (restaurantCount) => ({
    user: buildObjectId(1),
    name: 'Household Favorites',
    description: 'Shared cookbook at the scale boundary',
    isPublic: true,
    entries: [],
    meals: [],
    recipes: [],
    restaurants: Array.from({ length: restaurantCount }, (_, index) => buildObjectId(index + 2)),
});

test('cookbook schema fail-shuts on shared cookbook restaurant refs at the scale boundary', async () => {
    const withinLimit = new Cookbook(buildSharedCookbookFixture(SCALE_BOUNDARY_RESTAURANT_COUNT));
    const overLimit = new Cookbook(buildSharedCookbookFixture(SCALE_BOUNDARY_RESTAURANT_COUNT + 1));

    await assert.doesNotReject(withinLimit.validate());
    await assert.rejects(
        overLimit.validate(),
        /FAIL-SHUT: Cookbook size limit exceeded\. Operation aborted\./,
    );
});
