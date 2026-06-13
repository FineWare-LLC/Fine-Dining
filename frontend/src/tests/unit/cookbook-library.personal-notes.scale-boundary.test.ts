// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { getCookbook } from '../../graphql/resolvers/queries/cookbookQueries';
import { updateCookbookEntry } from '../../graphql/resolvers/mutations/cookbookMutations';

const LARGE_COOKBOOK_ENTRY_COUNT = 400;
const TARGET_ENTRY_INDEX = LARGE_COOKBOOK_ENTRY_COUNT - 1;
const UPDATED_NOTES = 'Canonical scale note';

const buildCookbookEntryData = (index) => {
    const entryNumber = String(index + 1).padStart(4, '0');

    return {
        entryId: `entry-${entryNumber}`,
        recipeId: `recipe-${entryNumber}`,
        desiredServings: (index % 4) + 1,
        maxTimesPerWeek: index % 3,
        minTimesPerWeek: index % 2,
        allowedMealTypes: index % 2 === 0 ? ['DINNER'] : ['LUNCH'],
        preferenceScore: (index % 10) + 1,
        notes: `Original note ${entryNumber}`,
    };
};

const buildLargeCookbookFixture = () => {
    const notesReads = new Map();
    const entryData = Array.from({ length: LARGE_COOKBOOK_ENTRY_COUNT }, (_, index) => buildCookbookEntryData(index));
    const materializedEntries = entryData.map((data, index) => ({
        id: data.entryId,
        desiredServings: data.desiredServings,
        maxTimesPerWeek: data.maxTimesPerWeek,
        minTimesPerWeek: data.minTimesPerWeek,
        allowedMealTypes: [...data.allowedMealTypes],
        preferenceScore: data.preferenceScore,
        notes: data.notes,
        recipe: {
            id: data.recipeId,
            recipeName: `Recipe ${String(index + 1).padStart(4, '0')}`,
        },
    }));

    const entries = entryData.map((data) => {
        const entry = {
            _id: data.entryId,
            recipe: {
                toString: () => data.recipeId,
            },
            desiredServings: data.desiredServings,
            maxTimesPerWeek: data.maxTimesPerWeek,
            minTimesPerWeek: data.minTimesPerWeek,
            allowedMealTypes: [...data.allowedMealTypes],
            preferenceScore: data.preferenceScore,
        };
        let liveNotes = data.notes;

        Object.defineProperty(entry, 'notes', {
            enumerable: true,
            configurable: true,
            get() {
                notesReads.set(data.entryId, (notesReads.get(data.entryId) ?? 0) + 1);
                return liveNotes;
            },
            set(value) {
                liveNotes = value;
            },
        });

        return entry;
    });

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
        materializedEntries[TARGET_ENTRY_INDEX].notes = UPDATED_NOTES;
        return cookbook;
    };

    cookbook.populate = async (paths) => {
        cookbook.populateCalls.push(paths);
        return {
            id: 'cookbook-42',
            name: 'Large personal notes cookbook',
            description: 'Large fixture for notes scale boundary',
            isPublic: false,
            entries: materializedEntries.map((entry) => ({
                ...entry,
                allowedMealTypes: [...entry.allowedMealTypes],
                recipe: { ...entry.recipe },
            })),
            meals: [],
            recipes: [],
            restaurants: [],
        };
    };

    return { cookbook, materializedEntries, notesReads };
};

test('updateCookbookEntry keeps personal notes canonical across a large cookbook snapshot without rereading untouched entries', async () => {
    const { cookbook, materializedEntries, notesReads } = buildLargeCookbookFixture();
    const targetEntryId = cookbook.entries[TARGET_ENTRY_INDEX]._id;
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        const updatedCookbook = await updateCookbookEntry(
            null,
            {
                cookbookId: 'cookbook-42',
                entryId: targetEntryId,
                entry: {
                    notes: '  Canonical scale note  ',
                },
            },
            { user: { userId: 'user-42' } },
        );

        const refreshedCookbook = await getCookbook(null, { id: 'cookbook-42' });

        assert.equal(findByIdMock.mock.callCount(), 2);
        assert.equal(cookbook.saveCalls, 1);
        assert.deepEqual(cookbook.populateCalls, [
            'entries.recipe meals recipes restaurants',
            'entries.recipe meals recipes restaurants',
        ]);
        assert.equal(notesReads.size, 1);
        assert.equal(notesReads.get(targetEntryId), 2);
        assert.equal(updatedCookbook.entries.length, LARGE_COOKBOOK_ENTRY_COUNT);
        assert.deepEqual(updatedCookbook, refreshedCookbook);
        assert.deepEqual(updatedCookbook.entries, materializedEntries);
        assert.deepEqual(updatedCookbook.entries[TARGET_ENTRY_INDEX], {
            id: targetEntryId,
            desiredServings: materializedEntries[TARGET_ENTRY_INDEX].desiredServings,
            maxTimesPerWeek: materializedEntries[TARGET_ENTRY_INDEX].maxTimesPerWeek,
            minTimesPerWeek: materializedEntries[TARGET_ENTRY_INDEX].minTimesPerWeek,
            allowedMealTypes: [...materializedEntries[TARGET_ENTRY_INDEX].allowedMealTypes],
            preferenceScore: materializedEntries[TARGET_ENTRY_INDEX].preferenceScore,
            notes: UPDATED_NOTES,
            recipe: {
                id: materializedEntries[TARGET_ENTRY_INDEX].recipe.id,
                recipeName: materializedEntries[TARGET_ENTRY_INDEX].recipe.recipeName,
            },
        });
    } finally {
        findByIdMock.mock.restore();
    }
});
