// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { getHouseholdByInviteCode } from '../../graphql/resolvers/queries/householdQueries';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

test('getHouseholdByInviteCode keeps invite refresh hydration aligned with household reads', async () => {
    const inviteCode = 'abcdef123abc';
    const query = {
        populateCalls: [],
        populate(path) {
            this.populateCalls.push(path);
            return this;
        },
    };

    const findOneMock = mock.method(Household, 'findOne', (queryArg) => {
        assert.deepEqual(queryArg, { inviteCode });
        return query;
    });

    try {
        const result = await getHouseholdByInviteCode(null, { inviteCode }, {});

        assert.equal(result, query);
        assert.deepEqual(query.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
    } finally {
        restoreAll(findOneMock);
    }
});
