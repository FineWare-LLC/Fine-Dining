import { findNearbyRestaurants } from './frontend/src/services/places.service.js';

async function testRestaurantLoading() {
    console.log('Testing restaurant loading...');
    
    // Test coordinates (Newport, TN - the default fallback)
    const lat = 35.968;
    const lon = -83.187;
    const radius = 1500;
    
    try {
        console.log(`Searching for restaurants near ${lat}, ${lon} within ${radius}m`);
        const result = await findNearbyRestaurants(lat, lon, radius);
        
        console.log('Result:', {
            source: result.source,
            restaurantCount: result.restaurants.length,
            restaurants: result.restaurants.slice(0, 3) // Show first 3 restaurants
        });
        
        if (result.restaurants.length === 0) {
            console.error('No restaurants found - this explains the "Failed to load nearby restaurants" error');
        } else {
            console.log('Restaurants loaded successfully');
        }
        
    } catch (error) {
        console.error('Error loading restaurants:', error.message);
        console.error('This is likely the cause of the "Failed to load nearby restaurants" error');
    }
}

testRestaurantLoading();