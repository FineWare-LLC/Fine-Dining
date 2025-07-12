/**
 * Geolocation utility for handling browser geolocation with fallback
 * Centralizes geolocation logic to prevent duplication and improve maintainability
 */

// Default fallback coordinates (Newport, TN)
const DEFAULT_COORDINATES = {
    latitude: 35.968,
    longitude: -83.187,
};

/**
 * Get user's current position with fallback to default coordinates
 * @param {Object} options - Geolocation options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {number} options.maximumAge - Maximum age of cached position (default: 300000)
 * @param {boolean} options.enableHighAccuracy - Enable high accuracy (default: false)
 * @returns {Promise<{latitude: number, longitude: number, source: string}>}
 */
export const getCurrentPosition = (options = {}) => {
    const defaultOptions = {
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: false,
        ...options,
    };

    return new Promise((resolve) => {
    // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported — using default coordinates');
            resolve({
                ...DEFAULT_COORDINATES,
                source: 'fallback',
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    source: 'geolocation',
                });
            },
            (error) => {
                console.warn('Geolocation error — falling back to default coordinates:', error.message);
                resolve({
                    ...DEFAULT_COORDINATES,
                    source: 'fallback',
                });
            },
            defaultOptions,
        );
    });
};

/**
 * Get coordinates for restaurant search with caching
 * Uses sessionStorage to cache coordinates for the session
 * @param {boolean} forceRefresh - Force refresh of cached coordinates
 * @returns {Promise<{latitude: number, longitude: number, source: string}>}
 */
export const getRestaurantSearchCoordinates = async (forceRefresh = false) => {
    const cacheKey = 'fine-dining-coordinates';
    const cacheTimeKey = 'fine-dining-coordinates-time';
    const cacheMaxAge = 300000; // 5 minutes

    // Check cache if not forcing refresh
    if (!forceRefresh) {
        try {
            const cachedCoords = sessionStorage.getItem(cacheKey);
            const cacheTime = sessionStorage.getItem(cacheTimeKey);

            if (cachedCoords && cacheTime) {
                const age = Date.now() - parseInt(cacheTime, 10);
                if (age < cacheMaxAge) {
                    return JSON.parse(cachedCoords);
                }
            }
        } catch (error) {
            console.warn('Error reading cached coordinates:', error);
        }
    }

    // Get fresh coordinates
    const coordinates = await getCurrentPosition();

    // Cache the coordinates
    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(coordinates));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (error) {
        console.warn('Error caching coordinates:', error);
    }

    return coordinates;
};

/**
 * Clear cached coordinates
 * Useful for testing or when user wants to refresh location
 */
export const clearCoordinatesCache = () => {
    try {
        sessionStorage.removeItem('fine-dining-coordinates');
        sessionStorage.removeItem('fine-dining-coordinates-time');
    } catch (error) {
        console.warn('Error clearing coordinates cache:', error);
    }
};

/**
 * Check if coordinates are the default fallback coordinates
 * @param {Object} coordinates - Coordinates to check
 * @returns {boolean} - True if coordinates are default fallback
 */
export const isDefaultCoordinates = (coordinates) => {
    return (
        coordinates.latitude === DEFAULT_COORDINATES.latitude &&
    coordinates.longitude === DEFAULT_COORDINATES.longitude
    );
};