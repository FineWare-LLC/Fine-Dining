// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import Household from '../../models/Household/householdSchema';

const LARGE_MEMBER_COUNT = 2048;
const LARGE_GUEST_COUNT = 512;

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

function createTrackedMembers({ reverse = false } = {}) {
    const rawMembers = Array.from({ length: LARGE_MEMBER_COUNT }, (_, index) => ({
        user: { toString: () => `member-${index}` },
        includeInPlanning: index % 3 !== 0,
    }));

    if (reverse) {
        rawMembers.reverse();
    }

    const counts = {
        filter: 0,
    };

    const members = new Proxy(rawMembers, {
        get(target, prop, receiver) {
            if (prop === 'filter') {
                counts.filter += 1;
            }

            return Reflect.get(target, prop, receiver);
        },
    });

    const activeMembers = rawMembers.reduce(
        (total, member) => total + (member.includeInPlanning ? 1 : 0),
        0,
    );

    return {
        counts,
        expectedHeadcount: Math.max(1, activeMembers + LARGE_GUEST_COUNT),
        members,
    };
}

function createLargeHouseholdFixture(options = {}) {
    const trackedMembers = createTrackedMembers(options);
    const guests = Array.from({ length: LARGE_GUEST_COUNT }, (_, index) => ({
        name: `Guest ${index}`,
    }));

    return {
        counts: trackedMembers.counts,
        doc: {
            members: trackedMembers.members,
            guests,
            headcount: 1,
        },
        expectedHeadcount: trackedMembers.expectedHeadcount,
    };
}

test('household save pre-hook keeps a large invite fixture deterministic at the scale boundary without copying members through Array.filter', async () => {
    const forwardFixture = createLargeHouseholdFixture();
    const reverseFixture = createLargeHouseholdFixture({ reverse: true });

    await runHouseholdSaveHook(forwardFixture.doc);
    await runHouseholdSaveHook(reverseFixture.doc);

    assert.equal(forwardFixture.doc.headcount, forwardFixture.expectedHeadcount);
    assert.equal(reverseFixture.doc.headcount, forwardFixture.expectedHeadcount);
    assert.equal(forwardFixture.doc.headcount, reverseFixture.doc.headcount);
    assert.equal(forwardFixture.counts.filter, 0);
    assert.equal(reverseFixture.counts.filter, 0);
});
