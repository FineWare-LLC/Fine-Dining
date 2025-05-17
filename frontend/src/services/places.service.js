export async function findNearbyRestaurants(latitude, longitude, radius = 1000, keyword = '') {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not defined');
  }

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
    throw new Error(`Google Places API error: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data.results)) return [];
  return data.results.map((place) => ({
    placeId: place.place_id,
    name: place.name,
    vicinity: place.vicinity,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    location: {
      latitude: place.geometry?.location?.lat ?? null,
      longitude: place.geometry?.location?.lng ?? null,
    },
  }));
}
