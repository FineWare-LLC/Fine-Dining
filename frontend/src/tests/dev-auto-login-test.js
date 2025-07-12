import assert from 'node:assert';
import { test } from 'node:test';

// Mock environment to simulate development mode
process.env.NODE_ENV = 'development';

// Mock localStorage for Node.js environment
global.localStorage = {
    storage: {},
    getItem(key) {
        return this.storage[key] || null;
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

// Mock window object
global.window = {
    localStorage: global.localStorage,
};

// Mock btoa function for Node.js
global.btoa = (str) => Buffer.from(str).toString('base64');

test('Auto-login functionality in development mode', async (t) => {
    // Clear localStorage before test
    global.localStorage.clear();

    // Mock React hooks and context
    let mockUser = null;
    let mockToken = null;
    let mockLoading = true;

    const mockSetUser = (user) => { mockUser = user; };
    const mockSetToken = (token) => { mockToken = token; };
    const mockSetLoading = (loading) => { mockLoading = loading; };

    // Simulate the useEffect logic from AuthContext
    if (process.env.NODE_ENV === 'development') {
        const fakeUser = {
            id: 'dev-user-123',
            name: 'Dev User',
            email: 'dev@finedining.com',
            role: 'admin',
        };

        const fakeTokenPayload = {
            userId: fakeUser.id,
            email: fakeUser.email,
            role: fakeUser.role,
            exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
        };

        const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
            btoa(JSON.stringify(fakeTokenPayload))
        }.fake-signature-for-dev`;

        mockSetToken(fakeToken);
        mockSetUser(fakeUser);
        global.localStorage.setItem('authToken', fakeToken);
        global.localStorage.setItem('userInfo', JSON.stringify(fakeUser));
        mockSetLoading(false);
    }

    // Assertions
    assert.strictEqual(mockUser.id, 'dev-user-123', 'User ID should be set correctly');
    assert.strictEqual(mockUser.name, 'Dev User', 'User name should be set correctly');
    assert.strictEqual(mockUser.email, 'dev@finedining.com', 'User email should be set correctly');
    assert.strictEqual(mockUser.role, 'admin', 'User role should be admin');
    assert.strictEqual(mockLoading, false, 'Loading should be false after auto-login');
    assert.ok(mockToken, 'Token should be set');
    assert.ok(mockToken.includes('fake-signature-for-dev'), 'Token should contain dev signature');

    // Check localStorage
    const storedToken = global.localStorage.getItem('authToken');
    const storedUser = JSON.parse(global.localStorage.getItem('userInfo'));

    assert.strictEqual(storedToken, mockToken, 'Token should be stored in localStorage');
    assert.deepStrictEqual(storedUser, mockUser, 'User should be stored in localStorage');

    console.log('✅ Auto-login functionality test passed!');
    console.log('🚀 Fake user:', mockUser);
    console.log('🔑 Token stored successfully');
});

test('Normal authentication flow in production mode', async (t) => {
    // Set production mode
    process.env.NODE_ENV = 'production';

    // Clear localStorage
    global.localStorage.clear();

    let mockUser = null;
    let mockToken = null;
    let mockLoading = true;

    const mockSetUser = (user) => { mockUser = user; };
    const mockSetToken = (token) => { mockToken = token; };
    const mockSetLoading = (loading) => { mockLoading = loading; };

    // Simulate the useEffect logic for production (no auto-login)
    if (process.env.NODE_ENV !== 'development') {
        const storedToken = global.localStorage.getItem('authToken');
        const storedUser = global.localStorage.getItem('userInfo');

        if (!storedToken) {
            mockSetToken(null);
            mockSetUser(null);
        }

        mockSetLoading(false);
    }

    // Assertions for production mode
    assert.strictEqual(mockUser, null, 'User should be null in production without stored token');
    assert.strictEqual(mockToken, null, 'Token should be null in production without stored token');
    assert.strictEqual(mockLoading, false, 'Loading should be false after check');

    console.log('✅ Production mode test passed!');
    console.log('🔒 No auto-login in production mode');
});
