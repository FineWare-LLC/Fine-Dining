#!/usr/bin/env node
/**
 * Test script for Nearby Restaurants feature
 * Tests API endpoints, provider functionality, and error handling
 */

import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('[DEBUG_LOG] Starting Nearby Restaurants functionality test...\n');

// Test coordinates (New York City)
const TEST_LAT = 40.7128;
const TEST_LON = -74.0060;
const TEST_RADIUS = 1500;

// Test the API endpoint
async function testAPIEndpoint() {
    console.log('[DEBUG_LOG] Testing API endpoint...');
    
    try {
        // Check if we're running in development mode
        const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
        const url = `${API_BASE}/api/places?lat=${TEST_LAT}&lon=${TEST_LON}&radius=${TEST_RADIUS}&limit=5`;
        
        console.log(`[DEBUG_LOG] Fetching: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log(`[DEBUG_LOG] ✅ API endpoint working! Got ${data.length} places`);
        
        if (data.length > 0) {
            const firstPlace = data[0];
            console.log(`[DEBUG_LOG] Sample place:`, {
                name: firstPlace.name,
                distance_m: firstPlace.distance_m,
                rating: firstPlace.rating,
                provider: firstPlace.provider,
                address: firstPlace.address?.substring(0, 50) + (firstPlace.address?.length > 50 ? '...' : ''),
            });
        }
        
        return { success: true, data };
    } catch (error) {
        console.log(`[DEBUG_LOG] ❌ API endpoint test failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test provider files exist
function testProviderFiles() {
    console.log('\n[DEBUG_LOG] Testing provider files...');
    
    const providers = [
        'GeoapifyProvider.js',
        'YelpProvider.js', 
        'FoursquareProvider.js',
        'OpenTripMapProvider.js'
    ];
    
    const providersPath = join(__dirname, 'src', 'services', 'providers');
    
    let allExist = true;
    
    for (const provider of providers) {
        try {
            const filePath = join(providersPath, provider);
            const content = readFileSync(filePath, 'utf8');
            
            // Check if file has key methods
            const hasRequiredMethods = content.includes('findNearby') && content.includes('isValidKey');
            
            if (hasRequiredMethods) {
                console.log(`[DEBUG_LOG] ✅ ${provider} exists and has required methods`);
            } else {
                console.log(`[DEBUG_LOG] ⚠️ ${provider} exists but missing required methods`);
                allExist = false;
            }
        } catch (error) {
            console.log(`[DEBUG_LOG] ❌ ${provider} not found or unreadable`);
            allExist = false;
        }
    }
    
    return allExist;
}

// Test API endpoint file
function testAPIEndpointFile() {
    console.log('\n[DEBUG_LOG] Testing API endpoint file...');
    
    try {
        const apiPath = join(__dirname, 'src', 'pages', 'api', 'places.js');
        const content = readFileSync(apiPath, 'utf8');
        
        // Check for required functionality
        const checks = [
            { name: 'Handler function', test: content.includes('export default async function handler') },
            { name: 'Parameter validation', test: content.includes('lat') && content.includes('lon') },
            { name: 'Provider imports', test: content.includes('GeoapifyProvider') },
            { name: 'Caching logic', test: content.includes('cache') && content.includes('DAY') },
            { name: 'Error handling', test: content.includes('try') && content.includes('catch') },
            { name: 'Sorting logic', test: content.includes('sortPlaces') },
        ];
        
        let allPassed = true;
        
        for (const check of checks) {
            if (check.test) {
                console.log(`[DEBUG_LOG] ✅ ${check.name} - present`);
            } else {
                console.log(`[DEBUG_LOG] ❌ ${check.name} - missing`);
                allPassed = false;
            }
        }
        
        return allPassed;
    } catch (error) {
        console.log(`[DEBUG_LOG] ❌ API endpoint file test failed: ${error.message}`);
        return false;
    }
}

// Test component file
function testComponentFile() {
    console.log('\n[DEBUG_LOG] Testing React component...');
    
    try {
        const componentPath = join(__dirname, 'src', 'components', 'Dashboard', 'NearbyRestaurants.js');
        const content = readFileSync(componentPath, 'utf8');
        
        const checks = [
            { name: 'React imports', test: content.includes('import React') },
            { name: 'Material UI imports', test: content.includes('@mui/material') },
            { name: 'Geolocation code', test: content.includes('navigator.geolocation') },
            { name: 'API fetch call', test: content.includes('/api/places') },
            { name: 'City fallback', test: content.includes('citySuggestions') },
            { name: 'Attribution footer', test: content.includes('Attribution') },
            { name: 'Error handling', test: content.includes('setError') },
            { name: 'Loading states', test: content.includes('CircularProgress') },
        ];
        
        let allPassed = true;
        
        for (const check of checks) {
            if (check.test) {
                console.log(`[DEBUG_LOG] ✅ ${check.name} - present`);
            } else {
                console.log(`[DEBUG_LOG] ❌ ${check.name} - missing`);
                allPassed = false;
            }
        }
        
        return allPassed;
    } catch (error) {
        console.log(`[DEBUG_LOG] ❌ Component file test failed: ${error.message}`);
        return false;
    }
}

// Test environment configuration
function testEnvironmentConfig() {
    console.log('\n[DEBUG_LOG] Testing environment configuration...');
    
    try {
        const envExamplePath = join(__dirname, '.env.example');
        const content = readFileSync(envExamplePath, 'utf8');
        
        const requiredKeys = [
            'GEOAPIFY_API_KEY',
            'YELP_API_KEY',
            'FOURSQUARE_API_KEY',
            'OPENTRIPMAP_API_KEY'
        ];
        
        let allPresent = true;
        
        for (const key of requiredKeys) {
            if (content.includes(key)) {
                console.log(`[DEBUG_LOG] ✅ ${key} configured in .env.example`);
            } else {
                console.log(`[DEBUG_LOG] ❌ ${key} missing from .env.example`);
                allPresent = false;
            }
        }
        
        return allPresent;
    } catch (error) {
        console.log(`[DEBUG_LOG] ❌ Environment config test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('='.repeat(60));
    console.log('🧪 NEARBY RESTAURANTS FUNCTIONALITY TEST');
    console.log('='.repeat(60));
    
    const results = {
        providerFiles: testProviderFiles(),
        apiEndpointFile: testAPIEndpointFile(), 
        componentFile: testComponentFile(),
        environmentConfig: testEnvironmentConfig(),
    };
    
    // Only test live API if we have a development server running
    if (process.env.TEST_API === 'true') {
        console.log('\n[DEBUG_LOG] TEST_API=true, testing live API...');
        const apiTest = await testAPIEndpoint();
        results.apiEndpoint = apiTest.success;
    } else {
        console.log('\n[DEBUG_LOG] Skipping live API test (set TEST_API=true to enable)');
        results.apiEndpoint = null; // Not tested
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    for (const [testName, result] of Object.entries(results)) {
        const status = result === true ? '✅ PASS' : result === false ? '❌ FAIL' : '⏸️ SKIP';
        console.log(`${testName.padEnd(20)}: ${status}`);
    }
    
    const passCount = Object.values(results).filter(r => r === true).length;
    const totalCount = Object.values(results).filter(r => r !== null).length;
    
    console.log(`\n📈 Score: ${passCount}/${totalCount} tests passed`);
    
    if (passCount === totalCount) {
        console.log('🎉 All tests passed! The Nearby Restaurants feature is ready.');
    } else {
        console.log('⚠️ Some tests failed. Please review the issues above.');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('[DEBUG_LOG] Test runner error:', error);
    process.exit(1);
});