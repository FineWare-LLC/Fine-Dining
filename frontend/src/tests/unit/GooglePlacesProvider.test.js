import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Mock node-fetch before importing GooglePlacesProvider
let mockFetch;
let mockNodeFetch = async (url, options) => {
    if (mockNodeFetch.mockResponse) {
        return mockNodeFetch.mockResponse;
    }
    return {
        ok: true,
        status: 200,
        json: async () => ({ results: [] })
    };
};

// Set up the mock in global scope so the import can use it
global.fetch = mockNodeFetch;

import { GooglePlacesProvider } from '../../services/providers/GooglePlacesProvider.js';

describe('GooglePlacesProvider', () => {
    let provider;
    const validApiKey = 'AIzaSyBvalidApiKey123456789';

    beforeEach(() => {
        provider = new GooglePlacesProvider(validApiKey);
        mockFetch = mockNodeFetch;
        // Reset the mock function to ensure consistent behavior
        mockNodeFetch = async (url, options) => {
            if (mockNodeFetch.mockResponse) {
                return mockNodeFetch.mockResponse;
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({ results: [] })
            };
        };
        global.fetch = mockNodeFetch;
    });

    afterEach(() => {
        // Reset mock response only if it exists
        if (mockNodeFetch && typeof mockNodeFetch === 'function') {
            delete mockNodeFetch.mockResponse;
        }
        // Ensure global.fetch is pointing to our mock
        global.fetch = mockNodeFetch;
    });

    describe('constructor', () => {
        it('should initialize with API key', () => {
            const provider = new GooglePlacesProvider('test-api-key');
            assert.strictEqual(provider.apiKey, 'test-api-key');
        });

        it('should initialize with undefined API key', () => {
            const provider = new GooglePlacesProvider();
            assert.strictEqual(provider.apiKey, undefined);
        });
    });

    describe('isValidKey', () => {
        it('should return true for valid API key', () => {
            const provider = new GooglePlacesProvider('AIzaSyBvalidKey123');
            assert.strictEqual(provider.isValidKey(), true);
        });

        it('should return false for undefined API key', () => {
            const provider = new GooglePlacesProvider();
            assert.strictEqual(provider.isValidKey(), false);
        });

        it('should return false for null API key', () => {
            const provider = new GooglePlacesProvider(null);
            assert.strictEqual(provider.isValidKey(), false);
        });

        it('should return false for empty string API key', () => {
            const provider = new GooglePlacesProvider('');
            assert.strictEqual(provider.isValidKey(), false);
        });

        it('should return false for placeholder API key', () => {
            const provider = new GooglePlacesProvider('YOUR_GOOGLE_PLACES_API_KEY');
            assert.strictEqual(provider.isValidKey(), false);
        });

        it('should return false for API key containing YOUR_', () => {
            const provider = new GooglePlacesProvider('YOUR_API_KEY_HERE');
            assert.strictEqual(provider.isValidKey(), false);
        });

        it('should return false for API key containing PLACEHOLDER', () => {
            const provider = new GooglePlacesProvider('PLACEHOLDER_API_KEY');
            assert.strictEqual(provider.isValidKey(), false);
        });

        it('should return true for valid API key with mixed case', () => {
            const provider = new GooglePlacesProvider('AIzaSyBmixedCaseKey123456');
            assert.strictEqual(provider.isValidKey(), true);
        });
    });

    describe('findNearby', () => {
        it('should successfully call API with default parameters', async () => {
            let mockCalled = false;
            const originalMockNodeFetch = mockNodeFetch;
            mockNodeFetch = async (url, options) => {
                mockCalled = true;
                if (mockNodeFetch.mockResponse) {
                    return mockNodeFetch.mockResponse;
                }
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            // Preserve the mockResponse property
            mockNodeFetch.mockResponse = originalMockNodeFetch.mockResponse;
            global.fetch = mockNodeFetch;

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.ok(Array.isArray(result));
            assert.ok(mockCalled, 'Mock fetch should have been called');
        });

        it('should map place_id correctly', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest123',
                        name: 'Test Restaurant',
                        vicinity: '123 Main St',
                        geometry: { location: { lat: 40.7128, lng: -74.0060 } }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result[0].placeId, 'ChIJtest123');
        });

        it('should map restaurant name correctly', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest123',
                        name: 'Test Restaurant',
                        vicinity: '123 Main St',
                        geometry: { location: { lat: 40.7128, lng: -74.0060 } }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result[0].name, 'Test Restaurant');
        });

        it('should map vicinity correctly', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest123',
                        name: 'Test Restaurant',
                        vicinity: '123 Main St',
                        geometry: { location: { lat: 40.7128, lng: -74.0060 } }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result[0].vicinity, '123 Main St');
        });

        it('should map rating correctly', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest123',
                        name: 'Test Restaurant',
                        rating: 4.5,
                        geometry: { location: { lat: 40.7128, lng: -74.0060 } }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result[0].rating, 4.5);
        });

        it('should map user ratings total correctly', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest123',
                        name: 'Test Restaurant',
                        user_ratings_total: 100,
                        geometry: { location: { lat: 40.7128, lng: -74.0060 } }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result[0].userRatingsTotal, 100);
        });

        it('should map location coordinates correctly', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest123',
                        name: 'Test Restaurant',
                        geometry: {
                            location: {
                                lat: 40.7128,
                                lng: -74.0060
                            }
                        }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result[0].location.latitude, 40.7128);
            assert.strictEqual(result[0].location.longitude, -74.0060);
        });

        it('should include custom radius in URL', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby(40.7128, -74.0060, 2000);

            assert.ok(capturedUrl.includes('radius=2000'));
        });

        it('should include keyword in URL when provided', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby(40.7128, -74.0060, 1000, 'pizza');

            assert.ok(capturedUrl.includes('keyword=pizza'));
        });

        it('should include location coordinates in URL', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby(40.7128, -74.0060);

            assert.ok(capturedUrl.includes('location=40.7128%2C-74.006'));
        });

        it('should include restaurant type in URL', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby(40.7128, -74.0060);

            assert.ok(capturedUrl.includes('type=restaurant'));
        });

        it('should include API key in URL', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby(40.7128, -74.0060);

            assert.ok(capturedUrl.includes(`key=${validApiKey}`));
        });

        it('should handle places with formatted_address fallback', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest456',
                        name: 'Address Fallback Restaurant',
                        formatted_address: '456 Broadway, New York, NY',
                        geometry: {
                            location: {
                                lat: 40.7580,
                                lng: -73.9855
                            }
                        }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7580, -73.9855);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].vicinity, '456 Broadway, New York, NY');
        });

        it('should handle places with no address information', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest789',
                        name: 'No Address Restaurant',
                        geometry: {
                            location: {
                                lat: 40.7589,
                                lng: -73.9851
                            }
                        }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7589, -73.9851);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].vicinity, 'No address available');
        });

        it('should handle places with missing geometry', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest999',
                        name: 'No Geometry Restaurant',
                        vicinity: '999 Test St'
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].location.latitude, null);
            assert.strictEqual(result[0].location.longitude, null);
        });

        it('should handle places with partial geometry information', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest888',
                        name: 'Partial Geometry Restaurant',
                        vicinity: '888 Partial St',
                        geometry: {
                            location: {
                                lat: 40.7500
                                // lng missing
                            }
                        }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7500, -73.9800);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].location.latitude, 40.7500);
            assert.strictEqual(result[0].location.longitude, null);
        });

        it('should handle missing optional fields', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJtest777',
                        name: 'Minimal Restaurant',
                        vicinity: '777 Minimal St',
                        geometry: {
                            location: {
                                lat: 40.7200,
                                lng: -74.0100
                            }
                        }
                        // rating and user_ratings_total missing
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7200, -74.0100);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].rating, undefined);
            assert.strictEqual(result[0].userRatingsTotal, undefined);
        });

        it('should return empty array when no results found', async () => {
            const mockData = {
                results: []
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result.length, 0);
        });

        it('should return empty array when results is not an array', async () => {
            const mockData = {
                results: null
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result.length, 0);
        });

        it('should throw error when API request fails', async () => {
            mockNodeFetch.mockResponse = {
                ok: false,
                status: 400
            };

            await assert.rejects(
                async () => {
                    await provider.findNearby(40.7128, -74.0060);
                },
                {
                    name: 'Error',
                    message: 'Google Places API error: 400'
                }
            );
        });

        it('should throw error for 401 unauthorized', async () => {
            mockNodeFetch.mockResponse = {
                ok: false,
                status: 401
            };

            await assert.rejects(
                async () => {
                    await provider.findNearby(40.7128, -74.0060);
                },
                {
                    name: 'Error',
                    message: 'Google Places API error: 401'
                }
            );
        });

        it('should throw error for 403 forbidden', async () => {
            mockNodeFetch.mockResponse = {
                ok: false,
                status: 403
            };

            await assert.rejects(
                async () => {
                    await provider.findNearby(40.7128, -74.0060);
                },
                {
                    name: 'Error',
                    message: 'Google Places API error: 403'
                }
            );
        });

        it('should handle network errors', async () => {
            mockNodeFetch = async () => {
                throw new Error('Network error');
            };
            global.fetch = mockNodeFetch;

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

        it('should construct correct URL without keyword', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby(40.7128, -74.0060, 1500);

            assert.ok(capturedUrl.includes('https://maps.googleapis.com/maps/api/place/nearbysearch/json'));
            assert.ok(capturedUrl.includes('location=40.7128%2C-74.006'));
            assert.ok(capturedUrl.includes('radius=1500'));
            assert.ok(capturedUrl.includes('type=restaurant'));
            assert.ok(capturedUrl.includes(`key=${validApiKey}`));
            assert.ok(!capturedUrl.includes('keyword='));
        });

        it('should handle multiple results', async () => {
            const mockData = {
                results: [
                    {
                        place_id: 'ChIJfirst',
                        name: 'First Restaurant',
                        vicinity: 'First Street',
                        rating: 4.0,
                        geometry: { location: { lat: 40.1, lng: -74.1 } }
                    },
                    {
                        place_id: 'ChIJsecond',
                        name: 'Second Restaurant',
                        vicinity: 'Second Street',
                        rating: 5.0,
                        geometry: { location: { lat: 40.2, lng: -74.2 } }
                    }
                ]
            };

            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => mockData
            };

            const result = await provider.findNearby(40.7128, -74.0060);

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].name, 'First Restaurant');
            assert.strictEqual(result[1].name, 'Second Restaurant');
        });

        it('should handle JSON parsing errors', async () => {
            mockNodeFetch.mockResponse = {
                ok: true,
                status: 200,
                json: async () => {
                    throw new Error('Invalid JSON');
                }
            };

            await assert.rejects(
                async () => {
                    await provider.findNearby(40.7128, -74.0060);
                },
                {
                    name: 'Error',
                    message: 'Invalid JSON'
                }
            );
        });

        it('should handle coordinates as strings', async () => {
            let capturedUrl;
            mockNodeFetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ results: [] })
                };
            };
            global.fetch = mockNodeFetch;

            await provider.findNearby('40.7128', '-74.0060');

            assert.ok(capturedUrl.includes('location=40.7128%2C-74.006'));
        });
    });
});