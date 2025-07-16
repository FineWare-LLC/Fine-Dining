import assert from 'node:assert/strict';
import test from 'node:test';
import { assignRequestId } from '../../utils/headers.js';

test('assignRequestId concatenates timestamp and random segment', async () => {
    const originalNow = Date.now;
    const originalRandom = Math.random;
    Date.now = () => 1234567890;
    Math.random = () => 0.123456789;

    const headers = {};
    const res = { setHeader: (k, v) => { headers[k] = v; } };

    const id = assignRequestId(res);

    assert.equal(id, 'kf12oi-4fzzzxjy');
    assert.equal(headers['X-Request-ID'], id);

    Date.now = originalNow;
    Math.random = originalRandom;
});
