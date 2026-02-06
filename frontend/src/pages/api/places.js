/**
 * GET /api/places?lat=..&lon=..&radius=..
 * Primary: Geoapify. Fallback: Yelp then Foursquare then OpenTripMap.
 * Simple memory cache with 24 h TTL. Replace with Redis in prod.
 */
import crypto from "node:crypto";
import { GeoapifyProvider } from "../../services/providers/GeoapifyProvider.js";
import { YelpProvider } from "../../services/providers/YelpProvider.js";
import { FoursquareProvider } from "../../services/providers/FoursquareProvider.js";
import { OpenTripMapProvider } from "../../services/providers/OpenTripMapProvider.js";

// Initialize providers
const geoapify = new GeoapifyProvider(process.env.GEOAPIFY_API_KEY);
const yelp = new YelpProvider(process.env.YELP_API_KEY);
const foursquare = new FoursquareProvider(process.env.FOURSQUARE_API_KEY);
const opentripmap = new OpenTripMapProvider(process.env.OPENTRIPMAP_API_KEY);

// Simple in-memory cache (replace with Redis in production)
const cache = new Map();
const DAY = 86_400_000; // 24 hours in milliseconds

function cacheKey(query) {
    const { lat, lon, radius_m = 1500, limit = 20 } = query;
    return crypto.createHash("sha1").update(`${lat},${lon},${radius_m},${limit}`).digest("hex");
}

function sortPlaces(places) {
    // Sort by rating (desc) then by distance (asc) as per requirements
    return places.sort((a, b) => {
        // Places with rating come first
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        
        // If both have ratings or both don't have ratings, sort by rating desc, then distance asc
        if (a.rating && b.rating) {
            const ratingDiff = b.rating - a.rating;
            if (ratingDiff !== 0) return ratingDiff;
        }
        
        // Then by distance ascending
        return a.distance_m - b.distance_m;
    });
}

function generateDemoRestaurants(lat, lon, radius, limit) {
    const demoRestaurants = [
        { name: "Giuseppe's Italian Bistro", rating: 4.5, categories: ["Italian", "Fine Dining"], price: "$$" },
        { name: "Dragon Palace", rating: 4.2, categories: ["Chinese", "Asian"], price: "$" },
        { name: "The Burger Joint", rating: 4.0, categories: ["American", "Burgers"], price: "$" },
        { name: "Sakura Sushi", rating: 4.7, categories: ["Japanese", "Sushi"], price: "$$$" },
        { name: "Café Central", rating: 4.1, categories: ["Café", "Coffee"], price: "$" },
        { name: "Mumbai Kitchen", rating: 4.3, categories: ["Indian", "Curry"], price: "$$" },
        { name: "Taco Loco", rating: 3.9, categories: ["Mexican", "Tacos"], price: "$" },
        { name: "Le Petit Français", rating: 4.6, categories: ["French", "Fine Dining"], price: "$$$" },
        { name: "Pizza Corner", rating: 3.8, categories: ["Pizza", "Italian"], price: "$" },
        { name: "Thai Garden", rating: 4.4, categories: ["Thai", "Asian"], price: "$$" }
    ];
    
    return demoRestaurants.slice(0, limit).map((restaurant, index) => {
        // Generate random distances within radius
        const distance = Math.floor(Math.random() * radius) + 100;
        // Generate slight coordinate variations for demo
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lonOffset = (Math.random() - 0.5) * 0.01;
        
        return {
            id: `demo-${index}`,
            name: restaurant.name,
            lat: lat + latOffset,
            lon: lon + lonOffset,
            distance_m: distance,
            rating: restaurant.rating,
            price: restaurant.price,
            open_now: Math.random() > 0.3, // 70% chance of being open
            provider: "demo",
            address: "Demo Address (API keys required for real data)",
            categories: restaurant.categories,
        };
    });
}

async function getNearbyRestaurants(query) {
    const key = cacheKey(query);
    const hit = cache.get(key);
    
    // Check cache first (24h TTL)
    if (hit && Date.now() - hit.at < DAY) {
        return { ...hit.data, cached: true };
    }

    const { lat, lon, radius_m = 1500, limit = 20 } = query;
    
    // Provider chain: Geoapify -> Yelp -> Foursquare -> OpenTripMap
    const providers = [
        { name: 'geoapify', instance: geoapify },
        { name: 'yelp', instance: yelp },
        { name: 'foursquare', instance: foursquare },
        { name: 'opentripmap', instance: opentripmap }
    ];

    for (const provider of providers) {
        if (!provider.instance.isValidKey()) {
            console.warn(`${provider.name} API key not valid, skipping`);
            continue;
        }

        try {
            const places = await provider.instance.findNearby(lat, lon, radius_m, '');
            
            if (places && places.length > 0) {
                // Sort and limit results
                const sortedPlaces = sortPlaces(places).slice(0, limit);
                
                const result = {
                    places: sortedPlaces,
                    source: provider.name,
                    cached: false
                };
                
                // Cache successful results
                cache.set(key, { at: Date.now(), data: result });
                return result;
            }
        } catch (error) {
            console.warn(`${provider.name} provider failed:`, error.message);
            // Continue to next provider
        }
    }

    // If all providers fail, try to return cached data even if older than 24h
    if (hit) {
        console.warn('All providers failed, returning stale cache data');
        return { ...hit.data, cached: true, stale: true };
    }

    // Final fallback - demo mode with mock data
    console.warn('All providers failed, returning demo restaurant data');
    const demoPlaces = generateDemoRestaurants(lat, lon, radius_m, limit);
    
    const demoResult = {
        places: sortPlaces(demoPlaces).slice(0, limit),
        source: 'demo',
        cached: false
    };
    
    // Cache demo results for consistency
    cache.set(key, { at: Date.now(), data: demoResult });
    return demoResult;
}

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse and validate query parameters
        const { lat, lon, radius, limit } = req.query;

        // Validate required parameters
        if (!lat || !lon) {
            return res.status(400).json({ 
                error: 'Missing required parameters: lat and lon' 
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const radius_m = radius ? parseInt(radius, 10) : 1500;
        const resultLimit = limit ? parseInt(limit, 10) : 20;

        // Validate parameter ranges
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            return res.status(400).json({ 
                error: 'Invalid latitude: must be between -90 and 90' 
            });
        }

        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            return res.status(400).json({ 
                error: 'Invalid longitude: must be between -180 and 180' 
            });
        }

        if (radius_m < 100 || radius_m > 50000) {
            return res.status(400).json({ 
                error: 'Invalid radius: must be between 100 and 50000 meters' 
            });
        }

        if (resultLimit < 1 || resultLimit > 50) {
            return res.status(400).json({ 
                error: 'Invalid limit: must be between 1 and 50' 
            });
        }

        const query = {
            lat: latitude,
            lon: longitude,
            radius_m,
            limit: resultLimit
        };

        // Get results from providers
        const result = await getNearbyRestaurants(query);

        // Set appropriate cache headers
        if (result.cached) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for cached
        } else {
            res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute for fresh
        }

        // Return results
        res.status(200).json(result.places);

    } catch (error) {
        console.error('Places API error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}