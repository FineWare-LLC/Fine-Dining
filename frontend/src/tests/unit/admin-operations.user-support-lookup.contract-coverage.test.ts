// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import User from '../../models/User/index';
import {
    UserSearchValidationError,
    validateUserSearchInput,
} from '../../utils/userSearch.ts';

test('validateUserSearchInput accepts safe identifiers and escapes regex metacharacters', () => {
    const result = validateUserSearchInput('  ada@example.com  ');

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.input, {
        keyword: 'ada@example.com',
        filter: {
            $or: [
                { name: new RegExp('ada@example\\.com', 'i') },
                { email: new RegExp('ada@example\\.com', 'i') },
            ],
        },
        sort: { name: 1, email: 1, _id: 1 },
    });
});

test('validateUserSearchInput rejects malformed user search payloads with a typed user-safe error', () => {
    const blankResult = validateUserSearchInput('   ');
    const longResult = validateUserSearchInput('a'.repeat(129));

    for (const result of [blankResult, longResult]) {
        assert.equal(result.valid, false);
        assert.equal(result.input, null);
        assert.ok(result.error instanceof UserSearchValidationError);
        assert.equal(result.error.code, 'invalidPayload');
        assert.equal(
            result.error.message,
            'We could not read this user search. Please refresh the admin page.',
        );
        assert.equal(result.error.isUserSafe, true);
    }
});

test('User.searchUsers forwards the normalized lookup filter and sort order to the user collection', async () => {
    let capturedFilter = null;
    let capturedSort = null;
    const findMock = mock.method(User, 'find', (filter) => {
        capturedFilter = filter;

        return {
            sort(sortSpec) {
                capturedSort = sortSpec;
                return [{ id: 'user-1' }];
            },
        };
    });

    try {
        const results = await User.searchUsers('  ada@example.com  ');

        assert.deepEqual(results, [{ id: 'user-1' }]);
        assert.deepEqual(capturedFilter, {
            $or: [
                { name: new RegExp('ada@example\\.com', 'i') },
                { email: new RegExp('ada@example\\.com', 'i') },
            ],
        });
        assert.deepEqual(capturedSort, { name: 1, email: 1, _id: 1 });
    } finally {
        findMock.mock.restore();
    }
});
