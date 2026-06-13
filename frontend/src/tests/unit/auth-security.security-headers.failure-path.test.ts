// @ts-nocheck
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { performAuthLogout } from '../../context/authUtils';

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };
    const removals = [];

    return {
        state,
        removals,
        setItem(key, value) {
            state[key] = value;
            return true;
        },
        removeItem(key) {
            removals.push(key);
            delete state[key];
            return true;
        },
    };
};

test('performAuthLogout clears session state and still redirects when cache reset fails', async () => {
    const consoleErrorSpy = mock.method(console, 'error', () => {});
    try {
        const storageAdapter = createStorageAdapter({
            authToken: 'stale-token',
            userInfo: '{"id":"user-logout-1"}',
        });
        const resetStoreCalls = [];
        const routerPushCalls = [];
        const client = {
            async resetStore() {
                resetStoreCalls.push('resetStore');
                throw new Error('Apollo cache reset failed');
            },
        };
        const router = {
            async push(path) {
                routerPushCalls.push(path);
                return true;
            },
        };

        await performAuthLogout({
            storageAdapter,
            client,
            router,
        });

        assert.deepEqual(resetStoreCalls, ['resetStore']);
        assert.deepEqual(routerPushCalls, ['/login']);
        assert.deepEqual(storageAdapter.state, {});
        assert.deepEqual(storageAdapter.removals, ['authToken', 'userInfo']);
        assert.equal(consoleErrorSpy.mock.calls.length, 1);
    } finally {
        consoleErrorSpy.mock.restore();
    }
});
