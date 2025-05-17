export async function findNearbyRestaurants(latitude, longitude, radius = 1000, keyword = '') {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Check if API key is valid (not empty and not a placeholder)
  const isValidApiKey = apiKey && 
    apiKey !== 'YOUR_GOOGLE_PLACES_API_KEY' && 
    !apiKey.includes('YOUR_') && 
    !apiKey.includes('PLACEHOLDER');

  // If API key is missing or invalid, return mock data
  if (!isValidApiKey) {
    console.warn('GOOGLE_PLACES_API_KEY is not properly configured. Using mock data instead.');
    return getMockRestaurants(latitude, longitude, keyword);
  }

  try {
    const params = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: String(radius),
      type: 'restaurant',
      key: apiKey
    });
    if (keyword) params.set('keyword', keyword);

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Google Places API error: ${res.status}`);
      return getMockRestaurants(latitude, longitude, keyword);
    }

    const data = await res.json();

    if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
      console.error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      return getMockRestaurants(latitude, longitude, keyword);
    }

    if (!Array.isArray(data.results)) return [];

    return data.results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      vicinity: place.vicinity || place.formatted_address || 'No address available',
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      location: {
        latitude: place.geometry?.location?.lat ?? null,
        longitude: place.geometry?.location?.lng ?? null,
      },
    }));
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    return getMockRestaurants(latitude, longitude, keyword);
  }
}

// Function to generate mock restaurant data
function getMockRestaurants(latitude, longitude, keyword = '') {
  const mockRestaurants = [
    {
      placeId: 'mock-place-1',
      name: 'Fine Dining Restaurant',
      vicinity: '123 Main St, Anytown, USA',
      rating: 4.7,
      userRatingsTotal: 253,
      location: { latitude: latitude + 0.01, longitude: longitude - 0.01 }
    },
    {
      placeId: 'mock-place-2',
      name: 'Gourmet Cafe',
      vicinity: '456 Oak Ave, Anytown, USA',
      rating: 4.5,
      userRatingsTotal: 187,
      location: { latitude: latitude - 0.01, longitude: longitude + 0.01 }
    },
    {
      placeId: 'mock-place-3',
      name: 'Delicious Bistro',
      vicinity: '789 Pine Blvd, Anytown, USA',
      rating: 4.3,
      userRatingsTotal: 142,
      location: { latitude: latitude + 0.02, longitude: longitude + 0.02 }
    },
    {
      placeId: 'mock-place-4',
      name: 'Tasty Eats',
      vicinity: '321 Maple Dr, Anytown, USA',
      rating: 4.1,
      userRatingsTotal: 98,
      location: { latitude: latitude - 0.02, longitude: longitude - 0.02 }
    }
  ];

  // Filter by keyword if provided
  if (keyword && keyword.trim() !== '') {
    const lowercaseKeyword = keyword.toLowerCase();
    return mockRestaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(lowercaseKeyword)
    );
  }

  return mockRestaurants;
}
