// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { fetchRecipeCatalog } from '../../optimizer2/catalog';

const request = {
    allergens: [],
    bannedIngredients: [],
    preferences: {
        cuisine: ['Italian', 'mexican'],
        vegetarian: true,
    },
    timePerMeal: 30,
};

const refreshVariant = {
    ...request,
    preferences: {
        vegetarian: true,
        cuisine: ['mexican', 'ITALIAN', 'italian'],
    },
};

test('fetchRecipeCatalog keeps fallback catalog snapshots canonical across refreshes', async () => {
    const originalMongoUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    const warnMock = mock.method(console, 'warn', () => {});

    try {
        const first = await fetchRecipeCatalog(request);
        await new Promise(resolve => setTimeout(resolve, 25));
        const second = await fetchRecipeCatalog(refreshVariant);

        assert.deepEqual(first.recipes.map(recipe => recipe.id), second.recipes.map(recipe => recipe.id));
        assert.deepEqual(first.metadata.excluded, second.metadata.excluded);
        assert.equal(first.metadata.versionToken, second.metadata.versionToken);
        assert.deepEqual(
            first.recipes.map(recipe => recipe.updatedAt),
            second.recipes.map(recipe => recipe.updatedAt),
        );
    } finally {
        warnMock.mock.restore();
        if (originalMongoUri === undefined) {
            delete process.env.MONGODB_URI;
        } else {
            process.env.MONGODB_URI = originalMongoUri;
        }
    }
});
