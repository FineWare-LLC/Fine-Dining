// @ts-nocheck

export async function updateCookbookEntryAndRefresh({
    updateCookbookMutation,
    refetchCookbooks,
    cookbookId,
    entryId,
    entry,
}) {
    const result = await updateCookbookMutation({
        variables: {
            cookbookId,
            entryId,
            entry,
        },
    });

    if (typeof refetchCookbooks === 'function') {
        await refetchCookbooks();
    }

    return result;
}
