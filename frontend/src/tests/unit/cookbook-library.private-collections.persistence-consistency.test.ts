// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCookbookLibraryFeedbackState } from '../../utils/cookbookFeedback';
import { buildCookbookSharingDisplayState } from '../../utils/cookbookSharing';

const clone = (value) => JSON.parse(JSON.stringify(value));

test('legacy private cookbook snapshots stay private across refresh and display hydration', () => {
    const legacyPrivateCookbook = {
        id: 'cookbook-42',
        name: 'Household Favorites',
        description: 'Imported before visibility was recorded explicitly',
        entries: [],
    };

    const expectedDisplayState = {
        isPublic: false,
        label: 'Private',
        ariaLabel: 'Private cookbook',
        color: 'default',
        variant: 'outlined',
    };

    const freshSnapshot = clone(legacyPrivateCookbook);
    const firstFeedbackState = buildCookbookLibraryFeedbackState({
        cookbooks: [legacyPrivateCookbook],
    });
    const refreshedFeedbackState = buildCookbookLibraryFeedbackState({
        cookbooks: [freshSnapshot],
    });

    assert.equal(firstFeedbackState.state, 'resolved');
    assert.equal(firstFeedbackState.error, null);
    assert.equal(refreshedFeedbackState.state, 'resolved');
    assert.equal(refreshedFeedbackState.error, null);
    assert.deepEqual(buildCookbookSharingDisplayState(legacyPrivateCookbook), expectedDisplayState);
    assert.deepEqual(buildCookbookSharingDisplayState(freshSnapshot), expectedDisplayState);
});
