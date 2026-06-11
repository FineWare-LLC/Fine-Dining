// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import jwt from 'jsonwebtoken';
import devLoginHandler from '../../pages/api/dev-login';

const restoreKeys = ['NODE_ENV', 'JWT_SECRET', 'JWT_ISSUER', 'JWT_AUDIENCE'];

const snapshotEnvironment = () =>
    Object.fromEntries(restoreKeys.map((key) => [key, process.env[key]]));

const applyEnvironment = (overrides) => {
    for (const key of restoreKeys) {
        if (Object.prototype.hasOwnProperty.call(overrides, key)) {
            const value = overrides[key];
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }
};

const restoreEnvironment = (snapshot) => {
    for (const key of restoreKeys) {
        const value = snapshot[key];
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
};

const withEnvironment = async (overrides, assertion) => {
    const snapshot = snapshotEnvironment();
    applyEnvironment(overrides);

    try {
        return await assertion();
    } finally {
        restoreEnvironment(snapshot);
    }
};

const createResponse = () => {
    const response = {
        statusCode: null,
        body: null,
        headers: {},
        status(code) {
            this.statusCode = code;
            return this;
        },
        setHeader(key, value) {
            this.headers[key] = value;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };

    return response;
};

test('dev login fails shut when token signing throws', async () => {
    await withEnvironment(
        {
            NODE_ENV: 'development',
            JWT_SECRET: 'dev-login-test-secret-1234567890',
        },
        async () => {
            const consoleErrorSpy = mock.method(console, 'error', () => {});
            const signMock = mock.method(jwt, 'sign', () => {
                throw new Error('sign failed');
            });

            try {
                const response = createResponse();

                await devLoginHandler(
                    {
                        method: 'POST',
                        body: { role: 'admin' },
                        headers: {},
                    },
                    response,
                );

                assert.equal(response.statusCode, 500);
                assert.deepEqual(response.body, {
                    error: 'Dev login could not create a session token.',
                });
                assert.equal(signMock.mock.callCount(), 1);
                assert.equal(consoleErrorSpy.mock.callCount(), 1);
            } finally {
                signMock.mock.restore();
                consoleErrorSpy.mock.restore();
            }
        },
    );
});
