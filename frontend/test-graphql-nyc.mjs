import fetch from 'node-fetch';

async function testGraphQLWithNYC() {
    console.log('Testing GraphQL endpoint with NYC coordinates...');
    
    const query = `
        query FindNearbyRestaurants($latitude: Float!, $longitude: Float!, $radius: Int!) {
            findNearbyRestaurants(latitude: $latitude, longitude: $longitude, radius: $radius) {
                source
                restaurants {
                    placeId
                    name
                    vicinity
                    rating
                    userRatingsTotal
                    location {
                        latitude
                        longitude
                    }
                }
            }
        }
    `;
    
    // NYC coordinates (Times Square area)
    const variables = {
        latitude: 40.7580,
        longitude: -73.9855,
        radius: 1500
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            })
        });
        
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            return;
        }
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            return;
        }
        
        console.log('GraphQL Response:', {
            source: result.data.findNearbyRestaurants.source,
            restaurantCount: result.data.findNearbyRestaurants.restaurants.length,
            restaurants: result.data.findNearbyRestaurants.restaurants.slice(0, 3)
        });
        
        if (result.data.findNearbyRestaurants.restaurants.length === 0) {
            console.log('No restaurants found in NYC - this might indicate an API key issue');
        } else {
            console.log('✅ Restaurant loading is working correctly!');
        }
        
    } catch (error) {
        console.error('Error testing GraphQL endpoint:', error.message);
    }
}

testGraphQLWithNYC();