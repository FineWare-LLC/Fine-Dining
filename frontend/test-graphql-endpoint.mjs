import fetch from 'node-fetch';

async function testGraphQLEndpoint() {
    console.log('Testing GraphQL endpoint for findNearbyRestaurants...');
    
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
    
    const variables = {
        latitude: 35.968,
        longitude: -83.187,
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
            const text = await response.text();
            console.error('Response body:', text);
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
            console.error('No restaurants returned from GraphQL endpoint');
        } else {
            console.log('✅ GraphQL endpoint working correctly');
        }
        
    } catch (error) {
        console.error('Error testing GraphQL endpoint:', error.message);
        console.error('Make sure the development server is running with: npm run dev');
    }
}

testGraphQLEndpoint();