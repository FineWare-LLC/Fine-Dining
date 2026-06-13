// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { getCookbook } from '../../graphql/resolvers/queries/cookbookQueries';
import { updateCookbookEntry } from '../../graphql/resolvers/mutations/cookbookMutations';
import { updateCookbookEntryAndRefresh } from '../../utils/cookbookRevision';

const buildCookbookFixture = () => {
    const existingEntry = {
        _id: 'entry-42',
        recipe: 'recipe-123',
        desiredServings: 2,
        maxTimesPerWeek: 4,
        minTimesPerWeek: 1,
        allowedMealTypes: ['DINNER'],
        preferenceScore: 7,
        notes: 'Weeknight staple',
    };

    const entries = [existingEntry];
    entries.id = (entryId) => (entryId === existingEntry._id ? existingEntry : null);

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
            name: 'Weeknight Cookbook',
            description: 'Canonical revision snapshot',
            isPublic: false,
            entries: [{
                id: 'entry-42',
                desiredServings: 4,
                maxTimesPerWeek: 2,
                minTimesPerWeek: 0,
                allowedMealTypes: ['BREAKFAST', 'DINNER'],
                preferenceScore: 9,
                notes: 'Updated note',
                recipe: {
                    id: 'recipe-123',
                    recipeName: 'Weeknight Curry',
                },
            }],
            meals: [],
            recipes: [],
            restaurants: [],
        };
    };

    return { cookbook, existingEntry };
};

test('updateCookbookEntry keeps the canonical revised cookbook snapshot stable across refreshes', async () => {
    const { cookbook, existingEntry } = buildCookbookFixture();
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        const updatedCookbook = await updateCookbookEntry(
            null,
            {
                cookbookId: 'cookbook-42',
                entryId: 'entry-42',
                entry: {
                    desiredServings: 4,
                    maxTimesPerWeek: 2,
                    minTimesPerWeek: 0,
                    allowedMealTypes: ['BREAKFAST', 'DINNER', 'DINNER'],
                    preferenceScore: 9,
                    notes: '  Updated note  ',
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
        assert.deepEqual(updatedCookbook, refreshedCookbook);
        assert.deepEqual(updatedCookbook, {
            id: 'cookbook-42',
            name: 'Weeknight Cookbook',
            description: 'Canonical revision snapshot',
            isPublic: false,
            entries: [{
                id: 'entry-42',
                desiredServings: 4,
                maxTimesPerWeek: 2,
                minTimesPerWeek: 0,
                allowedMealTypes: ['BREAKFAST', 'DINNER'],
                preferenceScore: 9,
                notes: 'Updated note',
                recipe: {
                    id: 'recipe-123',
                    recipeName: 'Weeknight Curry',
                },
            }],
            meals: [],
            recipes: [],
            restaurants: [],
        });
        assert.deepEqual(existingEntry, {
            _id: 'entry-42',
            recipe: 'recipe-123',
            desiredServings: 4,
            maxTimesPerWeek: 2,
            minTimesPerWeek: 0,
            allowedMealTypes: ['BREAKFAST', 'DINNER'],
            preferenceScore: 9,
            notes: 'Updated note',
        });
    } finally {
        findByIdMock.mock.restore();
    }
});

test('updateCookbookEntryAndRefresh rejects a refresh failure after a successful revision save', async () => {
    const mutationCalls = [];
    const refetchCalls = [];

    const updateCookbookMutation = async (options) => {
        mutationCalls.push(options);
        return {
            data: {
                updateCookbookEntry: {
                    id: 'cookbook-42',
                },
            },
        };
    };

    await assert.rejects(
        () =>
            updateCookbookEntryAndRefresh({
                updateCookbookMutation,
                refetchCookbooks: async () => {
                    refetchCalls.push('refetch');
                    throw new Error('cookbook refresh unavailable');
                },
                cookbookId: 'cookbook-42',
                entryId: 'entry-42',
                entry: {
                    recipeId: 'recipe-123',
                    desiredServings: 4,
                    maxTimesPerWeek: 2,
                    minTimesPerWeek: 0,
                    allowedMealTypes: ['BREAKFAST', 'DINNER'],
                    preferenceScore: 9,
                    notes: 'Updated note',
                },
            }),
        /cookbook refresh unavailable/,
    );

    assert.equal(mutationCalls.length, 1);
    assert.deepEqual(mutationCalls[0], {
        variables: {
            cookbookId: 'cookbook-42',
            entryId: 'entry-42',
            entry: {
                recipeId: 'recipe-123',
                desiredServings: 4,
                maxTimesPerWeek: 2,
                minTimesPerWeek: 0,
                allowedMealTypes: ['BREAKFAST', 'DINNER'],
                preferenceScore: 9,
                notes: 'Updated note',
            },
        },
    });
    assert.deepEqual(refetchCalls, ['refetch']);
});
