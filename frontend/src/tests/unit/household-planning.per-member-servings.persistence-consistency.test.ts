// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import User from '../../models/User';
import { addHouseholdMember } from '../../graphql/resolvers/mutations/householdMutations';
import { getHousehold } from '../../graphql/resolvers/queries/householdQueries';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

function getHouseholdSaveHook() {
    const saveHooks = Household.schema.s.hooks._pres.get('save') || [];
    const hook = saveHooks.find(({ fn }) => fn?.name === '');

    assert.ok(hook?.fn, 'Expected the household save hook to be registered');

    return hook.fn;
}

async function runHouseholdSaveHook(doc) {
    const hook = getHouseholdSaveHook();

    await new Promise((resolve, reject) => {
        hook.call(doc, (error) => (error ? reject(error) : resolve()));
    });
}

const buildHouseholdFixture = () => {
    const fixture = {
        _id: 'household-1',
        owner: {
            toString: () => 'owner-1',
        },
        members: [
            {
                user: {
                    toString: () => 'owner-1',
                },
                role: 'OWNER',
                servingMultiplier: 1,
                includeInPlanning: true,
            },
        ],
        guests: [
            {
                name: 'Guest One',
                email: '',
                allergens: [],
                dietaryTags: [],
                servingMultiplier: 2,
                startDate: null,
                endDate: null,
                notes: '',
            },
        ],
        headcount: 1,
        saveCalls: 0,
        populateCalls: [],
        async save() {
            this.saveCalls += 1;
            await runHouseholdSaveHook(this);
            return this;
        },
        populate(paths) {
            this.populateCalls.push(paths);
            return this;
        },
    };

    return fixture;
};

test('addHouseholdMember keeps per-member servings canonical across save and refresh', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, 'member-42');
        assert.deepEqual(update, { activeHousehold: 'household-1' });
        return update;
    });

    try {
        const result = await addHouseholdMember(
            null,
            {
                householdId: 'household-1',
                member: {
                    userId: 'member-42',
                    role: 'MEMBER',
                    servingMultiplier: 0.5,
                    includeInPlanning: true,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        const refreshedHousehold = await getHousehold(
            null,
            { id: 'household-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 2);
        assert.equal(updateUserMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 1);
        assert.equal(household.headcount, 4);
        assert.equal(result.headcount, 4);
        assert.equal(refreshedHousehold.headcount, 4);
        assert.deepEqual(household.populateCalls, [
            'owner members.user sharedCookbook',
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
        assert.equal(result.members[1].servingMultiplier, 0.5);
        assert.equal(refreshedHousehold.members[1].servingMultiplier, 0.5);
        assert.equal(result.guests[0].servingMultiplier, 2);
        assert.equal(refreshedHousehold.guests[0].servingMultiplier, 2);
    } finally {
        restoreAll(findByIdMock, updateUserMock);
    }
});
