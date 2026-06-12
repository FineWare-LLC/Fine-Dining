// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';

import menuItemSchema from '../../models/MenuItem/menuItem.schema';
import restaurantSchema from '../../models/Restaurant/restaurant.schema';
import {
    GrocerIntegrationValidationError,
    grocerIntegrationSchema,
} from '../../models/Grocer/grocerIntegrationSchema.ts';

function getGrocerIntegrationValidationHook() {
    const validationHooks = grocerIntegrationSchema.s.hooks._pres.get('validate') || [];
    const hook = validationHooks.find(({ fn }) => fn?.name === '');

    assert.ok(hook?.fn, 'Expected the grocer integration validation hook to be registered');

    return hook.fn;
}

async function runGrocerIntegrationValidation(doc) {
    const hook = getGrocerIntegrationValidationHook();

    await new Promise((resolve, reject) => {
        hook.call(doc, (error) => (error ? reject(error) : resolve()));
    });
}

test('store preference metadata stays wired through menu item and restaurant schemas', () => {
    for (const path of ['priceMarket', 'priceCurrency']) {
        assert.ok(menuItemSchema.path(path), `Expected menu item schema path ${path}`);
    }

    assert.ok(restaurantSchema.path('defaultPriceMarket'), 'Expected restaurant defaultPriceMarket schema path');
});

test('grocer integration validation canonicalizes supported store providers and rejects invalid ones with a typed user-safe error', async () => {
    const validIntegration = {
        user: new mongoose.Types.ObjectId(),
        provider: ' whole_foods ',
    };

    await runGrocerIntegrationValidation(validIntegration);
    assert.equal(validIntegration.provider, 'WHOLE_FOODS');

    const invalidIntegration = {
        user: new mongoose.Types.ObjectId(),
        provider: ' corner_shop ',
    };

    await assert.rejects(
        () => runGrocerIntegrationValidation(invalidIntegration),
        (error) => {
            assert.ok(error instanceof GrocerIntegrationValidationError);
            assert.equal(error.code, 'invalidGrocerProvider');
            assert.equal(error.reason, 'provider');
            assert.equal(error.provider, 'CORNER_SHOP');
            assert.equal(
                error.message,
                'We could not read your store preference. Please choose a supported grocery provider.',
            );
            assert.equal(error.isUserSafe, true);
            return true;
        },
    );
});
