// @ts-nocheck

export const COOKBOOK_IMPORT_DEFAULT_DESIRED_SERVINGS = 1;
export const COOKBOOK_IMPORT_DEFAULT_PREFERENCE_SCORE = 5;

export function createCookbookImportEntry(recipeId) {
    return {
        recipeId,
        desiredServings: COOKBOOK_IMPORT_DEFAULT_DESIRED_SERVINGS,
        preferenceScore: COOKBOOK_IMPORT_DEFAULT_PREFERENCE_SCORE,
    };
}

export async function addRecipeToCookbookAndRefresh({
    addRecipeMutation,
    refetchCookbooks,
    cookbookId,
    recipeId,
}) {
    await addRecipeMutation({
        variables: {
            cookbookId,
            entry: createCookbookImportEntry(recipeId),
        },
    });

    if (typeof refetchCookbooks === 'function') {
        refetchCookbooks().catch(() => {});
    }
}
