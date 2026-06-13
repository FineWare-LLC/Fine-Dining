// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test, { mock } from 'node:test';
import { fileURLToPath } from 'node:url';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { getCookbook } from '../../graphql/resolvers/queries/cookbookQueries';
import { updateCookbookEntry } from '../../graphql/resolvers/mutations/cookbookMutations';

const cookbookPagePath = fileURLToPath(new URL('../../pages/cookbook.tsx', import.meta.url));
const recipesPagePath = fileURLToPath(new URL('../../pages/recipes.tsx', import.meta.url));

const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');
const recipesPageSource = fs.readFileSync(recipesPagePath, 'utf8');

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
            description: 'Personal notes snapshot',
            isPublic: false,
            entries: [{
                id: 'entry-42',
                desiredServings: 4,
                maxTimesPerWeek: 2,
                minTimesPerWeek: 0,
                allowedMealTypes: ['BREAKFAST', 'DINNER'],
                preferenceScore: 9,
                notes: 'Weeknight staple',
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

test('updateCookbookEntry keeps personal notes attached across refreshes', async () => {
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
            description: 'Personal notes snapshot',
            isPublic: false,
            entries: [{
                id: 'entry-42',
                desiredServings: 4,
                maxTimesPerWeek: 2,
                minTimesPerWeek: 0,
                allowedMealTypes: ['BREAKFAST', 'DINNER'],
                preferenceScore: 9,
                notes: 'Weeknight staple',
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
            notes: 'Weeknight staple',
        });
    } finally {
        findByIdMock.mock.restore();
    }
});

test('cookbook pages keep personal notes in the refresh and display contracts', () => {
    assert.match(cookbookPageSource, /allowedMealTypes preferenceScore notes addedAt/);
    assert.match(cookbookPageSource, /entry\.notes/);
    assert.match(recipesPageSource, /entries\s*\{\s*recipe\s*\{\s*id\s*\}\s*notes\s*\}/s);
});
