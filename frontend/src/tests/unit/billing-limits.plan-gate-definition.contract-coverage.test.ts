// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import UsageCounter from '../../models/UsageCounter/usageCounter.model';
import { assertAndIncrementUsage } from '../../services/usageLimits';

function restoreMocks(...mocks) {
    for (const tracker of mocks) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('assertAndIncrementUsage accepts a valid plan gate and uses the current tier limit', async () => {
    const findOneAndUpdateMock = mock.method(UsageCounter, 'findOneAndUpdate', async () => ({
        _id: 'counter-1',
        count: 1,
    }));

    try {
        const result = await assertAndIncrementUsage(
            { _id: 'user-1', subscriptionPlan: 'PRO' },
            'optimizerRunsPerDay',
            'optimizerRunsPerDay',
        );

        assert.equal(result.count, 1);
        assert.equal(result.limit, 50);
        assert.equal(result.tier.key, 'USER');
        assert.equal(findOneAndUpdateMock.mock.callCount(), 1);
    } finally {
        restoreMocks(findOneAndUpdateMock);
    }
});

test('assertAndIncrementUsage rejects unknown plan limits with a typed, user-safe error', async () => {
    const findOneAndUpdateMock = mock.method(UsageCounter, 'findOneAndUpdate', async () => ({
        _id: 'counter-1',
        count: 1,
    }));

    try {
        await assert.rejects(
            () => assertAndIncrementUsage(
                { _id: 'user-1', subscriptionPlan: 'FREE' },
                'optimizerRunsPerDay',
                'missingLimit',
            ),
            (error) => {
                assert.equal(error.name, 'UsageLimitValidationError');
                assert.equal(error.code, 'invalidLimitDefinition');
                assert.equal(error.message, 'Usage limit "missingLimit" is not configured for Free tier.');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(findOneAndUpdateMock.mock.callCount(), 0);
    } finally {
        restoreMocks(findOneAndUpdateMock);
    }
});
