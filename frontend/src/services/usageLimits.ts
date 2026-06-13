// @ts-nocheck
import UsageCounter from '@/models/UsageCounter/usageCounter.model';
import { createTierLimitError, getTierConfig } from '@/lib/tiers';

export class UsageLimitValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'UsageLimitValidationError';
        this.code = code;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            isUserSafe: this.isUserSafe,
        };
    }
}

const createUsageLimitValidationError = (limitName, tier) => (
    new UsageLimitValidationError(
        'invalidLimitDefinition',
        `Usage limit "${String(limitName)}" is not configured for ${tier.label} tier.`,
    )
);

const getTierLimit = (tier, limitName) => {
    if (typeof limitName !== 'string' || !Object.prototype.hasOwnProperty.call(tier.limits, limitName)) {
        throw createUsageLimitValidationError(limitName, tier);
    }

    const limit = tier.limits[limitName];

    if (typeof limit !== 'number' || !Number.isFinite(limit)) {
        throw createUsageLimitValidationError(limitName, tier);
    }

    return limit;
};

function getPeriodKey(period, date = new Date()) {
    const iso = date.toISOString();
    return period === 'month' ? iso.slice(0, 7) : iso.slice(0, 10);
}

export async function getUsageSnapshot(user, actions = ['optimizerRunsPerDay']) {
    const tier = getTierConfig(user?.subscriptionPlan);
    const dayKey = getPeriodKey('day');
    const counters = await UsageCounter.find({
        user: user._id,
        period: 'day',
        periodKey: dayKey,
        action: { $in: actions },
    }).lean();
    const usage = {};
    for (const action of actions) {
        usage[action] = counters.find((counter) => counter.action === action)?.count || 0;
    }
    return { tier, usage };
}

export async function assertAndIncrementUsage(user, action, limitName, period = 'day') {
    const tier = getTierConfig(user?.subscriptionPlan);
    const limit = getTierLimit(tier, limitName);
    const periodKey = getPeriodKey(period);
    const counter = await UsageCounter.findOneAndUpdate(
        { user: user._id, action, period, periodKey },
        { $inc: { count: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    if (counter.count > limit) {
        await UsageCounter.updateOne({ _id: counter._id }, { $inc: { count: -1 } });
        throw createTierLimitError(action, tier.key, limit);
    }
    return { count: counter.count, limit, tier };
}

export async function assertResourceLimit({ user, model, filter, limitName, action }) {
    const tier = getTierConfig(user?.subscriptionPlan);
    const limit = getTierLimit(tier, limitName);
    const count = await model.countDocuments(filter);
    if (count >= limit) {
        throw createTierLimitError(action, tier.key, limit);
    }
    return { count, limit, tier };
}
