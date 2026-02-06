import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { OverpassProvider } from '../../services/providers/OverpassProvider.js';

// Mock node-fetch since OverpassProvider imports it
const originalFetch = global.fetch;
let mockFetch;

describe('OverpassProvider', () => {
    let provider;

    beforeEach(() => {
        provider = new OverpassProvider();
        mockFetch = async (url, options) => {
            return mockFetch.mockResponse || {
                ok: true,
                status: 200,
                json: async () => ({ elements: [] })
            };
        };
        global.fetch = mockFetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        mockFetch = null;
    });

    it('should initialize with default baseUrl', () => {
        const provider = new OverpassProvider();
        assert.strictEqual(provider.baseUrl, 'https://overpass-api.de/api/interpreter');
    });

    it('should initialize with custom baseUrl', () => {
        const customUrl = 'https://custom-overpass.com/api/interpreter';
        const provider = new OverpassProvider(customUrl);
        assert.strictEqual(provider.baseUrl, customUrl);
    });

    it('should find nearby restaurants with default parameters', async () => {
        const mockData = {
            elements: [
                {
                    type: 'node',
                    id: 123456,
                    lat: 40.7128,
                    lon: -74.0060,
                    tags: {
                        name: 'Test Restaurant',
                        'addr:street': '123 Main St',
                        website: 'https://test-restaurant.com'
                    }
                }
            ]
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].placeId, 'node-123456');
        assert.strictEqual(result[0].name, 'Test Restaurant');
        assert.strictEqual(result[0].vicinity, '123 Main St');
        assert.strictEqual(result[0].website, 'https://test-restaurant.com');
        assert.strictEqual(result[0].location.latitude, 40.7128);
        assert.strictEqual(result[0].location.longitude, -74.0060);
    });

    it('should find nearby restaurants with custom radius and keyword', async () => {
        const mockData = {
            elements: [
                {
                    type: 'node',
                    id: 789012,
                    lat: 40.7580,
                    lon: -73.9855,
                    tags: {
                        name: 'Pizza Place',
                        'addr:full': '456 Broadway, New York, NY'
                    }
                }
            ]
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7580, -73.9855, 2000, 'pizza');

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'Pizza Place');
        assert.strictEqual(result[0].vicinity, '456 Broadway, New York, NY');
    });

    it('should handle way elements with center coordinates', async () => {
        const mockData = {
            elements: [
                {
                    type: 'way',
                    id: 345678,
                    center: {
                        lat: 40.7589,
                        lon: -73.9851
                    },
                    tags: {
                        name: 'Central Restaurant',
                        city: 'New York'
                    }
                }
            ]
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7589, -73.9851);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].placeId, 'way-345678');
        assert.strictEqual(result[0].name, 'Central Restaurant');
        assert.strictEqual(result[0].vicinity, 'New York');
        assert.strictEqual(result[0].location.latitude, 40.7589);
        assert.strictEqual(result[0].location.longitude, -73.9851);
    });

    it('should handle unnamed restaurants with fallback name', async () => {
        const mockData = {
            elements: [
                {
                    type: 'node',
                    id: 999999,
                    lat: 40.7128,
                    lon: -74.0060,
                    tags: {
                        'addr:street': '789 Side St'
                    }
                }
            ]
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'Unnamed restaurant');
        assert.strictEqual(result[0].vicinity, '789 Side St');
        assert.strictEqual(result[0].website, null);
        assert.strictEqual(result[0].rating, null);
        assert.strictEqual(result[0].userRatingsTotal, null);
    });

    it('should handle elements with no address falling back to Unknown', async () => {
        const mockData = {
            elements: [
                {
                    type: 'node',
                    id: 111111,
                    lat: 40.7128,
                    lon: -74.0060,
                    tags: {
                        name: 'Mystery Restaurant'
                    }
                }
            ]
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].vicinity, 'Unknown');
    });

    it('should filter out elements without coordinates', async () => {
        const mockData = {
            elements: [
                {
                    type: 'relation',
                    id: 222222,
                    tags: {
                        name: 'No Coordinates Restaurant'
                    }
                },
                {
                    type: 'node',
                    id: 333333,
                    lat: 40.7128,
                    lon: -74.0060,
                    tags: {
                        name: 'Valid Restaurant'
                    }
                }
            ]
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'Valid Restaurant');
    });

    it('should return empty array when no elements found', async () => {
        const mockData = {
            elements: []
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(result.length, 0);
    });

    it('should return empty array when elements is not an array', async () => {
        const mockData = {
            elements: null
        };

        mockFetch.mockResponse = {
            ok: true,
            status: 200,
            json: async () => mockData
        };

        const result = await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(result.length, 0);
    });

    it('should throw error when API request fails', async () => {
        mockFetch.mockResponse = {
            ok: false,
            status: 500
        };

        await assert.rejects(
            async () => {
                await provider.findNearby(40.7128, -74.0060);
            },
            {
                name: 'Error',
                message: 'Overpass error: 500'
            }
        );
    });

    it('should handle network errors', async () => {
        mockFetch = async () => {
            throw new Error('Network error');
        };
        global.fetch = mockFetch;

        await assert.rejects(
            async () => {
                await provider.findNearby(40.7128, -74.0060);
            },
            {
                name: 'Error',
                message: 'Network error'
            }
        );
    });

    it('should construct proper query without keyword', async () => {
        let capturedOptions;
        mockFetch = async (url, options) => {
            capturedOptions = options;
            return {
                ok: true,
                status: 200,
                json: async () => ({ elements: [] })
            };
        };
        global.fetch = mockFetch;

        await provider.findNearby(40.7128, -74.0060, 1500);

        assert.ok(capturedOptions.body.includes('around%3A1500%2C40.7128%2C-74.006'));
        assert.ok(!capturedOptions.body.includes('%5B%22name%22%7E'));
    });

    it('should construct proper query with keyword', async () => {
        let capturedOptions;
        mockFetch = async (url, options) => {
            capturedOptions = options;
            return {
                ok: true,
                status: 200,
                json: async () => ({ elements: [] })
            };
        };
        global.fetch = mockFetch;

        await provider.findNearby(40.7128, -74.0060, 1000, 'sushi');

        assert.ok(capturedOptions.body.includes('%5B%22name%22~%22sushi%22%2Ci%5D'));
    });

    it('should use correct HTTP method and headers', async () => {
        let capturedUrl, capturedOptions;
        mockFetch = async (url, options) => {
            capturedUrl = url;
            capturedOptions = options;
            return {
                ok: true,
                status: 200,
                json: async () => ({ elements: [] })
            };
        };
        global.fetch = mockFetch;

        await provider.findNearby(40.7128, -74.0060);

        assert.strictEqual(capturedUrl, provider.baseUrl);
        assert.strictEqual(capturedOptions.method, 'POST');
        assert.strictEqual(capturedOptions.headers['Content-Type'], 'application/x-www-form-urlencoded');
    });
});