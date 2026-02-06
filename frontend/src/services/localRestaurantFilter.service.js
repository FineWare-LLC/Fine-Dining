/**
 * Local Restaurant Filter Service
 * Provides advanced filtering to identify and prioritize truly local restaurants
 * over chains, franchises, and corporate establishments.
 */

/**
 * Comprehensive list of chain restaurant names and patterns
 * This includes major fast food, casual dining, and corporate restaurant chains
 */
const CHAIN_RESTAURANT_PATTERNS = [
    // Fast Food Chains
    'McDonald\'s', 'Burger King', 'KFC', 'Subway', 'Pizza Hut', 'Domino\'s',
    'Taco Bell', 'Wendy\'s', 'White Castle', 'Arby\'s', 'Hardee\'s', 'Carl\'s Jr',
    'Jack in the Box', 'Sonic Drive-In', 'Dairy Queen', 'A&W', 'Long John Silver\'s',
    'Popeyes', 'Church\'s Chicken', 'Bojangles', 'Culver\'s', 'Whataburger',
    'In-N-Out', 'Five Guys', 'Shake Shack', 'Chipotle', 'Qdoba', 'Moe\'s',
    
    // Coffee Chains
    'Starbucks', 'Dunkin\'', 'Tim Hortons', 'Caribou Coffee', 'Peet\'s Coffee',
    'Coffee Bean', 'Second Cup', 'Gloria Jean\'s',
    
    // Casual Dining Chains
    'Applebee\'s', 'Chili\'s', 'TGI Friday\'s', 'Olive Garden', 'Red Lobster',
    'Outback Steakhouse', 'Texas Roadhouse', 'LongHorn Steakhouse', 'Cracker Barrel',
    'Denny\'s', 'IHOP', 'Perkins', 'Village Inn', 'Friendly\'s', 'Big Boy',
    'Ruby Tuesday', 'Red Robin', 'Buffalo Wild Wings', 'Hooters', 'Twin Peaks',
    
    // Fast Casual
    'Panera', 'Panera Bread', 'Chipotle Mexican Grill', 'Panda Express', 'Noodles',
    'Jimmy John\'s', 'Jersey Mike\'s', 'Firehouse Subs', 'Blimpie', 'Quiznos',
    'Potbelly', 'Which Wich', 'Cousins Subs', 'Capriotti\'s',
    
    // Pizza Chains
    'Papa John\'s', 'Papa Murphy\'s', 'Little Caesars', 'Godfather\'s Pizza',
    'Casey\'s', 'Papa Gino\'s', 'Sbarro', 'Blaze Pizza', 'MOD Pizza',
    
    // International Chains
    'Panda Express', 'Pei Wei', 'Pick Up Stix', 'Pf Chang\'s', 'Benihana',
    'Cheesecake Factory', 'California Pizza Kitchen', 'BJ\'s Restaurant',
    
    // Regional but still chains
    'White Castle', 'Krystal', 'Culver\'s', 'Portillo\'s', 'Whataburger',
    'Cook Out', 'Zaxby\'s', 'Raising Cane\'s', 'El Pollo Loco', 'Wingstop'
];

/**
 * Patterns that indicate a local restaurant (positive indicators)
 */
const LOCAL_RESTAURANT_INDICATORS = [
    // Common local restaurant naming patterns
    /family/i,
    /mom.*pop/i,
    /home.*made/i,
    /authentic/i,
    /traditional/i,
    /original/i,
    /since\s+\d{4}/i, // "Since 1952" etc.
    /est\.\s+\d{4}/i, // "Est. 1952" etc.
    /founded\s+\d{4}/i,
    /'s\s+(cafe|restaurant|kitchen|grill|bistro|eatery)/i, // "Joe's Cafe", "Maria's Kitchen"
    /& sons?/i, // "Johnson & Sons"
    /& daughters?/i,
    /bros?\./i, // "Tony Bros."
    /brothers/i,
    /sisters/i
];

/**
 * Corporate website patterns that indicate chain restaurants
 */
const CORPORATE_WEBSITE_PATTERNS = [
    /\.com$/,
    /franchise/i,
    /corporate/i,
    /locations/i,
    /chain/i
];

/**
 * Checks if a restaurant name matches known chain patterns
 * @param {string} name - Restaurant name to check
 * @returns {boolean} True if it's likely a chain restaurant
 */
function isChainRestaurant(name) {
    if (!name) return false;
    
    const normalizedName = name.trim().toLowerCase();
    
    return CHAIN_RESTAURANT_PATTERNS.some(pattern => {
        const normalizedPattern = pattern.toLowerCase();
        
        // Exact match
        if (normalizedName === normalizedPattern) return true;
        
        // Contains match with word boundaries
        const regex = new RegExp(`\\b${normalizedPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(name);
    });
}

/**
 * Calculates a "local score" for a restaurant based on various factors
 * Higher score = more likely to be a truly local establishment
 * @param {object} restaurant - Restaurant object with name, vicinity, website, etc.
 * @returns {number} Local score (0-100, higher is more local)
 */
function calculateLocalScore(restaurant) {
    let score = 50; // Base score
    
    const name = restaurant.name || '';
    const vicinity = restaurant.vicinity || '';
    const website = restaurant.website || '';
    
    // Penalty for being a known chain
    if (isChainRestaurant(name)) {
        score -= 40;
    }
    
    // Bonus for local indicators in name
    LOCAL_RESTAURANT_INDICATORS.forEach(pattern => {
        if (pattern.test(name)) {
            score += 15;
        }
    });
    
    // Bonus for having a local/personal sounding name
    if (/'s\s/i.test(name)) { // "Joe's", "Maria's", etc.
        score += 10;
    }
    
    // Bonus for not having a corporate website
    if (website && !CORPORATE_WEBSITE_PATTERNS.some(pattern => pattern.test(website))) {
        score += 10;
    }
    
    // Penalty for having a corporate-sounding website
    if (website && CORPORATE_WEBSITE_PATTERNS.some(pattern => pattern.test(website))) {
        score -= 15;
    }
    
    // Bonus for unique/creative names (less likely to be chains)
    if (name.length > 3 && !/\d/.test(name) && !/(restaurant|cafe|grill|bar)$/i.test(name)) {
        score += 5;
    }
    
    // Penalty for generic names common in chains
    if (/(restaurant|grill|express|plus|stop|mart)$/i.test(name)) {
        score -= 5;
    }
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
}

/**
 * Filters and sorts restaurants to prioritize truly local establishments
 * @param {Array} restaurants - Array of restaurant objects
 * @param {object} options - Filtering options
 * @param {number} options.minLocalScore - Minimum local score to include (default: 30)
 * @param {boolean} options.excludeChains - Whether to completely exclude known chains (default: true)
 * @param {number} options.maxResults - Maximum number of results to return (default: 20)
 * @returns {Array} Filtered and sorted restaurants with local scores
 */
export function filterForLocalRestaurants(restaurants, options = {}) {
    const {
        minLocalScore = 30,
        excludeChains = true,
        maxResults = 20
    } = options;
    
    if (!Array.isArray(restaurants)) {
        return [];
    }
    
    // Add local scores to all restaurants
    const scoredRestaurants = restaurants.map(restaurant => ({
        ...restaurant,
        localScore: calculateLocalScore(restaurant),
        isChain: isChainRestaurant(restaurant.name)
    }));
    
    // Filter restaurants
    let filtered = scoredRestaurants.filter(restaurant => {
        // Exclude chains if requested
        if (excludeChains && restaurant.isChain) {
            return false;
        }
        
        // Exclude restaurants below minimum local score
        if (restaurant.localScore < minLocalScore) {
            return false;
        }
        
        return true;
    });
    
    // Sort by local score (descending) and then by rating if available
    filtered.sort((a, b) => {
        // Primary sort: local score
        if (b.localScore !== a.localScore) {
            return b.localScore - a.localScore;
        }
        
        // Secondary sort: rating (if available)
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
    });
    
    // Return top results
    return filtered.slice(0, maxResults);
}

/**
 * Enhanced version of findNearbyRestaurants that filters for local establishments
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude  
 * @param {number} radius - Search radius in meters
 * @param {string} keyword - Optional search keyword
 * @param {object} filterOptions - Local filtering options
 * @returns {Promise<object>} Result with filtered local restaurants
 */
export async function findNearbyLocalRestaurants(lat, lon, radius = 1000, keyword = '', filterOptions = {}) {
    // Import the original service dynamically to avoid circular dependencies
    const placesService = await import('./places.service.js');
    
    // Get all nearby restaurants first
    const result = await placesService.findNearbyRestaurants(lat, lon, radius, keyword);
    
    // Filter for local restaurants
    const localRestaurants = filterForLocalRestaurants(result.restaurants, filterOptions);
    
    return {
        ...result,
        restaurants: localRestaurants,
        filteredCount: result.restaurants.length,
        localCount: localRestaurants.length,
        filterCriteria: {
            minLocalScore: filterOptions.minLocalScore || 30,
            excludeChains: filterOptions.excludeChains !== false,
            maxResults: filterOptions.maxResults || 20
        }
    };
}

export { isChainRestaurant, calculateLocalScore };