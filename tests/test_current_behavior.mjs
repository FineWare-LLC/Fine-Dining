/**
 * Test script to reproduce the current restaurant fetching behavior
 * and demonstrate the issue with non-local restaurants being returned
 */
import { findNearbyRestaurants } from './frontend/src/services/places.service.js';

async function testCurrentBehavior() {
    console.log('=== Testing Current Restaurant Fetching Behavior ===\n');
    
    // Test with coordinates in NYC (high density area with many chains)
    const locations = [
        { name: 'Times Square, NYC', lat: 40.7589, lon: -73.9851 },
        { name: 'Newport, TN', lat: 35.968, lon: -83.187 },
    ];
    
    for (const location of locations) {
        console.log(`\n--- Testing location: ${location.name} ---`);
        console.log(`Coordinates: ${location.lat}, ${location.lon}`);
        
        try {
            const result = await findNearbyRestaurants(location.lat, location.lon, 1000);
            
            console.log(`Data source: ${result.source}`);
            console.log(`Total restaurants found: ${result.restaurants.length}`);
            
            if (result.restaurants.length > 0) {
                console.log('\nFirst 10 restaurants:');
                result.restaurants.slice(0, 10).forEach((restaurant, index) => {
                    console.log(`${index + 1}. ${restaurant.name}`);
                    if (restaurant.vicinity) {
                        console.log(`   Address: ${restaurant.vicinity}`);
                    }
                    if (restaurant.rating) {
                        console.log(`   Rating: ${restaurant.rating} (${restaurant.userRatingsTotal || 0} reviews)`);
                    }
                    console.log();
                });
                
                // Analyze results to identify chain vs local restaurants
                const chainKeywords = [
                    'McDonald\'s', 'Burger King', 'KFC', 'Subway', 'Pizza Hut', 'Domino\'s',
                    'Taco Bell', 'Wendy\'s', 'Starbucks', 'Dunkin\'', 'Tim Hortons',
                    'Applebee\'s', 'Chili\'s', 'TGI Friday\'s', 'Olive Garden', 'Red Lobster',
                    'Panera', 'Chipotle', 'Five Guys', 'In-N-Out', 'White Castle'
                ];
                
                const likelyChains = result.restaurants.filter(restaurant => {
                    return chainKeywords.some(chain => 
                        restaurant.name.toLowerCase().includes(chain.toLowerCase())
                    );
                });
                
                console.log(`\nAnalysis:`);
                console.log(`- Likely chain restaurants: ${likelyChains.length}`);
                console.log(`- Likely local restaurants: ${result.restaurants.length - likelyChains.length}`);
                console.log(`- Percentage of chains: ${((likelyChains.length / result.restaurants.length) * 100).toFixed(1)}%`);
                
                if (likelyChains.length > 0) {
                    console.log('\nDetected chain restaurants:');
                    likelyChains.forEach(chain => console.log(`- ${chain.name}`));
                }
            }
            
        } catch (error) {
            console.error(`Error testing ${location.name}:`, error.message);
        }
        
        console.log('\n' + '='.repeat(80));
    }
    
    console.log('\n=== ISSUE SUMMARY ===');
    console.log('The current implementation returns ALL restaurants without filtering for truly local establishments.');
    console.log('This includes major chains, franchises, and corporate restaurants.');
    console.log('Users requesting "true local restaurants" are getting mixed results with many non-local options.');
}

testCurrentBehavior().catch(console.error);