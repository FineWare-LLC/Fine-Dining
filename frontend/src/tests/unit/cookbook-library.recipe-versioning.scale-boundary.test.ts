// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { getCookbook } from '../../graphql/resolvers/queries/cookbookQueries';
import { updateCookbookEntry } from '../../graphql/resolvers/mutations/cookbookMutations';

const LARGE_COOKBOOK_ENTRY_COUNT = 400;
const TARGET_ENTRY_INDEX = LARGE_COOKBOOK_ENTRY_COUNT - 1;
const NOISY_MEAL_TYPES = Array.from(
    { length: 120 },
    (_, index) => ['SIDE', 'DINNER', 'SIDE', 'SNACK', 'DINNER', 'BREAKFAST', 'LUNCH', 'DESSERT'][index % 8],
);
const CANONICAL_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE'];

const buildCookbookEntry = (index) => {
    const entryNumber = String(index + 1).padStart(4, '0');

    return {
        _id: `entry-${entryNumber}`,
        recipe: `recipe-${entryNumber}`,
        desiredServings: (index % 4) + 1,
        maxTimesPerWeek: index % 3,
        minTimesPerWeek: index % 2,
        allowedMealTypes: index % 2 === 0 ? ['DINNER'] : ['LUNCH'],
        preferenceScore: (index % 10) + 1,
        notes: `Revision note ${entryNumber}`,
    };
};

const buildLargeCookbookFixture = () => {
    const originalEntries = Array.from(
        { length: LARGE_COOKBOOK_ENTRY_COUNT },
        (_, index) => buildCookbookEntry(index),
    );

    const entries = originalEntries.map((entry) => ({
        ...entry,
        allowedMealTypes: [...entry.allowedMealTypes],
    }));

    entries.id = (entryId) => entries.find((entry) => entry._id === entryId) ?? null;

    const cookbook = {
        user: {
            toString: () => 'user-42',
        },
        entries,
        saveCalls: 0,
        populateCalls: [],
    };

    cookbook.save = async () => {
        cookbook.saveCalls += 1;
        return cookbook;
    };

    cookbook.populate = async (paths) => {
        cookbook.populateCalls.push(paths);
        return {
            id: 'cookbook-42',
            name: 'Large revision cookbook',
            description: 'Large fixture for recipe versioning',
            isPublic: false,
            entries: entries.map((entry, index) => ({
                id: entry._id,
                desiredServings: entry.desiredServings,
                maxTimesPerWeek: entry.maxTimesPerWeek,
                minTimesPerWeek: entry.minTimesPerWeek,
                allowedMealTypes: [...entry.allowedMealTypes],
                preferenceScore: entry.preferenceScore,
                notes: entry.notes,
                recipe: {
                    id: entry.recipe,
                    recipeName: `Recipe ${String(index + 1).padStart(4, '0')}`,
                },
            })),
            meals: [],
            recipes: [],
            restaurants: [],
        };
    };

    return { cookbook, originalEntries };
};

test('updateCookbookEntry keeps a large revision snapshot deterministic at the scale boundary', async () => {
    const { cookbook, originalEntries } = buildLargeCookbookFixture();
    const targetEntryId = cookbook.entries[TARGET_ENTRY_INDEX]._id;
    const originalNoisyMealTypes = [...NOISY_MEAL_TYPES];
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        const updatedCookbook = await updateCookbookEntry(
            null,
            {
                cookbookId: 'cookbook-42',
                entryId: targetEntryId,
                entry: {
                    desiredServings: 4,
                    maxTimesPerWeek: 5,
                    minTimesPerWeek: 1,
                    allowedMealTypes: NOISY_MEAL_TYPES,
                    preferenceScore: 9,
                    notes: '  Canonical revision note  ',
                },
            },
            { user: { userId: 'user-42' } },
        );

        const refreshedCookbook = await getCookbook(null, { id: 'cookbook-42' });

        assert.deepEqual(NOISY_MEAL_TYPES, originalNoisyMealTypes);
        assert.equal(findByIdMock.mock.callCount(), 2);
        assert.equal(cookbook.saveCalls, 1);
        assert.deepEqual(cookbook.populateCalls, [
            'entries.recipe meals recipes restaurants',
            'entries.recipe meals recipes restaurants',
        ]);
        assert.equal(updatedCookbook.entries.length, LARGE_COOKBOOK_ENTRY_COUNT);
        assert.deepEqual(updatedCookbook, refreshedCookbook);
        assert.deepEqual(updatedCookbook.entries[TARGET_ENTRY_INDEX], {
            id: targetEntryId,
            desiredServings: 4,
            maxTimesPerWeek: 5,
            minTimesPerWeek: 1,
            allowedMealTypes: CANONICAL_MEAL_TYPES,
            preferenceScore: 9,
            notes: 'Canonical revision note',
            recipe: {
                id: `recipe-${String(TARGET_ENTRY_INDEX + 1).padStart(4, '0')}`,
                recipeName: `Recipe ${String(TARGET_ENTRY_INDEX + 1).padStart(4, '0')}`,
            },
        });
        assert.deepEqual(
            cookbook.entries
                .filter((_, index) => index !== TARGET_ENTRY_INDEX)
                .map((entry) => ({
                    ...entry,
                    allowedMealTypes: [...entry.allowedMealTypes],
                })),
            originalEntries
                .filter((_, index) => index !== TARGET_ENTRY_INDEX)
                .map((entry) => ({
                    ...entry,
                    allowedMealTypes: [...entry.allowedMealTypes],
                })),
        );
    } finally {
        findByIdMock.mock.restore();
    }
});
