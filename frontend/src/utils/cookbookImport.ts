// @ts-nocheck

export const COOKBOOK_IMPORT_DEFAULT_DESIRED_SERVINGS = 1;
export const COOKBOOK_IMPORT_DEFAULT_PREFERENCE_SCORE = 5;

export function createCookbookImportEntry(recipeId, recipeVersion) {
    const entry = {
        recipeId,
        desiredServings: COOKBOOK_IMPORT_DEFAULT_DESIRED_SERVINGS,
        preferenceScore: COOKBOOK_IMPORT_DEFAULT_PREFERENCE_SCORE,
    };

    if (recipeVersion !== undefined && recipeVersion !== null && recipeVersion !== '') {
        entry.recipeVersion = recipeVersion;
    }

    return entry;
}

export async function addRecipeToCookbookAndRefresh({
    addRecipeMutation,
    refetchCookbooks,
    cookbookId,
    recipeId,
    recipeVersion,
}) {
    await addRecipeMutation({
        variables: {
            cookbookId,
            entry: createCookbookImportEntry(recipeId, recipeVersion),
        },
    });

    if (typeof refetchCookbooks === 'function') {
        refetchCookbooks().catch(() => {});
    }
}
