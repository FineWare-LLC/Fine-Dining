import assert from 'node:assert/strict';
import test from 'node:test';
import { saveLoginInfo } from '../../context/authUtils.js';

// Simple localStorage mock
const localStorageMock = {
    storage: {},
    getItem(key) {
        return this.storage[key] ?? null;
    },
    setItem(key, value) {
        this.storage[key] = value;
    },
    removeItem(key) {
        delete this.storage[key];
    },
    clear() {
        this.storage = {};
    },
};

global.localStorage = localStorageMock;

test('saveLoginInfo stores sanitized user data and token', async () => {
    localStorage.clear();
    const token = 'test-token';
    const user = { id: '1', name: 'Test', email: 't@example.com', role: 'user', extra: 'ignored' };

    const result = saveLoginInfo(token, user);

    assert.deepEqual(result, { id: '1', name: 'Test', email: 't@example.com', role: 'user' });
    assert.equal(localStorage.getItem('authToken'), token);
    assert.deepEqual(JSON.parse(localStorage.getItem('userInfo')), result);
});
