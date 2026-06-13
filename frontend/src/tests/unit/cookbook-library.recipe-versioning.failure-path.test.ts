// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { updateCookbookEntry } from '../../graphql/resolvers/mutations/cookbookMutations';

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
        throw new Error('database unavailable while saving revised recipe');
    };

    cookbook.populate = async (paths) => {
        cookbook.populateCalls.push(paths);
        return cookbook;
    };

    return { cookbook, existingEntry };
};

test('updateCookbookEntry rolls back a failed revision save and surfaces a recoverable error', async () => {
    const { cookbook, existingEntry } = buildCookbookFixture();
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        await assert.rejects(
            updateCookbookEntry(
                null,
                {
                    cookbookId: 'cookbook-42',
                    entryId: 'entry-42',
                    entry: {
                        desiredServings: 4,
                        maxTimesPerWeek: 2,
                        minTimesPerWeek: 0,
                        allowedMealTypes: ['BREAKFAST', 'DINNER'],
                        preferenceScore: 9,
                        notes: 'Updated note',
                    },
                },
                { user: { userId: 'user-42' } },
            ),
            (error) => {
                assert.equal(error.message, 'We could not save this recipe revision. Please try again.');
                assert.equal(error.code, 'cookbookEntryPersistenceFailed');
                assert.equal(error.reason, 'save');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(cookbook.saveCalls, 1);
        assert.deepEqual(cookbook.populateCalls, []);
        assert.deepEqual(existingEntry, {
            _id: 'entry-42',
            recipe: 'recipe-123',
            desiredServings: 2,
            maxTimesPerWeek: 4,
            minTimesPerWeek: 1,
            allowedMealTypes: ['DINNER'],
            preferenceScore: 7,
            notes: 'Weeknight staple',
        });
    } finally {
        findByIdMock.mock.restore();
    }
});
